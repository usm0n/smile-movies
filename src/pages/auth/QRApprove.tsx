import { Box, Button, CircularProgress, Typography } from "@mui/joy";
import { CheckCircleOutline, QrCode2 } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import { useUsers } from "../../context/Users";

function QRApprove() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, myselfData } = useUsers();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const approve = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const res = await qrAPI.approve(token);
      setStatus("done");
      setMessage(res.success ? "Device approved! The other screen will log in now." : "Invalid or expired QR code.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "QR code not found or expired.");
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
        <QrCode2 sx={{ fontSize: 56, color: "rgb(255,220,92)" }} />
        <Typography level="h3">Log in to approve this device</Typography>
        <Typography level="body-md" sx={{ color: "text.tertiary", textAlign: "center", maxWidth: 360 }}>
          You need to be logged in on this device to approve a QR login for another device.
        </Typography>
        <Button onClick={() => navigate("/auth/login")}>Log in</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
      {status === "idle" && (
        <>
          <QrCode2 sx={{ fontSize: 56, color: "rgb(255,220,92)" }} />
          <Typography level="h3">Approve QR Login</Typography>
          <Typography level="body-md" sx={{ color: "text.tertiary", textAlign: "center", maxWidth: 360 }}>
            Another device is trying to log in to your account using this QR code. Tap Approve to grant access.
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={approve} size="lg" sx={{ background: "rgb(255,220,92)", color: "black" }}>
              Approve Login
            </Button>
            <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </Box>
        </>
      )}

      {status === "loading" && <CircularProgress size="lg" />}

      {status === "done" && (
        <>
          <CheckCircleOutline sx={{ fontSize: 56, color: "rgb(100,220,120)" }} />
          <Typography level="h3" sx={{ color: "rgb(100,220,120)" }}>Done!</Typography>
          <Typography level="body-md" sx={{ color: "text.tertiary", textAlign: "center", maxWidth: 360 }}>
            {message}
          </Typography>
          <Button onClick={() => navigate("/")} variant="outlined">Go Home</Button>
        </>
      )}

      {status === "error" && (
        <>
          <Typography level="h3" sx={{ color: "danger.400" }}>Failed</Typography>
          <Typography level="body-md" sx={{ color: "text.tertiary", textAlign: "center" }}>{message}</Typography>
          <Button onClick={() => navigate("/")} variant="outlined">Go Home</Button>
        </>
      )}
    </Box>
  );
}

export default QRApprove;
