import {
  Box,
  Button,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { PrivacySettings as PrivacySettingsType, User } from "../../user";
import { WarningRounded } from "@mui/icons-material";
import { useState } from "react";

function PrivacySettings({
  userValue,
  setUserValue,
  updateMyself,
  updatedMyselfData,
}: {
  userValue: User;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
  updateMyself: (user: User) => void;
  updatedMyselfData: { isLoading: boolean } | null;
}) {
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <Card
      sx={{
        width: "700px",
        margin: "0 auto",
        "@media (max-width: 800px)": {
          width: "90%",
        },
      }}
      >
      <Typography level="h4">Privacy Settings</Typography>
      <Typography level="body-sm" textColor="neutral.400">
        Choose what other people can see before public profiles and social features expand.
      </Typography>
      <Divider />
      {[
        { key: "showWatchlist", label: "Show my watchlist to others" },
        { key: "showFavorites", label: "Show my favorites to others" },
      ].map(({ key, label }) => (
        <Box
          key={key}
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}
        >
          <Typography level="body-sm">{label}</Typography>
          <Button
            size="sm"
            variant={(userValue?.privacy as any)?.[key] ? "solid" : "outlined"}
            color={(userValue?.privacy as any)?.[key] ? "primary" : "neutral"}
            onClick={() =>
              setUserValue((prev) => ({
                ...prev,
                privacy: {
                  ...(prev.privacy as PrivacySettingsType),
                  [key]: !(prev.privacy as any)?.[key],
                },
              }))
            }
            sx={{ minWidth: 56 }}
          >
            {(userValue?.privacy as any)?.[key] ? "On" : "Off"}
          </Button>
        </Box>
      ))}
      <Divider />
      <Button
        onClick={() => updateMyself(userValue)}
        loading={updatedMyselfData?.isLoading}
      >
        Save Privacy Settings
      </Button>
      <Divider />
      <Box display={"flex"} gap={"10px"} alignItems={"center"}>
        <Typography level="title-md">Created at:</Typography>
        <Typography>{userValue?.createdAt}</Typography>
      </Box>
      <Box display={"flex"} gap={"10px"} alignItems={"center"}>
        <Typography level="title-md">Signed in with:</Typography>
        <Typography>
          {userValue.loginType == "google" ? "Google" : "Email & Password"}
        </Typography>
      </Box>
      <Button
        onClick={() => setDeleteModal(true)}
        color="danger"
        variant="outlined"
      >
        Delete account
      </Button>
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalDialog minWidth={500} variant="outlined" role="alertdialog">
          <DialogTitle>
            <WarningRounded />
            Confirmation
          </DialogTitle>
          <Divider />
          <DialogContent>
            Are you sure you want to delete your account? Remember, this cannot
            be undone!
          </DialogContent>
          <DialogActions>
            <Button disabled variant="solid" color="danger" onClick={() => {}}>
              Delete my account
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setDeleteModal(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Card>
  );
}

export default PrivacySettings;
