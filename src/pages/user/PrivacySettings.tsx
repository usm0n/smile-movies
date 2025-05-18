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
import { User } from "../../user";
import { WarningRounded } from "@mui/icons-material";
import { useState } from "react";

function PrivacySettings({ userValue }: { userValue: User }) {
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
