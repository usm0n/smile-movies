import { Box, Input, Option, Select, Textarea, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import AvatarPanel from "../../components/account/AvatarPanel";
import { ResponseType, User } from "../../user";
import {
  Delete,
  LaunchRounded,
  Lock,
  Mail,
  Visibility,
  VisibilityOff,
  WarningRounded,
} from "../../components/ui/icons";
import { isValidEmail } from "../../utilities/defaults";
import React, { useState } from "react";
import { toast } from "../../components/ui/toast";
import { useUsers } from "../../context/Users";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/Locale";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "../../utilities/localePrefs";

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
  const {
    changePassword,
    resendTokenVerification,
    resendTokenVerificationData,
    deleteMyself,
    logout,
  } = useUsers();

  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const resetPasswords = () =>
    setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyself();
      toast.success("Your account has been deleted.");
      await logout();
    } catch {
      // The interceptor already surfaced the failure.
    } finally {
      setDeleting(false);
    }
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
      <Panel
        title={t("settings.language.title")}
        description={t("settings.language.description")}
        footerHint={t("settings.language.contentNote")}
      >
        <Field label={t("settings.language.label")}>
          <Select
            value={locale}
            onChange={(_event, value) => {
              if (!value || value === locale) return;
              setLocale(value as Locale);
              // Interface strings re-render on their own, but titles and
              // overviews already fetched from TMDB are cached in the old
              // language. Reloading is what makes the whole page agree; the
              // choice is persisted before this runs, so it survives.
              window.location.reload();
            }}
          >
            {SUPPORTED_LOCALES.map((option) => (
              <Option key={option} value={option}>
                {LOCALE_LABELS[option]}
              </Option>
            ))}
          </Select>
        </Field>
      </Panel>

      {!userValue?.isVerified && userValue?.email && (
        <Panel
          title="Email not verified"
          description="Verify your email to unlock full access. We'll send a code plus a one-click verify link."
          footerHint={
            verifySent ? "Verification email sent — check your inbox." : undefined
          }
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

      <AvatarPanel
        user={userValue}
        onChange={(profilePic) =>
          setUserValue((prev) => ({ ...prev, profilePic }))
        }
      />

      <Panel
        title="Profile"
        description="Your name is shown on reviews and your public profile."
        footerHint="Changes apply to every device."
        footer={
          <Button
            loading={updatedMyselfData?.isLoading}
            disabled={!userValue?.firstname?.trim()}
            onClick={() => updateMyself(userValue)}
          >
            Save changes
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
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
              onChange={(_, v) =>
                setUserValue((prev) => ({
                  ...prev,
                  gender: (v as User["gender"]) || undefined,
                }))
              }
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
        footerHint={
          userValue?.handle
            ? `smile-movies.uz/u/${userValue.handle}`
            : "Pick a handle to publish it."
        }
        footer={
          <>
            {!!userValue?.handle && (
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<LaunchRounded sx={{ fontSize: 15 }} />}
                onClick={() => window.open(`/u/${userValue.handle}`, "_blank")}
              >
                View profile
              </Button>
            )}
            <Button
              loading={updatedMyselfData?.isLoading}
              disabled={!userValue?.firstname?.trim()}
              onClick={() => updateMyself(userValue)}
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
              onChange={(e) =>
                setUserValue((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </Field>
        </Box>
      </Panel>

      <Panel
        title="Sign-in"
        description="Change the primary email address and password used to sign in. Manage every other method under Login connections."
        footerHint="Adding Google, Apple or a phone number lives in Login connections."
        footer={
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => navigate("/user/connections")}
          >
            Manage connections
          </Button>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field label="Primary email">
            <Input
              name="email"
              disabled
              value={userValue?.email || "No email on this account"}
              endDecorator={
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setEmailModal(true)}
                >
                  Change
                </Button>
              }
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              disabled
              value="•••••••••"
              endDecorator={
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setPasswordModal(true)}
                >
                  Change
                </Button>
              }
            />
          </Field>
        </Box>
      </Panel>


      {/* ── Danger zone ── */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "danger.outlinedBorder",
          borderRadius: "lg",
          backgroundColor: "background.surface",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography level="title-md" sx={{ fontWeight: 600 }}>
            Delete account
          </Typography>
          <Typography level="body-sm" sx={{ mt: 0.5, maxWidth: 620 }}>
            Permanently deletes your profile, watchlist, ratings, reviews, devices
            and avatar. This cannot be undone.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "danger.outlinedBorder",
            backgroundColor: "background.level1",
          }}
        >
          <Typography level="body-xs">
            Member since {userValue?.createdAt || "—"}.
          </Typography>
          <Button
            color="danger"
            variant="outlined"
            startDecorator={<Delete sx={{ fontSize: 16 }} />}
            onClick={() => setDeleteModal(true)}
          >
            Delete account
          </Button>
        </Box>
      </Box>

      {/* ── Email dialog ── */}
      <Dialog
        open={emailModal}
        onClose={() => {
          setEmailModal(false);
          setUserValue({ ...userValue, email: (myselfData?.data as User).email });
        }}
        title="Change primary email"
        description="You'll need to verify the new address before it takes effect."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setEmailModal(false);
                setUserValue({
                  ...userValue,
                  email: (myselfData?.data as User).email,
                });
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
              onClick={() => {
                updateMyself(userValue);
                setEmailModal(false);
              }}
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
          resetPasswords();
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
                resetPasswords();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (changePassword)
                  await changePassword(passwords.oldPassword, passwords.newPassword);
                setPasswordModal(false);
                resetPasswords();
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

      {/* ── Delete account dialog ── */}
      <Dialog
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteConfirmText("");
        }}
        title="Delete your account?"
        description="This permanently removes your account and everything in it. There is no undo."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setDeleteModal(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              loading={deleting}
              disabled={deleteConfirmText !== "delete my account"}
              onClick={handleDeleteAccount}
            >
              Delete account
            </Button>
          </>
        }
      >
        <Field
          label="Type “delete my account” to confirm"
          helper="This is intentionally tedious — deletion cannot be reversed."
        >
          <Input
            value={deleteConfirmText}
            onChange={(event) => setDeleteConfirmText(event.target.value)}
            placeholder="delete my account"
            autoComplete="off"
          />
        </Field>
      </Dialog>

    </Box>
  );
}

export default Settings;
