import { AspectRatio, Box, Chip, Input, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import SegmentedControl from "../../components/ui/SegmentedControl";
import EmptyState from "../../components/ui/EmptyState";
import { Device, ResponseType, User } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import {
  Check,
  Delete,
  DevicesOther,
  Lock,
  LockOpen,
  Mail,
  QrCode2,
} from "../../components/ui/icons";
import { useState } from "react";
import DeviceCard from "../../components/cards/DeviceCard";
import { useUsers } from "../../context/Users";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import { toast } from "../../components/ui/toast";

/**
 * Settings → Devices.
 *
 * A device only gets full access — streaming, watchlist writes — once it has
 * been approved, either from an already-approved device (one tap, or by
 * scanning the QR code shown on the new device) or with a code emailed to the
 * account. Everything here is one of those two paths plus per-device PIN
 * timing.
 */

type LockTiming = NonNullable<Device["requirePassword"]>;

const LOCK_OPTIONS: { value: LockTiming; label: string }[] = [
  { value: "immediately", label: "Immediately" },
  { value: "5min", label: "After 5 min" },
  { value: "30min", label: "After 30 min" },
  { value: "never", label: "Never" },
];

function Devices({ myselfData }: { myselfData: ResponseType | null }) {
  const {
    deleteDevice,
    deleteDeviceData,
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
  const [approvingId, setApprovingId] = useState("");

  const [qrScanInput, setQrScanInput] = useState("");
  const [qrApproving, setQrApproving] = useState(false);

  const user = myselfData?.data as User;
  const currentId = deviceId();
  const devices = user?.devices || [];
  const selectedDevice = devices.find((d) => d.deviceId === detailDeviceId);
  const isCurrentDevice = detailDeviceId === currentId;

  const thisDevice = devices.filter((d) => d.deviceId === currentId);
  const otherActive = devices.filter(
    (d) => d.isActive && d.deviceId !== currentId,
  );
  const pending = devices.filter((d) => !d.isActive);

  const closeDetail = () => {
    setDetailDeviceId("");
    setActivateStep("prompt");
    setActivateCode("");
  };

  const handleRequestActivation = async () => {
    if (!selectedDevice) return;
    await requestActivateDevice(selectedDevice.deviceId);
    setActivateStep("code");
  };

  const handleVerifyActivation = async () => {
    if (!selectedDevice || !activateCode.trim()) return;
    await verifyDevice(selectedDevice.deviceId, activateCode.trim());
    await getMyself();
    closeDetail();
  };

  const handleDelete = async (targetId: string) => {
    await deleteDevice(targetId);
    await getMyself();
    closeDetail();
    setDeleteConfirmId("");
  };

  const handleLockChange = async (targetId: string, value: LockTiming) => {
    const nextDevices = devices.map((d) =>
      d.deviceId === targetId ? { ...d, requirePassword: value } : d,
    );
    await updateMyself({ devices: nextDevices });
    await getMyself();
  };

  const handleQRApprove = async () => {
    const token = qrScanInput.trim().replace(/.*\/qr-approve\//, "");
    if (!token) return;
    setQrApproving(true);
    try {
      const res = await qrAPI.approve(token);
      if (res.success) {
        toast.success("Device approved — the other screen is signing in now.");
        setQrScanInput("");
      } else {
        toast.error("That QR code is invalid or has expired.");
      }
    } catch {
      // Interceptor already surfaced the message.
    } finally {
      setQrApproving(false);
    }
  };

  const handleApproveDirectly = async (pendingDeviceId: string) => {
    setApprovingId(pendingDeviceId);
    try {
      await qrAPI.approveDevice(pendingDeviceId);
      await getMyself();
      toast.success("Device approved.");
    } catch {
      // Interceptor already surfaced the message.
    } finally {
      setApprovingId("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel
        title={`Your devices (${devices.length})`}
        description="Devices awaiting approval can browse, but cannot stream or change your library."
        footerHint={
          pending.length
            ? `${pending.length} device${pending.length > 1 ? "s" : ""} waiting for approval.`
            : "All devices are approved."
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {thisDevice.length > 0 && (
            <DeviceGroup label="This device">
              {thisDevice.map((device) => (
                <DeviceCard
                  key={device.deviceId}
                  device={device}
                  setDeviceIdModal={setDetailDeviceId}
                  isCurrent
                />
              ))}
            </DeviceGroup>
          )}

          {otherActive.length > 0 && (
            <DeviceGroup
              label="Approved"
              icon={<LockOpen sx={{ fontSize: 14, color: "success.plainColor" }} />}
            >
              {otherActive.map((device) => (
                <DeviceCard
                  key={device.deviceId}
                  device={device}
                  setDeviceIdModal={setDetailDeviceId}
                />
              ))}
            </DeviceGroup>
          )}

          {pending.length > 0 && (
            <DeviceGroup
              label="Waiting for approval"
              icon={<Lock sx={{ fontSize: 14, color: "warning.plainColor" }} />}
            >
              {pending.map((device) => (
                <Box
                  key={device.deviceId}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <DeviceCard
                      device={device}
                      setDeviceIdModal={setDetailDeviceId}
                    />
                  </Box>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<Check sx={{ fontSize: 15 }} />}
                    loading={approvingId === device.deviceId}
                    onClick={() => handleApproveDirectly(device.deviceId)}
                  >
                    Approve
                  </Button>
                </Box>
              ))}
            </DeviceGroup>
          )}

          {devices.length === 0 && (
            <EmptyState
              bare
              icon={DevicesOther}
              title="No devices yet"
              description="Devices appear here the first time you sign in on them."
            />
          )}
        </Box>
      </Panel>

      <Panel
        title="Approve by QR code"
        description="A signed-out device shows a QR code on its sign-in screen. Paste the code's link here to approve it from this device."
        footerHint="Codes expire after three minutes."
        footer={
          <Button
            loading={qrApproving}
            disabled={!qrScanInput.trim()}
            startDecorator={<QrCode2 sx={{ fontSize: 16 }} />}
            onClick={handleQRApprove}
          >
            Approve device
          </Button>
        }
      >
        <Field label="QR code link or token">
          <Input
            placeholder="https://smile-movies.uz/qr-approve/…"
            value={qrScanInput}
            onChange={(event) => setQrScanInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleQRApprove();
            }}
          />
        </Field>
      </Panel>

      {/* ── Device detail ── */}
      <Dialog
        open={Boolean(detailDeviceId)}
        onClose={closeDetail}
        width={480}
        title={selectedDevice?.deviceName || "Device"}
        description={
          selectedDevice
            ? `${smartText(selectedDevice.deviceType)}${
                selectedDevice.location?.country
                  ? ` · ${selectedDevice.location.country}`
                  : ""
              }`
            : undefined
        }
        actions={
          <>
            {!isCurrentDevice && selectedDevice && (
              <Button
                color="danger"
                variant="outlined"
                startDecorator={<Delete sx={{ fontSize: 16 }} />}
                onClick={() => setDeleteConfirmId(selectedDevice.deviceId)}
              >
                Remove device
              </Button>
            )}
            <Button variant="outlined" color="neutral" onClick={closeDetail}>
              Close
            </Button>
          </>
        }
      >
        {selectedDevice && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {isCurrentDevice && (
                <Chip size="sm" variant="soft" color="primary">
                  This device
                </Chip>
              )}
              <Chip
                size="sm"
                variant="soft"
                color={selectedDevice.isActive ? "success" : "warning"}
              >
                {selectedDevice.isActive ? "Approved" : "Waiting for approval"}
              </Chip>
            </Box>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
                borderRadius: "md",
                px: 2,
              }}
            >
              <DetailRow
                label="First seen"
                value={formatTimeAgo(selectedDevice.createdAt)}
              />
              <DetailRow
                label="Last seen"
                value={formatTimeAgo(selectedDevice.lastLogin)}
              />
              {selectedDevice.location?.county && (
                <DetailRow
                  label="Location"
                  value={[
                    selectedDevice.location.county,
                    selectedDevice.location.road,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
            </Box>

            {selectedDevice.location?.latitude ? (
              <AspectRatio ratio="16/9" sx={{ borderRadius: "md", overflow: "hidden" }}>
                <iframe
                  title="Device location"
                  allowFullScreen
                  style={{ border: 0, width: "100%", height: "100%" }}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${selectedDevice.location.latitude},${selectedDevice.location.longitude}&z=15&output=embed`}
                />
              </AspectRatio>
            ) : null}

            {!selectedDevice.isActive && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography level="title-sm">Approve this device</Typography>
                <Typography level="body-sm">
                  Approve it from a device you are already signed in on, or send a
                  code to {user?.email || "your email"}.
                </Typography>

                {activateStep === "prompt" ? (
                  <Button
                    variant="outlined"
                    color="neutral"
                    startDecorator={<Mail sx={{ fontSize: 16 }} />}
                    loading={requestActivateDeviceData?.isLoading}
                    onClick={handleRequestActivation}
                  >
                    Email me a code
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Field label={`Code sent to ${user?.email}`}>
                      <Input
                        value={activateCode}
                        onChange={(event) =>
                          setActivateCode(event.target.value.toUpperCase())
                        }
                        placeholder="ABC123"
                        sx={{ fontFamily: "code", letterSpacing: "0.25em" }}
                      />
                    </Field>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        loading={verifyDeviceData?.isLoading}
                        disabled={activateCode.trim().length < 6}
                        onClick={handleVerifyActivation}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="plain"
                        color="neutral"
                        onClick={() => {
                          setActivateStep("prompt");
                          setActivateCode("");
                        }}
                      >
                        Resend
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {selectedDevice.isActive && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography level="title-sm">Ask for the PIN</Typography>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  Applies only to this device. Requires PIN lock to be enabled
                  under Account.
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <SegmentedControl
                    ariaLabel="Require PIN"
                    segments={LOCK_OPTIONS}
                    value={selectedDevice.requirePassword || "never"}
                    onChange={(value) =>
                      handleLockChange(selectedDevice.deviceId, value as LockTiming)
                    }
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Dialog>

      {/* ── Remove confirmation ── */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId("")}
        title="Remove this device?"
        description="It is signed out immediately and has to be approved again next time it signs in."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setDeleteConfirmId("")}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              loading={deleteDeviceData?.isLoading}
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Remove device
            </Button>
          </>
        }
      />
    </Box>
  );
}

function DeviceGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {icon}
        <Typography
          level="body-xs"
          sx={{
            color: "text.tertiary",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.25,
        "&:not(:first-of-type)": {
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
        },
      }}
    >
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        {label}
      </Typography>
      <Typography level="body-sm">{value}</Typography>
    </Box>
  );
}

export default Devices;
