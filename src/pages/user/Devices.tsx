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
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { ResponseType, User } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import { Check, Close, Delete, DevicesOther, Help, Lock, LockOpen } from "@mui/icons-material";
import { useState } from "react";
import DeviceCard from "../../components/cards/DeviceCard";
import { useUsers } from "../../context/Users";

function Devices({ myselfData }: { myselfData: ResponseType | null }) {
  const {
    deleteDevice,
    deleteDeviceData,
    activateDevice,
    activateDeviceData,
    requestActivateDevice,
    requestActivateDeviceData,
    verifyDevice,
    verifyDeviceData,
    getMyself,
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
    if (!selectedDevice || !user.email) return;
    await requestActivateDevice(user.email, selectedDevice.deviceId);
    setActivateStep("code");
  };

  const handleVerifyActivation = async () => {
    if (!selectedDevice || !activateCode.trim() || !user.email) return;
    await verifyDevice(user.email, selectedDevice.deviceId, activateCode.trim());
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
            <DeviceCard key={device.deviceId} device={device} setDeviceIdModal={setDetailDeviceId} />
          ))}
        </>
      )}

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
