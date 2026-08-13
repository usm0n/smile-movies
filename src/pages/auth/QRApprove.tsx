import { Box } from "@mui/joy";
import { CheckCircleOutline, QrCode2, WarningRounded } from "../../components/ui/icons";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import { useUsers } from "../../context/Users";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

function QRApprove() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useUsers();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const approve = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const res = await qrAPI.approve(token);
      setStatus("done");
      setMessage(
        res.success
          ? "Device approved. The other screen will sign in now."
          : "Invalid or expired QR code.",
      );
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "QR code not found or expired.");
    }
  };

  const shell = (children: React.ReactNode) => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: "var(--sm-nav-height)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>{children}</Box>
    </Box>
  );

  if (!isAuthenticated) {
    return shell(
      <EmptyState
        icon={QrCode2}
        title="Sign in to approve this device"
        description="You need to be signed in on this device to approve a QR login for another one."
        action={<Button onClick={() => navigate("/auth/login")}>Sign In</Button>}
      />,
    );
  }

  if (status === "done") {
    return shell(
      <EmptyState
        icon={CheckCircleOutline}
        title="Device approved"
        description={message}
        action={
          <Button variant="outlined" color="neutral" onClick={() => navigate("/")}>
            Go home
          </Button>
        }
      />,
    );
  }

  if (status === "error") {
    return shell(
      <EmptyState
        icon={WarningRounded}
        title="Approval failed"
        description={message}
        action={
          <Button variant="outlined" color="neutral" onClick={() => navigate("/")}>
            Go home
          </Button>
        }
      />,
    );
  }

  return shell(
    <EmptyState
      icon={QrCode2}
      title="Approve QR sign-in"
      description="Another device is trying to sign in to your account with this QR code. Approve only if it's you."
      action={
        <>
          <Button loading={status === "loading"} onClick={approve}>
            Approve
          </Button>
          <Button variant="outlined" color="neutral" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </>
      }
    />,
  );
}

export default QRApprove;
