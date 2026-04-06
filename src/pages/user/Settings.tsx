import {
  Avatar,
  Box,
  Button,
  Card,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Textarea,
  Typography,
} from "@mui/joy";
import { ResponseType, User } from "../../user";
import { Edit, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { isValidEmail } from "../../utilities/defaults";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { smbAPI } from "../../service/api/api";
import { useUsers } from "../../context/Users";

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
  const { changePassword } = useUsers() as any;
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });

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

  return (
    <Card sx={{ width: "700px", margin: "0 auto", gap: 3, "@media (max-width: 800px)": { width: "90%" } }}>
      <Typography level="h4">Settings</Typography>
      <Divider />

      {/* ── Profile Picture ── */}
      <Box>
        <FormLabel sx={{ mb: 1 }}>Profile Picture</FormLabel>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={userValue?.profilePic}
            sx={{ width: 72, height: 72 }}
          >
            {userValue?.firstname?.[0]}
          </Avatar>
          <Box>
            <Button
              component="label"
              variant="outlined"
              color="neutral"
              size="sm"
              disabled={picUploading}
              loading={picUploading}
            >
              {picUploading ? "Uploading..." : "Upload photo"}
              <input type="file" accept="image/*" hidden onChange={handleProfilePic} disabled={picUploading} />
            </Button>
            {userValue?.profilePic && (
              <Button
                variant="plain"
                color="danger"
                size="sm"
                onClick={() => setUserValue((prev) => ({ ...prev, profilePic: "" }))}
                sx={{ ml: 1 }}
              >
                Remove
              </Button>
            )}
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
              JPG, PNG, GIF — max 5MB
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* ── Name ── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Firstname</FormLabel>
          <Input required name="firstname" placeholder="Your firstname" value={userValue?.firstname || ""} onChange={handleInput} />
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Lastname</FormLabel>
          <Input name="lastname" placeholder="Your lastname" value={userValue?.lastname || ""} onChange={handleInput} />
        </FormControl>
      </Box>

      {/* ── Age & Gender ── */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Age</FormLabel>
          <Input
            name="age" type="number"
            value={userValue?.age || ""}
            onChange={(e) => setUserValue((prev) => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder="Your age"
            slotProps={{ input: { min: 5, max: 120 } }}
          />
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Gender</FormLabel>
          <Select
            value={userValue?.gender || null}
            onChange={(_, v) => setUserValue((prev) => ({ ...prev, gender: v as any }))}
            placeholder="Select"
          >
            {GENDER_OPTIONS.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* ── Email ── */}
      <Box sx={{ position: "relative" }}>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input required name="email" placeholder="Your email" disabled value={userValue?.email || ""} />
        </FormControl>
        {userValue?.loginType !== "google" && (
          <IconButton onClick={() => setEmailModal(true)} sx={{ position: "absolute", top: "22px", right: 0 }}>
            <Edit />
          </IconButton>
        )}
      </Box>

      {/* ── Password ── */}
      {userValue?.loginType !== "google" && (
        <Box sx={{ position: "relative" }}>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input required type="password" disabled value="*********" />
          </FormControl>
          <IconButton onClick={() => setPasswordModal(true)} sx={{ position: "absolute", top: "22px", right: 0 }}>
            <Edit />
          </IconButton>
        </Box>
      )}

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography level="title-md">Public Profile</Typography>
        <FormControl>
          <FormLabel>Handle</FormLabel>
          <Input
            name="handle"
            placeholder="yourname"
            value={userValue?.handle || ""}
            onChange={handleInput}
            startDecorator="@"
          />
          <FormHelperText>
            Public profiles live at `/u/{userValue?.handle || "yourname"}` and require a unique handle.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            name="bio"
            minRows={3}
            placeholder="Tell people what you love to watch."
            value={userValue?.bio || ""}
            onChange={(e) => setUserValue((prev) => ({ ...prev, bio: e.target.value }))}
          />
        </FormControl>
        {!!userValue?.handle && (
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => window.open(`/u/${userValue.handle}`, "_blank")}
          >
            Open Public Profile
          </Button>
        )}
      </Box>

      <Divider />

      <Box sx={{
        display: "flex",
        pt: 1,
        position: "sticky",
        bottom: 0,
        background: "inherit",
        zIndex: 10,
        borderTop: "1px solid",
        borderColor: "divider",
        mt: 2,
        pb: 2
      }}>
        <Button
        sx={{
          width: '90%',
          margin: '0 auto',
        }}
          type="submit"
          disabled={updatedMyselfData?.isLoading || !userValue?.firstname?.trim()}
        >
          {updatedMyselfData?.isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>

      {/* ── Email Modal ── */}
      <Modal open={emailModal} onClose={() => { setEmailModal(false); setUserValue({ ...userValue, email: (myselfData?.data as User).email }); }}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Change Email</DialogTitle>
          <FormHelperText>You'll need to re-verify your new email address.</FormHelperText>
          <Divider />
          <DialogContent sx={{ gap: 2 }}>
            <FormControl color={updatedMyselfData?.isError ? "danger" : "neutral"}>
              <FormLabel>New Email</FormLabel>
              <Input value={userValue?.email || ""} name="email" onChange={handleInput} required />
              <FormHelperText>
                {updatedMyselfData?.isError && "Email is already taken"}
                {!isValidEmail(userValue?.email || "") && "Invalid email"}
              </FormHelperText>
            </FormControl>
            <Button
              disabled={updatedMyselfData?.isLoading || userValue?.email === (myselfData?.data as User)?.email || !isValidEmail(userValue?.email || "")}
              onClick={() => { updateMyself(userValue); }}
            >
              {updatedMyselfData?.isLoading ? "Saving..." : "Update"}
            </Button>
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* ── Password Modal ── */}
      <Modal open={passwordModal} onClose={() => { setPasswordModal(false); setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" }); }}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Change Password</DialogTitle>
          <Divider />
          <DialogContent>
            <FormControl required>
              <FormLabel>Current Password</FormLabel>
              <Input startDecorator={<Lock />} value={passwords.oldPassword} name="oldPassword" onChange={handlePasswordInput}
                type={passwordVisibility ? "text" : "password"}
                endDecorator={<IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff /> : <Visibility />}</IconButton>}
              />
            </FormControl>
            <FormControl required
              color={passwords.newPassword.trim() && passwords.newPassword.length < 8 ? "warning" : passwords.newPasswordConfirm !== passwords.newPassword && passwords.newPasswordConfirm.trim().length >= 8 && passwords.newPassword.trim().length >= 8 ? "danger" : "neutral"}
            >
              <FormLabel>New Password</FormLabel>
              <Input startDecorator={<Lock />} value={passwords.newPassword} name="newPassword" onChange={handlePasswordInput}
                type={passwordVisibility ? "text" : "password"}
                endDecorator={<IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff /> : <Visibility />}</IconButton>}
              />
              <FormHelperText>
                {passwords.newPassword.trim() && passwords.newPassword.length < 8 && "Too short"}
                {passwords.newPasswordConfirm.trim().length >= 8 && passwords.newPasswordConfirm !== passwords.newPassword && passwords.newPassword.trim().length >= 8 && "Passwords don't match"}
              </FormHelperText>
            </FormControl>
            <FormControl required>
              <FormLabel>Confirm New Password</FormLabel>
              <Input startDecorator={<Lock />} value={passwords.newPasswordConfirm} name="newPasswordConfirm" onChange={handlePasswordInput}
                type={passwordVisibility ? "text" : "password"}
                endDecorator={<IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff /> : <Visibility />}</IconButton>}
              />
            </FormControl>
            <Button
              onClick={async () => {
                if (changePassword) await changePassword(passwords.oldPassword, passwords.newPassword);
                setPasswordModal(false);
                setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
              }}
              disabled={passwords.newPasswordConfirm.trim().length < 8 || passwords.newPasswordConfirm !== passwords.newPassword || passwords.newPassword.trim().length < 8 || passwords.oldPassword.trim().length < 8}
              sx={{ background: "rgb(255,216,77)", color: "black", "&:hover": { background: "rgb(230,195,60)" } }}
            >
              Update Password
            </Button>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Card>
  );
}

export default Settings;
