import { Box, Button, Chip, IconButton, Snackbar, Typography } from "@mui/joy";
import { Close, DevicesOther, CheckCircle, WarningRounded } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User, Device } from "../../user";
import { deviceId } from "../../utilities/defaults";

function HomeSnackbars() {
  const { myselfData, isAuthenticated } = useUsers();
  const navigate = useNavigate();
  const user = myselfData?.data as User | undefined;
  const currentDeviceId = deviceId();

  // Unverified device snackbar
  const [showVerifyDevice, setShowVerifyDevice] = useState(false);
  // New device notification (inactive device that joined recently)
  const [newDeviceAlert, setNewDeviceAlert] = useState<Device | null>(null);
  const shownDevicesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user || !myselfData?.isSuccess) return;

    // ── Unverified current device ─────────────────────────────────────────────
    const currentDevice = user.devices?.find((d) => d.deviceId === currentDeviceId);
    if (currentDevice && !currentDevice.isActive) {
      const dismissed = sessionStorage.getItem("verifyDeviceDismissed");
      if (!dismissed) setShowVerifyDevice(true);
    } else {
      setShowVerifyDevice(false);
    }

    // ── New inactive device joined recently (not current device) ─────────────
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    const newDevice = (user.devices || []).find((d) => {
      if (d.deviceId === currentDeviceId) return false;
      if (d.isActive) return false;
      if (shownDevicesRef.current.has(d.deviceId)) return false;
      const joinedAt = new Date(d.lastLogin || d.createdAt || 0).getTime();
      return joinedAt > tenMinAgo;
    });
    if (newDevice) {
      shownDevicesRef.current.add(newDevice.deviceId);
      setNewDeviceAlert(newDevice);
    }
  }, [isAuthenticated, myselfData?.isSuccess, user?.devices?.length, user?.isVerified]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Current device not activated */}
      <Snackbar
        open={showVerifyDevice}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ maxWidth: 420, zIndex: 1400 }}
        color="warning"
        variant="soft"
        startDecorator={<DevicesOther />}
        endDecorator={
          <IconButton size="sm" color="warning" variant="plain"
            onClick={() => { setShowVerifyDevice(false); sessionStorage.setItem("verifyDeviceDismissed", "1"); }}>
            <Close fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography level="title-sm">This device isn't activated</Typography>
          <Typography level="body-xs">
            Streaming and watchlist are limited. Activate via email or ask an active device to approve it.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Button size="sm" color="warning"
              onClick={() => { setShowVerifyDevice(false); navigate("/user/devices"); }}>
              Activate now
            </Button>
            <Button size="sm" variant="plain" color="warning"
              onClick={() => { setShowVerifyDevice(false); sessionStorage.setItem("verifyDeviceDismissed", "1"); }}>
              Skip for now
            </Button>
          </Box>
        </Box>
      </Snackbar>

      {/* New device joined the account */}
      {newDeviceAlert && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ maxWidth: 380, zIndex: 1400 }}
          color="neutral"
          variant="outlined"
          startDecorator={<WarningRounded sx={{ color: "warning.400" }} />}
          endDecorator={
            <IconButton size="sm" variant="plain" onClick={() => setNewDeviceAlert(null)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography level="title-sm">New device on your account</Typography>
            <Typography level="body-xs">
              <strong>{newDeviceAlert.deviceName}</strong>
              {newDeviceAlert.location?.country ? ` · ${newDeviceAlert.location.country}` : ""}
              {" "}is waiting for activation.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Button size="sm" color="success" startDecorator={<CheckCircle sx={{ fontSize: 14 }} />}
                onClick={() => { setNewDeviceAlert(null); navigate("/user/devices"); }}>
                Review
              </Button>
              <Button size="sm" variant="plain" color="neutral" onClick={() => setNewDeviceAlert(null)}>
                Dismiss
              </Button>
            </Box>
          </Box>
        </Snackbar>
      )}
    </>
  );
}

export default HomeSnackbars;
