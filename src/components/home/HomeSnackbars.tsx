import { Box, Chip, Input, Snackbar, Typography, IconButton } from "@mui/joy";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Close, DevicesOther, Lock, WarningRounded } from "../ui/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User, Device } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import { toast } from "../ui/toast";

/**
 * The two things the account needs to say out loud, unprompted.
 *
 * "This device is waiting for approval" is a modal, not a toast: until it is
 * resolved the account is half-usable, and a corner notice that scrolls away
 * left people stuck without knowing why streaming kept failing.
 *
 * "Some other device just joined" stays a snackbar — it is a security notice
 * about something that already happened, and it must not block the screen.
 */

const APPROVAL_DISMISSED_KEY = "deviceApprovalDismissed";
const NEW_DEVICE_WINDOW_MS = 10 * 60 * 1000;
/** Only runs while the approval dialog is open, so it can afford to be calm. */
const APPROVAL_POLL_MS = 10_000;

function HomeSnackbars() {
  const { myselfData, isAuthenticated, getMyself, requestActivateDevice, verifyDevice } =
    useUsers();
  const navigate = useNavigate();
  const user = myselfData?.data as User | undefined;
  const currentDeviceId = deviceId();

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [newDeviceAlert, setNewDeviceAlert] = useState<Device | null>(null);
  const shownDevicesRef = useRef<Set<string>>(new Set());

  // Email-code step, inline so the user never has to find the Devices page.
  const [step, setStep] = useState<"choose" | "code">("choose");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [approvingId, setApprovingId] = useState("");

  const currentDevice = user?.devices?.find((d) => d.deviceId === currentDeviceId);
  const isPending = Boolean(currentDevice && !currentDevice.isActive);

  useEffect(() => {
    if (!isAuthenticated || !user || !myselfData?.isSuccess) return;

    if (isPending) {
      if (!sessionStorage.getItem(APPROVAL_DISMISSED_KEY)) setApprovalOpen(true);
    } else {
      setApprovalOpen(false);
      sessionStorage.removeItem(APPROVAL_DISMISSED_KEY);
    }

    const joinedAfter = Date.now() - NEW_DEVICE_WINDOW_MS;
    const newDevice = (user.devices || []).find((d) => {
      if (d.deviceId === currentDeviceId) return false;
      if (d.isActive) return false;
      if (shownDevicesRef.current.has(d.deviceId)) return false;
      const joinedAt = new Date(d.lastLogin || d.createdAt || 0).getTime();
      return joinedAt > joinedAfter;
    });
    if (newDevice) {
      shownDevicesRef.current.add(newDevice.deviceId);
      setNewDeviceAlert(newDevice);
    }
  }, [isAuthenticated, myselfData?.isSuccess, isPending, user?.devices?.length]);

  // While the dialog is up, someone is probably tapping Approve on another
  // screen. Poll so this one lets itself in without a reload — silently, or
  // the whole page drops into its loading state every few seconds.
  const getMyselfRef = useRef(getMyself);
  getMyselfRef.current = getMyself;
  useEffect(() => {
    if (!approvalOpen || !isPending) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void getMyselfRef.current({ silent: true });
    }, APPROVAL_POLL_MS);
    return () => clearInterval(id);
  }, [approvalOpen, isPending]);

  const dismissApproval = () => {
    setApprovalOpen(false);
    sessionStorage.setItem(APPROVAL_DISMISSED_KEY, "1");
  };

  const sendCode = async () => {
    if (!currentDevice) return;
    setBusy(true);
    try {
      // Advancing regardless of the result was the bug: when mail delivery is
      // down the request 502s, and the user was still shown a code box for an
      // email that was never sent.
      if (await requestActivateDevice(currentDevice.deviceId)) setStep("code");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    if (!currentDevice || code.trim().length < 6) return;
    setBusy(true);
    try {
      if (await verifyDevice(currentDevice.deviceId, code.trim())) {
        await getMyself();
      }
    } finally {
      setBusy(false);
    }
  };

  const approveOther = async (device: Device) => {
    setApprovingId(device.deviceId);
    try {
      await qrAPI.approveDevice(device.deviceId);
      await getMyself();
      toast.success(`${device.deviceName} approved.`);
      setNewDeviceAlert(null);
    } catch {
      // The response interceptor on smbV1API raises the server's message.
    } finally {
      setApprovingId("");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Dialog
        open={approvalOpen && isPending}
        onClose={dismissApproval}
        width={460}
        title="Approve this device"
        description="Until it's approved, this device can browse but can't stream or change your library."
        actions={
          <>
            <Button variant="plain" color="neutral" onClick={dismissApproval}>
              Not now
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                dismissApproval();
                navigate("/user/devices");
              }}
            >
              All devices
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              p: 1.75, borderRadius: "md",
              border: "1px solid", borderColor: "neutral.outlinedBorder",
              backgroundColor: "background.level1",
            }}
          >
            <DevicesOther sx={{ fontSize: 20, color: "text.secondary" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography level="title-sm" noWrap>
                {currentDevice?.deviceName || "This device"}
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }} noWrap>
                {smartText(currentDevice?.deviceType || "unknown")}
                {currentDevice?.location?.country ? ` · ${currentDevice.location.country}` : ""}
                {currentDevice?.createdAt ? ` · first seen ${formatTimeAgo(currentDevice.createdAt)}` : ""}
              </Typography>
            </Box>
            <Chip size="sm" variant="soft" color="warning" startDecorator={<Lock sx={{ fontSize: 12 }} />}>
              Waiting
            </Chip>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography level="title-sm">Fastest way</Typography>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              On a device you're already signed in on, open{" "}
              <strong>Settings → Devices</strong> and tap <strong>Approve</strong> next
              to this one. This screen unlocks on its own within a few seconds.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography level="title-sm">No other device handy?</Typography>
            {step === "choose" ? (
              <Button
                variant="outlined"
                color="neutral"
                loading={busy}
                onClick={sendCode}
                sx={{ alignSelf: "flex-start" }}
              >
                Email me a code
              </Button>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Sent to {user?.email}. Enter the six characters.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Input
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void submitCode();
                    }}
                    placeholder="ABC123"
                    slotProps={{ input: { maxLength: 6 } }}
                    sx={{
                      flex: "1 1 140px",
                      minWidth: 0,
                      fontFamily: "code",
                      letterSpacing: "0.25em",
                    }}
                  />
                  <Button loading={busy} disabled={code.trim().length < 6} onClick={submitCode}>
                    Approve
                  </Button>
                  <Button variant="plain" color="neutral" loading={busy} onClick={sendCode}>
                    Resend
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>

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
              {" "}is waiting for approval. Approve it only if it's you.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Button
                size="sm"
                loading={approvingId === newDeviceAlert.deviceId}
                onClick={() => approveOther(newDeviceAlert)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setNewDeviceAlert(null);
                  navigate("/user/devices");
                }}
              >
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
