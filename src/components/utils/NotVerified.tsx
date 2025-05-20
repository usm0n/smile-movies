import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  Snackbar,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";

function NotVerified({
  type,
  modalOpen,
  setModalOpen,
}: {
  type: "page" | "snackbar" | "modal";
  modalOpen?: boolean;
  setModalOpen?: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const { myselfData, isVerified, setIsVerified } = useUsers();
  if (type == "page") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            alignItems: "center",
            gap: 4,
            width: "90%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography level="h2">Please, Verify your email</Typography>
            <Typography level="body-sm">
              You can't access this page until you verify your email.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: "column",
            }}
          >
            <Button
              onClick={() => navigate("/auth/verify-email")}
              sx={{
                width: "250px",
              }}
            >
              Verify now
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="soft"
              color="neutral"
            >
              Go home
            </Button>
          </Box>
        </Box>
      </Box>
    );
  } else if (type == "snackbar") {
    return (
      myselfData?.data &&
      !isVerified && (
        <Snackbar open={!isVerified || false}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <Typography level="title-md">
                Please verify your email address to unlock all features
              </Typography>
              <Typography level="body-md">
                We sent you a 6-digit code to your email address{" "}
                <Link>{(myselfData?.data as User)?.email}</Link>
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                "& > *": {
                  width: "100%",
                },
              }}
            >
              <Button
                onClick={() => {
                  navigate("/auth/verify-email");
                  setIsVerified(true);
                }}
              >
                Verify Now!
              </Button>
              <Button
                onClick={() => setIsVerified(true)}
                color="neutral"
                variant="soft"
              >
                Not now
              </Button>
            </Box>
          </Box>
        </Snackbar>
      )
    );
  } else if (type == "modal") {
    return (
      <Modal onClose={() => setModalOpen?.(false)} open={modalOpen || false}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Verify your email</DialogTitle>
          <DialogContent>
            You can't use this feature until you verify your email
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate("/auth/verify-email")}>
              Verify now
            </Button>
            <Button
              onClick={() => setModalOpen?.(false)}
              variant="soft"
              color="neutral"
            >
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    );
  }
}

export default NotVerified;
