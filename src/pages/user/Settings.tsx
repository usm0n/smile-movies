import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
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
  Typography,
} from "@mui/joy";
import { FavoriteMedia, NotificationPreferences, PrivacySettings, ResponseType, User } from "../../user";
import { Edit, Lock, Search, Visibility, VisibilityOff } from "@mui/icons-material";
import { isValidEmail } from "../../utilities/defaults";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { smbAPI, tmdbAPI } from "../../service/api/api";
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
  const { changePassword, changePasswordData } = useUsers() as any;
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaResults, setMediaResults] = useState<FavoriteMedia[]>([]);
  const [mediaSearchLoading, setMediaSearchLoading] = useState(false);
  const searchTimeout = useRef<any>(null);

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

  // TMDB search for favorites
  useEffect(() => {
    if (!mediaSearch.trim()) { setMediaResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setMediaSearchLoading(true);
      try {
        const res = await tmdbAPI.get(`/search/multi?query=${encodeURIComponent(mediaSearch)}&page=1`);
        const results: FavoriteMedia[] = (res.data?.results || [])
          .filter((r: any) => (r.media_type === "movie" || r.media_type === "tv") && (r.title || r.name))
          .slice(0, 8)
          .map((r: any) => ({
            id: String(r.id), title: r.title || r.name,
            type: r.media_type as "movie" | "tv",
            poster: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : undefined,
          }));
        setMediaResults(results);
      } catch (_) {}
      setMediaSearchLoading(false);
    }, 350);
  }, [mediaSearch]);

  const addFavorite = (media: FavoriteMedia) => {
    if ((userValue.favoriteMovies || []).length >= 3) return;
    if ((userValue.favoriteMovies || []).find((m) => m.id === media.id)) return;
    setUserValue((prev) => ({ ...prev, favoriteMovies: [...(prev.favoriteMovies || []), media] }));
    setMediaSearch(""); setMediaResults([]);
  };

  const removeFavorite = (id: string) => {
    setUserValue((prev) => ({ ...prev, favoriteMovies: (prev.favoriteMovies || []).filter((m) => m.id !== id) }));
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
      <Box sx={{ display: "flex", gap: 2 }}>
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

      {/* ── Favorite Movies ── */}
      <Box>
        <FormLabel>Favorite Movies & TV Shows</FormLabel>
        <Typography level="body-xs" textColor="neutral.400" sx={{ mb: 1 }}>
          Up to 3 — used by SmileAI for recommendations
        </Typography>

        {(userValue?.favoriteMovies || []).length < 3 && (
          <Box sx={{ position: "relative" }}>
            <Input
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              placeholder="Search a movie or show..."
              startDecorator={<Search />}
              disabled={mediaSearchLoading}
            />
            {mediaResults.length > 0 && (
              <Card sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, maxHeight: 260, overflowY: "auto", mt: 0.5, p: 0.5, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {mediaResults.map((media) => (
                  <Box key={media.id} onClick={() => addFavorite(media)}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, borderRadius: 8, cursor: "pointer", "&:hover": { background: "rgba(255,216,77,0.1)" } }}
                  >
                    {media.poster
                      ? <Box component="img" src={media.poster} sx={{ width: 32, height: 48, borderRadius: 4, objectFit: "cover" }} />
                      : <Box sx={{ width: 32, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} />
                    }
                    <Box>
                      <Typography level="body-sm" fontWeight={600}>{media.title}</Typography>
                      <Chip size="sm" variant="soft" color={media.type === "movie" ? "primary" : "success"} sx={{ fontSize: 10 }}>
                        {media.type === "movie" ? "Movie" : "TV"}
                      </Chip>
                    </Box>
                  </Box>
                ))}
              </Card>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
          {(userValue?.favoriteMovies || []).map((media) => (
            <Chip
              key={media.id}
              startDecorator={media.poster ? <Avatar src={media.poster} size="sm" /> : undefined}
              endDecorator={<IconButton size="sm" onClick={() => removeFavorite(media.id)}>✕</IconButton>}
              variant="soft" color="primary"
            >
              {media.title}
            </Chip>
          ))}
          {(userValue?.favoriteMovies || []).length === 0 && (
            <Typography level="body-xs" textColor="neutral.400">No favorites set</Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* ── Notifications ── */}
      <Box>
        <Typography level="title-md" sx={{ mb: 1.5 }}>Notifications</Typography>
        {[
          { key: "emailNotifications", label: "Email notifications" },
          { key: "newReleases", label: "New release alerts" },
          { key: "recommendations", label: "Personalized recommendations" },
          { key: "watchlistUpdates", label: "Watchlist updates" },
        ].map(({ key, label }) => (
          <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography level="body-sm">{label}</Typography>
            <Button
              size="sm"
              variant={(userValue?.notifications as any)?.[key] ? "solid" : "outlined"}
              color={(userValue?.notifications as any)?.[key] ? "success" : "neutral"}
              onClick={() =>
                setUserValue((prev) => ({
                  ...prev,
                  notifications: { ...(prev.notifications as NotificationPreferences), [key]: !(prev.notifications as any)?.[key] },
                }))
              }
              sx={{ minWidth: 56 }}
            >
              {(userValue?.notifications as any)?.[key] ? "On" : "Off"}
            </Button>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* ── Privacy ── */}
      <Box>
        <Typography level="title-md" sx={{ mb: 1.5 }}>Privacy</Typography>
        {[
          { key: "showWatchlist", label: "Show my watchlist to others" },
          { key: "showFavorites", label: "Show my favorites to others" },
        ].map(({ key, label }) => (
          <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography level="body-sm">{label}</Typography>
            <Button
              size="sm"
              variant={(userValue?.privacy as any)?.[key] ? "solid" : "outlined"}
              color={(userValue?.privacy as any)?.[key] ? "primary" : "neutral"}
              onClick={() =>
                setUserValue((prev) => ({
                  ...prev,
                  privacy: { ...(prev.privacy as PrivacySettings), [key]: !(prev.privacy as any)?.[key] },
                }))
              }
              sx={{ minWidth: 56 }}
            >
              {(userValue?.privacy as any)?.[key] ? "On" : "Off"}
            </Button>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
        <Button
          type="submit"
          disabled={updatedMyselfData?.isLoading || !userValue?.firstname?.trim()}
          sx={{ background: "rgb(255,200,0)", "&:hover": { background: "rgb(255,200,0)", opacity: 0.8 } }}
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
            <FormControl color={updatedMyselfData?.isConflict ? "danger" : "neutral"}>
              <FormLabel>New Email</FormLabel>
              <Input value={userValue?.email || ""} name="email" onChange={handleInput} required />
              <FormHelperText>
                {updatedMyselfData?.isConflict && "Email is already taken"}
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
