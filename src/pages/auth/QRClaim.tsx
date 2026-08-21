import { Box } from "@mui/joy";
import { CheckCircleOutline, QrCode2, WarningRounded } from "../../components/ui/icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { qrAPI, QRTokenInfo } from "../../service/api/smb/qr.api.service";
import { deviceId, deviceName, deviceType, reload } from "../../utilities/defaults";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

/**
 * The landing page for a sign-in code shown on an approved device.
 *
 * Scanning the code with a phone camera opens this URL directly, so the flow
 * has to work here as well as inside the login screen's scanner. Claiming is
 * never automatic — the code grants full account access, so it takes a tap.
 */
function QRClaim() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<QRTokenInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    qrAPI
      .info(token)
      .then(setInfo)
      .catch(() => {
        setStatus("error");
        setMessage("That code is not valid, or it has already expired.");
      });
  }, [token]);

  const claim = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      await qrAPI.claim(token, {
        deviceId: deviceId(),
        deviceName: deviceName(),
        deviceType: deviceType(),
      });
      // The session cookie arrives on this response; a reload is what makes
      // the Users context pick it up.
      reload();
    } catch (error) {
      setStatus("error");
      setMessage(
        (error as { data?: { message?: string } })?.data?.message ||
          "That code could not be used.",
      );
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

  if (status === "error") {
    return shell(
      <EmptyState
        icon={WarningRounded}
        title="Sign-in failed"
        description={message}
        action={
          <Button variant="outlined" color="neutral" onClick={() => navigate("/auth/login")}>
            Go to sign in
          </Button>
        }
      />,
    );
  }

  if (info && info.kind !== "grant") {
    return shell(
      <EmptyState
        icon={WarningRounded}
        title="Wrong kind of code"
        description="That code is a device waiting for approval, not a sign-in code. Open it on a device you're already signed in on."
        action={
          <Button variant="outlined" color="neutral" onClick={() => navigate(`/qr-approve/${token}`)}>
            Approve it instead
          </Button>
        }
      />,
    );
  }

  return shell(
    <EmptyState
      icon={info ? CheckCircleOutline : QrCode2}
      title={info ? `Sign in as ${info.accountName}?` : "Checking this code…"}
      description={
        info
          ? "This device will be added to the account and signed in. It stays signed in until you remove it from Settings → Devices."
          : "One moment."
      }
      action={
        info ? (
          <>
            <Button loading={status === "loading"} onClick={claim}>
              Sign in on this device
            </Button>
            <Button variant="outlined" color="neutral" onClick={() => navigate("/auth/login")}>
              Cancel
            </Button>
          </>
        ) : undefined
      }
    />,
  );
}

export default QRClaim;
