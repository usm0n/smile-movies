import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";

function NotLoggedIn({
  type,
  modalOpen,
  setModalOpen,
}: {
  type: "page" | "modal";
  modalOpen?: boolean;
  setModalOpen?: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  if (type == "page") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
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
            <Typography level="h1">You are not logged in</Typography>
            <Typography level="body-lg">
              Please log in to access this page.
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
              onClick={() => navigate("/auth/login")}
              sx={{
                width: "250px",
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/auth/register")}
              sx={{
                width: "250px",
              }}
            >
              Sign up
            </Button>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => navigate("/")}
              sx={{
                width: "250px",
              }}
            >
              Go back
            </Button>
          </Box>
        </Box>
      </Box>
    );
  } else if (type == "modal") {
    return (
      <Modal open={modalOpen || false} onClose={() => setModalOpen?.(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>You are not logged in</DialogTitle>
          <DialogContent>Please log in to access this feature.</DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              "& > *": {
                width: "100%",
              },
            }}
          >
            <Button onClick={() => navigate("/auth/login")}>Login</Button>
            <Button onClick={() => navigate("/auth/register")}>Sign up</Button>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => setModalOpen?.(false)}
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    );
  }
}

export default NotLoggedIn;
