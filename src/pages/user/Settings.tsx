import {
  Avatar,
  Box,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import { ResponseType, User } from "../../user";
import { Edit, Lock, LockOpen, Mail, Visibility, VisibilityOff, WarningRounded } from "../../components/ui/icons";
import { isValidEmail } from "../../utilities/defaults";
import React, { useState } from "react";
import { toast } from "../../components/ui/toast";
import { smbAPI } from "../../service/api/api";
import { useUsers } from "../../context/Users";
import { useNavigate } from "react-router-dom";
import PinLockModal from "../../components/account/PinLockModal";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function Settings({
  userValue,
  updatedMyselfData,
  setUserValue,
  myselfData,
  updateMyself,
}: {
  userValue: User;
  updatedMyselfData: ResponseType | null;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
  myselfData: ResponseType | null;
  updateMyself: (user: User) => void;
}) {
  const { changePassword, resendTokenVerification, resendTokenVerificationData } = useUsers() as any;
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [pinModal, setPinModal] = useState<"setup" | "change" | null>(null);
  const pinEnabled = userValue?.accountPin?.enabled;

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Profile picture: upload to Firebase Storage via backend, store URL
  const [picUploading, setPicUploading] = useState(false);
  const handleProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setPicUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const mimeType = file.type;
        const res = await smbAPI.post("/users/upload-profile-pic", { base64, mimeType });
        setUserValue((prev) => ({ ...prev, profilePic: res.data.url }));
      } catch (_) {
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setPicUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const passwordVisibilityToggle = (
    <IconButton
      label={passwordVisibility ? "Hide password" : "Show password"}
      size="sm"
      onClick={() => setPasswordVisibility(!passwordVisibility)}
    >
      {passwordVisibility ? (
        <VisibilityOff sx={{ fontSize: 16 }} />
      ) : (
        <Visibility sx={{ fontSize: 16 }} />
      )}
    </IconButton>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {!userValue?.isVerified && (
        <Panel
          title="Email not verified"
          description="Verify your email to unlock full access. We'll send a code plus a one-click verify link."
          footerHint={verifySent ? "Verification email sent — check your inbox." : undefined}
          footer={
            <>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => navigate("/auth/verify-email")}
              >
                Enter code
              </Button>
              <Button
                startDecorator={<Mail sx={{ fontSize: 16 }} />}
                loading={resendTokenVerificationData?.isLoading}
                onClick={async () => {
                  await resendTokenVerification();
                  setVerifySent(true);
                }}
              >
                Send email
              </Button>
            </>
          }
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningRounded sx={{ fontSize: 16, color: "warning.plainColor" }} />
            <Typography level="body-sm" sx={{ color: "warning.plainColor" }}>
              Some features stay locked until you confirm {userValue?.email}.
            </Typography>
          </Box>
        </Panel>
      )}

      <Panel
        title="Avatar"
        description="This is your avatar across Smile Movies. JPG, PNG or GIF, max 5MB."
        footerHint="Click upload to choose a square image."
        footer={
          <>
            {userValue?.profilePic && (
              <Button
                variant="outlined"
                color="danger"
                onClick={() => setUserValue((prev) => ({ ...prev, profilePic: "" }))}
              >
                Remove
              </Button>
            )}
            <Button
              component="label"
              variant="outlined"
              color="neutral"
              loading={picUploading}
            >
              Upload
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfilePic}
                disabled={picUploading}
              />
            </Button>
          </>
        }
      >
        <Avatar
          src={userValue?.profilePic}
          sx={{ width: 64, height: 64, borderRadius: "999px", fontSize: "1.25rem" }}
        >
          {userValue?.firstname?.[0]}
        </Avatar>
      </Panel>

      <Panel
        title="Profile"
        description="Your name is shown on reviews and your public profile."
        footerHint="Changes apply to every device."
        footer={
          <Button
            type="submit"
            loading={updatedMyselfData?.isLoading}
            disabled={!userValue?.firstname?.trim()}
          >
            Save changes
          </Button>
        }
      >
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <Field label="First name" required>
            <Input
              required
              name="firstname"
              placeholder="Your first name"
              value={userValue?.firstname || ""}
              onChange={handleInput}
            />
          </Field>
          <Field label="Last name">
            <Input
              name="lastname"
              placeholder="Your last name"
              value={userValue?.lastname || ""}
              onChange={handleInput}
            />
          </Field>
          <Field label="Age">
            <Input
              name="age"
              type="number"
              value={userValue?.age || ""}
              onChange={(e) =>
                setUserValue((prev) => ({
                  ...prev,
                  age: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              placeholder="Your age"
              slotProps={{ input: { min: 5, max: 120 } }}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={userValue?.gender || null}
              onChange={(_, v) => setUserValue((prev) => ({ ...prev, gender: v as any }))}
              placeholder="Select"
            >
              {GENDER_OPTIONS.map((o) => (
                <Option key={o.value} value={o.value}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Field>
        </Box>
      </Panel>

      <Panel
        title="Public profile"
        description={`Your profile lives at /u/${userValue?.handle || "yourname"} and needs a unique handle.`}
        footerHint={userValue?.handle ? `smile-movies.uz/u/${userValue.handle}` : "Pick a handle to publish it."}
        footer={
          <>
            {!!userValue?.handle && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => window.open(`/u/${userValue.handle}`, "_blank")}
              >
                View profile
              </Button>
            )}
            <Button
              type="submit"
              loading={updatedMyselfData?.isLoading}
              disabled={!userValue?.firstname?.trim()}
            >
              Save changes
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field label="Handle">
            <Input
              name="handle"
              placeholder="yourname"
              value={userValue?.handle || ""}
              onChange={handleInput}
              startDecorator="@"
            />
          </Field>
          <Field label="Bio" hint="Optional">
            <Textarea
              name="bio"
              minRows={3}
              placeholder="Tell people what you love to watch."
              value={userValue?.bio || ""}
              onChange={(e) => setUserValue((prev) => ({ ...prev, bio: e.target.value }))}
            />
          </Field>
        </Box>
      </Panel>

      <Panel
        title="Sign-in"
        description={
          userValue?.loginType === "google"
            ? "You sign in with Google, so email and password are managed there."
            : "Change the email address and password used to sign in."
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field label="Email">
            <Input
              name="email"
              disabled
              value={userValue?.email || ""}
              endDecorator={
                userValue?.loginType !== "google" ? (
                  <IconButton
                    label="Change email"
                    size="sm"
                    onClick={() => setEmailModal(true)}
                  >
                    <Edit sx={{ fontSize: 15 }} />
                  </IconButton>
                ) : undefined
              }
            />
          </Field>
          {userValue?.loginType !== "google" && (
            <Field label="Password">
              <Input
                type="password"
                disabled
                value="•••••••••"
                endDecorator={
                  <IconButton
                    label="Change password"
                    size="sm"
                    onClick={() => setPasswordModal(true)}
                  >
                    <Edit sx={{ fontSize: 15 }} />
                  </IconButton>
                }
              />
            </Field>
          )}
        </Box>
      </Panel>

      <Panel
        title="PIN lock"
        description={
          pinEnabled
            ? "Your account is protected with a PIN. The PIN is shared across devices; each device's lock timer lives in the Devices tab."
            : "Set a 4-digit PIN to lock your account when you step away. Per-device timing lives in the Devices tab."
        }
        footerHint={pinEnabled ? "PIN lock is on." : "PIN lock is off."}
        footer={
          pinEnabled ? (
            <>
              <Button
                startDecorator={<LockOpen sx={{ fontSize: 16 }} />}
                color="danger"
                variant="outlined"
                onClick={async () => {
                  const { profilesAPI } = await import(
                    "../../service/api/smb/profiles.api.service"
                  );
                  await profilesAPI.disablePin();
                  toast.success("PIN disabled");
                  window.location.reload();
                }}
              >
                Disable PIN
              </Button>
              <Button
                startDecorator={<Lock sx={{ fontSize: 16 }} />}
                variant="outlined"
                color="neutral"
                onClick={() => setPinModal("change")}
              >
                Change PIN
              </Button>
            </>
          ) : (
            <Button
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
              onClick={() => setPinModal("setup")}
            >
              Set up PIN
            </Button>
          )
        }
      />

      {/* ── Email dialog ── */}
      <Dialog
        open={emailModal}
        onClose={() => {
          setEmailModal(false);
          setUserValue({ ...userValue, email: (myselfData?.data as User).email });
        }}
        title="Change email"
        description="You'll need to verify the new address before it takes effect."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setEmailModal(false);
                setUserValue({ ...userValue, email: (myselfData?.data as User).email });
              }}
            >
              Cancel
            </Button>
            <Button
              loading={updatedMyselfData?.isLoading}
              disabled={
                userValue?.email === (myselfData?.data as User)?.email ||
                !isValidEmail(userValue?.email || "")
              }
              onClick={() => updateMyself(userValue)}
            >
              Update email
            </Button>
          </>
        }
      >
        <Field
          label="New email"
          error={
            updatedMyselfData?.isError
              ? "That email is already taken"
              : userValue?.email && !isValidEmail(userValue.email)
                ? "Enter a valid email address"
                : null
          }
        >
          <Input
            value={userValue?.email || ""}
            name="email"
            type="email"
            onChange={handleInput}
            required
          />
        </Field>
      </Dialog>

      {/* ── Password dialog ── */}
      <Dialog
        open={passwordModal}
        onClose={() => {
          setPasswordModal(false);
          setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
        }}
        title="Change password"
        description="Use at least 8 characters."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setPasswordModal(false);
                setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (changePassword)
                  await changePassword(passwords.oldPassword, passwords.newPassword);
                setPasswordModal(false);
                setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
              }}
              disabled={
                passwords.newPasswordConfirm.trim().length < 8 ||
                passwords.newPasswordConfirm !== passwords.newPassword ||
                passwords.newPassword.trim().length < 8 ||
                passwords.oldPassword.trim().length < 8
              }
            >
              Update password
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field label="Current password" required>
            <Input
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
              value={passwords.oldPassword}
              name="oldPassword"
              onChange={handlePasswordInput}
              type={passwordVisibility ? "text" : "password"}
              endDecorator={passwordVisibilityToggle}
            />
          </Field>
          <Field
            label="New password"
            required
            error={
              passwords.newPassword.trim() && passwords.newPassword.length < 8
                ? "Use at least 8 characters"
                : null
            }
          >
            <Input
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
              value={passwords.newPassword}
              name="newPassword"
              onChange={handlePasswordInput}
              type={passwordVisibility ? "text" : "password"}
              endDecorator={passwordVisibilityToggle}
            />
          </Field>
          <Field
            label="Confirm new password"
            required
            error={
              passwords.newPasswordConfirm.trim().length >= 8 &&
              passwords.newPasswordConfirm !== passwords.newPassword
                ? "Passwords don't match"
                : null
            }
          >
            <Input
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
              value={passwords.newPasswordConfirm}
              name="newPasswordConfirm"
              onChange={handlePasswordInput}
              type={passwordVisibility ? "text" : "password"}
              endDecorator={passwordVisibilityToggle}
            />
          </Field>
        </Box>
      </Dialog>

      {pinModal && (
        <PinLockModal
          open
          mode={pinModal}
          onSuccess={() => {
            setPinModal(null);
            toast.success("PIN saved");
            window.location.reload();
          }}
          onCancel={() => setPinModal(null)}
        />
      )}
    </Box>
  );
}

export default Settings;
