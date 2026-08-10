import {
  AspectRatio,
  Box,
  Button,
  Card,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Tooltip,
  Typography,
} from "@mui/joy";
import { ResponseType, User } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import { Check, Delete, DevicesOther, Help, Lock, LockOpen, QrCode2, CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import DeviceCard from "../../components/cards/DeviceCard";
import { useUsers } from "../../context/Users";
import { qrAPI } from "../../service/api/smb/qr.api.service";

function Devices({ myselfData }: { myselfData: ResponseType | null }) {
  const {
    deleteDevice,
    deleteDeviceData,
    // activateDevice,
    // activateDeviceData,
    requestActivateDevice,
    requestActivateDeviceData,
    verifyDevice,
    verifyDeviceData,
    getMyself,
    updateMyself,
  } = useUsers();

  const [detailDeviceId, setDetailDeviceId] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [activateCode, setActivateCode] = useState("");
  const [activateStep, setActivateStep] = useState<"prompt" | "code">("prompt");

  const user = myselfData?.data as User;
  const currentId = deviceId();
  const selectedDevice = user?.devices?.find((d) => d.deviceId === detailDeviceId);
  const isCurrentDevice = detailDeviceId === currentId;

  const handleRequestActivation = async () => {
    if (!selectedDevice) return;
    await requestActivateDevice(selectedDevice.deviceId);
    setActivateStep("code");
  };

  const handleVerifyActivation = async () => {
    if (!selectedDevice || !activateCode.trim()) return;
    await verifyDevice(selectedDevice.deviceId, activateCode.trim());
    await getMyself();
    setDetailDeviceId("");
    setActivateStep("prompt");
    setActivateCode("");
  };

  const handleDelete = async (deviceIdToDelete: string) => {
    await deleteDevice(deviceIdToDelete);
    await getMyself();
    setDetailDeviceId("");
    setDeleteConfirmId("");
  };

  const handleRequirePasswordChange = async (deviceId: string, value: string) => {
    const devices = (user?.devices || []).map((d) =>
      d.deviceId === deviceId ? { ...d, requirePassword: value } : d,
    );
    await updateMyself({ devices } as any);
    await getMyself();
  };

  // QR scan state
  const [qrScanInput, setQrScanInput] = useState("");
  const [qrApproving, setQrApproving] = useState(false);
  const [qrApproveResult, setQrApproveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleQRApprove = async () => {
    const token = qrScanInput.trim().replace(/.*\/qr-approve\//, "");
    if (!token) return;
    setQrApproving(true);
    try {
      const res = await qrAPI.approve(token);
      setQrApproveResult({ ok: true, msg: res.success ? "Device approved! The other screen will log in now." : "Invalid or expired QR code." });
      setQrScanInput("");
    } catch (err: any) {
      setQrApproveResult({ ok: false, msg: err?.response?.data?.message || "Invalid or expired QR code." });
    } finally {
      setQrApproving(false);
    }
  };

  // Approve pending device directly (no email)
  const handleApproveDeviceDirectly = async (pendingDeviceId: string) => {
    try {
      await qrAPI.approveDevice(pendingDeviceId);
      await getMyself();
    } catch { /* silent */ }
  };

  const activeDevices = user?.devices?.filter((d) => d.isActive) || [];
  const inactiveDevices = user?.devices?.filter((d) => !d.isActive) || [];

  return (
    <Card sx={{ width: "700px", margin: "0 auto", "@media (max-width: 800px)": { width: "100%" } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DevicesOther />
        <Typography level="h4">Devices ({user?.devices?.length || 0})</Typography>
      </Box>
      <Typography level="body-sm" textColor="neutral.400">
        Inactive devices have limited access — they cannot stream or save to your watchlist.
      </Typography>
      <Divider />

      {/* This device */}
      <Typography level="body-sm" fontWeight={600}>This device</Typography>
      {user?.devices?.filter((d) => d.deviceId === currentId).map((device) => (
        <DeviceCard key={device.deviceId} device={device} setDeviceIdModal={setDetailDeviceId} />
      ))}

      {/* Active other devices */}
      {activeDevices.filter((d) => d.deviceId !== currentId).length > 0 && (
        <>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockOpen sx={{ fontSize: 16, color: "success.400" }} />
            <Typography level="body-sm" fontWeight={600}>Active devices</Typography>
          </Box>
          {activeDevices.filter((d) => d.deviceId !== currentId).map((device) => (
            <DeviceCard key={device.deviceId} device={device} setDeviceIdModal={setDetailDeviceId} />
          ))}
        </>
      )}

      {/* Inactive devices */}
      {inactiveDevices.length > 0 && (
        <>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Lock sx={{ fontSize: 16, color: "warning.400" }} />
            <Typography level="body-sm" fontWeight={600}>Pending activation</Typography>
            <Tooltip title="These devices need to be activated before they can stream content or modify your watchlist.">
              <Help sx={{ fontSize: 14, color: "neutral.400", cursor: "help" }} />
            </Tooltip>
          </Box>
          {inactiveDevices.map((device) => (
            <Box key={device.deviceId} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1 }}>
                <DeviceCard device={device} setDeviceIdModal={setDetailDeviceId} />
              </Box>
              <Button
                size="sm"
                color="success"
                variant="soft"
                startDecorator={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                onClick={() => handleApproveDeviceDirectly(device.deviceId)}
              >
                Approve
              </Button>
            </Box>
          ))}
        </>
      )}

      {/* QR Login Scanner */}
      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCode2 sx={{ fontSize: 18 }} />
          <Typography level="title-sm">Scan QR Code</Typography>
        </Box>
        <Typography level="body-sm" textColor="neutral.400">
          Paste or type the QR code URL from another device's login screen to approve it.
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Input
            placeholder="Paste QR code URL or token..."
            value={qrScanInput}
            onChange={(e) => { setQrScanInput(e.target.value); setQrApproveResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleQRApprove()}
            sx={{ flex: 1 }}
          />
          <Button
            loading={qrApproving}
            disabled={!qrScanInput.trim()}
            onClick={handleQRApprove}
            color="success"
          >
            Approve
          </Button>
        </Box>
        {qrApproveResult && (
          <Typography level="body-sm" sx={{ color: qrApproveResult.ok ? "success.400" : "danger.400" }}>
            {qrApproveResult.msg}
          </Typography>
        )}
      </Box>

      {/* ── Device Detail Modal ── */}
      <Modal open={!!detailDeviceId} onClose={() => { setDetailDeviceId(""); setActivateStep("prompt"); setActivateCode(""); }}>
        <ModalDialog sx={{ overflow: "auto", maxWidth: 480, width: "95vw" }}>
          <ModalClose />
          {selectedDevice && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box>
                  <Typography level="h3">
                    {selectedDevice.deviceName} <Typography level="body-md" textColor="neutral.400">· {smartText(selectedDevice.deviceType)}</Typography>
                  </Typography>
                  <Typography level="body-sm" textColor="neutral.400">
                    {selectedDevice.location?.country}, {selectedDevice.location?.state}
                  </Typography>
                </Box>
                {isCurrentDevice && <Chip color="primary" size="sm" variant="soft">This device</Chip>}
                <Chip color={selectedDevice.isActive ? "success" : "warning"} size="sm" variant="soft">
                  {selectedDevice.isActive ? "Active" : "Inactive"}
                </Chip>
              </Box>

              <Divider />
              <Card variant="soft">
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm">First login</Typography>
                  <Typography level="body-sm">{formatTimeAgo(selectedDevice.createdAt)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm">Last seen</Typography>
                  <Typography level="body-sm">{formatTimeAgo(selectedDevice.lastLogin)}</Typography>
                </Box>
              </Card>

              {selectedDevice.location?.latitude ? (
                <Box>
                  <Typography level="title-sm" sx={{ mb: 1 }}>Location</Typography>
                  <AspectRatio>
                    <iframe
                      allowFullScreen
                      style={{ border: 0, width: "100%", height: "100%" }}
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${selectedDevice.location.latitude},${selectedDevice.location.longitude}&z=15&output=embed`}
                    />
                  </AspectRatio>
                  <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
                    {selectedDevice.location.county}, {selectedDevice.location.road}
                  </Typography>
                </Box>
              ) : null}

              {/* Activation section for inactive devices */}
              {!selectedDevice.isActive && (
                <>
                  <Divider />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Typography level="title-sm">Activate this device</Typography>
                    <Typography level="body-sm" textColor="neutral.400">
                      Inactive devices can browse but cannot stream or modify your watchlist. Activate to unlock full access.
                    </Typography>

                    {activateStep === "prompt" && (
                      <Button
                        startDecorator={<Check />}
                        color="success"
                        loading={requestActivateDeviceData?.isLoading}
                        onClick={handleRequestActivation}
                      >
                        Send activation code to email
                      </Button>
                    )}

                    {activateStep === "code" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography level="body-sm">Enter the 6-digit code sent to {user.email}</Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Input
                            value={activateCode}
                            onChange={(e) => setActivateCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            sx={{ flex: 1, letterSpacing: 4, fontWeight: 700 }}
                          />
                          <Button
                            loading={verifyDeviceData?.isLoading}
                            disabled={activateCode.length < 6}
                            color="success"
                            onClick={handleVerifyActivation}
                          >
                            Verify
                          </Button>
                        </Box>
                        <Button variant="plain" size="sm" onClick={() => { setActivateStep("prompt"); setActivateCode(""); }}>
                          Resend code
                        </Button>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              {/* Require-password (device lock) setting */}
              {selectedDevice.isActive && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography level="title-sm">Require PIN when app is opened</Typography>
                  <Typography level="body-xs" textColor="neutral.400">
                    This setting only applies to this device. Your other devices are not affected.
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                    {[
                      { value: "immediately", label: "Immediately" },
                      { value: "5min", label: "5 min after" },
                      { value: "30min", label: "30 min after" },
                      { value: "never", label: "Never" },
                    ].map((opt) => {
                      const current = selectedDevice.requirePassword || "never";
                      return (
                        <Chip
                          key={opt.value}
                          variant={current === opt.value ? "solid" : "outlined"}
                          color={current === opt.value ? "warning" : "neutral"}
                          onClick={() => handleRequirePasswordChange(selectedDevice.deviceId, opt.value)}
                          sx={{ cursor: "pointer" }}
                        >
                          {opt.label}
                        </Chip>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Divider />
              <DialogActions>
                {!isCurrentDevice && (
                  <Button
                    color="danger"
                    variant="outlined"
                    startDecorator={<Delete />}
                    loading={deleteDeviceData?.isLoading}
                    onClick={() => setDeleteConfirmId(selectedDevice.deviceId)}
                  >
                    Remove device
                  </Button>
                )}
                <Button variant="plain" color="neutral" onClick={() => { setDetailDeviceId(""); setActivateStep("prompt"); setActivateCode(""); }}>
                  Close
                </Button>
              </DialogActions>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId("")}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>Remove device?</DialogTitle>
          <DialogContent>
            This will sign out and remove this device from your account. Are you sure?
          </DialogContent>
          <DialogActions>
            <Button color="danger" loading={deleteDeviceData?.isLoading} onClick={() => handleDelete(deleteConfirmId)}>
              Yes, remove
            </Button>
            <Button variant="plain" color="neutral" onClick={() => setDeleteConfirmId("")}>Cancel</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Card>
  );
}

export default Devices;
