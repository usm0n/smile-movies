import { Box, Button, IconButton, Snackbar, Typography } from "@mui/joy";
import { Close, WarningRounded, DevicesOther, CheckCircle } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User, Device } from "../../user";
import { deviceId } from "../../utilities/defaults";

function HomeSnackbars() {
  const { myselfData, isAuthenticated } = useUsers();
  const navigate = useNavigate();
  const user = myselfData?.data as User | undefined;

  // Unverified account banner
  const [showVerifyAccount, setShowVerifyAccount] = useState(false);
  // Unverified device banner (current device not active)
  const [showVerifyDevice, setShowVerifyDevice] = useState(false);
  // New device joined notification
  const [newDeviceAlert, setNewDeviceAlert] = useState<Device | null>(null);
  const [newDeviceShown, setNewDeviceShown] = useState<Set<string>>(new Set());

  const currentDeviceId = deviceId();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Verify account banner — show once per session
    if (!user.isVerified) {
      const dismissedAt = sessionStorage.getItem("verifyAccountDismissed");
      if (!dismissedAt) setShowVerifyAccount(true);
    }

    // Current device not activated
    const currentDevice = user.devices?.find((d) => d.deviceId === currentDeviceId);
    if (currentDevice && !currentDevice.isActive) {
      const dismissedAt = sessionStorage.getItem("verifyDeviceDismissed");
      if (!dismissedAt) setShowVerifyDevice(true);
    }

    // New device notification — devices that are inactive and were added recently (last 5 min)
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const newDevices = (user.devices || []).filter((d) => {
      const isRecent = new Date(d.lastLogin || d.createdAt || 0).getTime() > fiveMinAgo;
      const isNotCurrent = d.deviceId !== currentDeviceId;
      const notShown = !newDeviceShown.has(d.deviceId);
      return !d.isActive && isRecent && isNotCurrent && notShown;
    });
    if (newDevices.length > 0 && !newDeviceAlert) {
      setNewDeviceAlert(newDevices[0]);
    }
  }, [isAuthenticated, user?.isVerified, user?.devices?.length]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Unverified account */}
      <Snackbar
        open={showVerifyAccount}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ maxWidth: 420 }}
        color="warning"
        variant="soft"
        startDecorator={<WarningRounded />}
        endDecorator={
          <IconButton
            size="sm"
            color="warning"
            variant="plain"
            onClick={() => { setShowVerifyAccount(false); sessionStorage.setItem("verifyAccountDismissed", "1"); }}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography level="title-sm">Verify your email address</Typography>
          <Typography level="body-xs">
            Some features are limited until your account is verified.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Button
              size="sm"
              color="warning"
              onClick={() => { setShowVerifyAccount(false); navigate("/auth/verify"); }}
            >
              Verify now
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="warning"
              onClick={() => { setShowVerifyAccount(false); sessionStorage.setItem("verifyAccountDismissed", "1"); }}
            >
              Skip for now
            </Button>
          </Box>
        </Box>
      </Snackbar>

      {/* Unverified device */}
      <Snackbar
        open={showVerifyDevice && !showVerifyAccount}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ maxWidth: 420 }}
        color="warning"
        variant="soft"
        startDecorator={<DevicesOther />}
        endDecorator={
          <IconButton
            size="sm"
            color="warning"
            variant="plain"
            onClick={() => { setShowVerifyDevice(false); sessionStorage.setItem("verifyDeviceDismissed", "1"); }}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography level="title-sm">Activate this device</Typography>
          <Typography level="body-xs">
            This device has limited access. Activate via email or ask an active device to approve it in Settings → Devices.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Button
              size="sm"
              color="warning"
              onClick={() => { setShowVerifyDevice(false); navigate("/user/devices"); }}
            >
              Activate now
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="warning"
              onClick={() => { setShowVerifyDevice(false); sessionStorage.setItem("verifyDeviceDismissed", "1"); }}
            >
              Skip for now
            </Button>
          </Box>
        </Box>
      </Snackbar>

      {/* New device joined your account */}
      {newDeviceAlert && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ maxWidth: 380 }}
          color="neutral"
          variant="outlined"
          startDecorator={<DevicesOther sx={{ color: "warning.400" }} />}
          endDecorator={
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => {
                setNewDeviceShown((s) => new Set([...s, newDeviceAlert.deviceId]));
                setNewDeviceAlert(null);
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography level="title-sm">New device accessing your account</Typography>
            <Typography level="body-xs">
              <strong>{newDeviceAlert.deviceName}</strong> ({newDeviceAlert.deviceType}
              {newDeviceAlert.location?.country ? ` · ${newDeviceAlert.location.country}` : ""}) is waiting for activation.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Button
                size="sm"
                color="success"
                startDecorator={<CheckCircle sx={{ fontSize: 14 }} />}
                onClick={() => {
                  setNewDeviceShown((s) => new Set([...s, newDeviceAlert.deviceId]));
                  setNewDeviceAlert(null);
                  navigate("/user/devices");
                }}
              >
                Review in Devices
              </Button>
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => {
                  setNewDeviceShown((s) => new Set([...s, newDeviceAlert.deviceId]));
                  setNewDeviceAlert(null);
                }}
              >
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
