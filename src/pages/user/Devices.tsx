import { AspectRatio, Box, Chip, Input, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import EmptyState from "../../components/ui/EmptyState";
import { Device, ResponseType, User } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import {
  Check,
  Delete,
  DevicesOther,
  Lock,
  LockOpen,
  Logout,
  Mail,
  QrCode2,
  QrCodeScanner,
} from "../../components/ui/icons";
import { useEffect, useRef, useState } from "react";
import DeviceCard from "../../components/cards/DeviceCard";
import { useUsers } from "../../context/Users";
import { extractQRToken, qrAPI } from "../../service/api/smb/qr.api.service";
import QRCodeDisplay from "../../components/utils/QRCodeDisplay";
import QRScanner, { isQRScanSupported } from "../../components/utils/QRScanner";
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

/** How often a device still awaiting approval re-checks whether it got one. */
const PENDING_POLL_MS = 10_000;

function Devices({ myselfData }: { myselfData: ResponseType | null }) {
  const {
    deleteDevice,
    deleteDeviceData,
    deleteAllDevices,
    deleteAllDevicesData,
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
  const [approvingId, setApprovingId] = useState("");

  const [qrScanInput, setQrScanInput] = useState("");
  const [qrApproving, setQrApproving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [grantToken, setGrantToken] = useState("");
  const [grantExpiresAt, setGrantExpiresAt] = useState(0);
  const [grantLoading, setGrantLoading] = useState(false);

  const [signOutAllOpen, setSignOutAllOpen] = useState(false);
  const [signOutAllIncludesCurrent, setSignOutAllIncludesCurrent] = useState(false);

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

  const isThisDevicePending = thisDevice.length > 0 && !thisDevice[0].isActive;

  /**
   * Approval usually happens on a *different* screen — someone taps Approve on
   * their phone while this one sits on the waiting message. Nothing pushes
   * that back, so poll for it; otherwise the only way out is a manual reload.
   */
  // `getMyself` is a fresh closure on every context render, so it is held in a
  // ref rather than listed as a dependency — otherwise the interval would be
  // torn down and recreated on each render and never actually fire.
  const getMyselfRef = useRef(getMyself);
  getMyselfRef.current = getMyself;

  useEffect(() => {
    if (!isThisDevicePending) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void getMyselfRef.current({ silent: true });
    }, PENDING_POLL_MS);
    return () => clearInterval(id);
  }, [isThisDevicePending]);

  const closeDetail = () => {
    setDetailDeviceId("");
    setActivateStep("prompt");
    setActivateCode("");
  };

  const handleRequestActivation = async () => {
    if (!selectedDevice) return;
    // Only move to the code step if a code actually went out — otherwise the
    // user is left staring at an input for an email that never arrives.
    if (await requestActivateDevice(selectedDevice.deviceId)) {
      setActivateStep("code");
    }
  };

  const handleVerifyActivation = async () => {
    if (!selectedDevice || !activateCode.trim()) return;
    if (!(await verifyDevice(selectedDevice.deviceId, activateCode.trim()))) return;
    await getMyself();
    closeDetail();
  };

  const handleDelete = async (targetId: string) => {
    await deleteDevice(targetId);
    await getMyself();
    closeDetail();
    setDeleteConfirmId("");
  };

  const handleQRApprove = async (raw?: string) => {
    const token = extractQRToken(raw ?? qrScanInput);
    if (!token) {
      toast.error("That doesn't look like a sign-in code.");
      return;
    }
    setQrApproving(true);
    try {
      const res = await qrAPI.approve(token);
      if (res.success) {
        toast.success("Device approved — the other screen is signing in now.");
        setQrScanInput("");
        // The approved device is added to the account at this point, so pull
        // the list in rather than waiting for the next visit.
        await getMyself();
      } else {
        toast.error("That QR code is invalid or has expired.");
      }
    } catch {
      // The response interceptor on smbV1API raises the server's message.
    } finally {
      setQrApproving(false);
    }
  };

  /**
   * The other direction: show a code here for a signed-out device to scan.
   * Codes are single-use and last three minutes, so it is minted on demand
   * rather than kept alive in the background.
   */
  const handleShowSignInCode = async () => {
    setGrantLoading(true);
    try {
      const { token, expiresIn } = await qrAPI.grant();
      setGrantToken(token);
      setGrantExpiresAt(Date.now() + expiresIn);
    } catch {
      // The response interceptor on smbV1API raises the server's message.
    } finally {
      setGrantLoading(false);
    }
  };

  const handleApproveDirectly = async (pendingDeviceId: string) => {
    setApprovingId(pendingDeviceId);
    try {
      await qrAPI.approveDevice(pendingDeviceId);
      await getMyself();
      toast.success("Device approved.");
    } catch {
      // The response interceptor on smbV1API raises the server's message.
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
        description="A signed-out device shows a code on its sign-in screen. Scan it with this device's camera, or paste the link."
        footerHint="Codes expire after three minutes."
        footer={
          <>
            {isQRScanSupported() && !scanning && (
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<QrCodeScanner sx={{ fontSize: 16 }} />}
                onClick={() => setScanning(true)}
              >
                Scan with camera
              </Button>
            )}
            <Button
              loading={qrApproving}
              disabled={!qrScanInput.trim()}
              startDecorator={<QrCode2 sx={{ fontSize: 16 }} />}
              onClick={() => handleQRApprove()}
            >
              Approve device
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {scanning && (
            <QRScanner
              onClose={() => setScanning(false)}
              onScan={async (value) => {
                setScanning(false);
                await handleQRApprove(value);
              }}
            />
          )}
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
        </Box>
      </Panel>

      <Panel
        title="Sign in another device"
        description="Show a code for a signed-out device to scan. Whoever scans it is signed straight into this account, so only show it to a screen you trust."
        footerHint="Single use, and expires after three minutes."
        footer={
          <Button
            loading={grantLoading}
            variant={grantToken ? "outlined" : "solid"}
            color={grantToken ? "neutral" : "primary"}
            startDecorator={<QrCode2 sx={{ fontSize: 16 }} />}
            onClick={handleShowSignInCode}
          >
            {grantToken ? "New code" : "Show code"}
          </Button>
        }
      >
        {grantToken ? (
          <Box
            sx={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 1.5, py: 1,
            }}
          >
            <QRCodeDisplay
              value={`${window.location.origin}/qr-claim/${grantToken}`}
              size={180}
            />
            <GrantCountdown
              expiresAt={grantExpiresAt}
              onExpire={() => setGrantToken("")}
            />
          </Box>
        ) : (
          <EmptyState
            bare
            icon={QrCode2}
            title="No code showing"
            description="Generate one, then scan it from the sign-in screen of the other device."
          />
        )}
      </Panel>

      <Panel
        title="Sign out everywhere"
        description="Removes every other device from the account. They lose access immediately and have to be approved again."
        footerHint={
          otherActive.length + pending.length === 0
            ? "No other devices are signed in."
            : `${otherActive.length + pending.length} other device${
                otherActive.length + pending.length > 1 ? "s" : ""
              } would be signed out.`
        }
        footer={
          <>
            <Button
              color="danger"
              variant="outlined"
              disabled={otherActive.length + pending.length === 0}
              startDecorator={<Delete sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSignOutAllIncludesCurrent(false);
                setSignOutAllOpen(true);
              }}
            >
              Sign out other devices
            </Button>
            <Button
              color="danger"
              variant="plain"
              startDecorator={<Logout sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSignOutAllIncludesCurrent(true);
                setSignOutAllOpen(true);
              }}
            >
              Include this one
            </Button>
          </>
        }
      />

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
              {/* Gated on `county` alone this row vanished for any device that
                  only ever resolved to a country — which is most of them. */}
              {formatLocation(selectedDevice) && (
                <DetailRow label="Location" value={formatLocation(selectedDevice)} />
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
                      {/* This used to just bounce back to the previous step,
                          so no second code was ever sent. */}
                      <Button
                        variant="plain"
                        color="neutral"
                        loading={requestActivateDeviceData?.isLoading}
                        onClick={async () => {
                          setActivateCode("");
                          await requestActivateDevice(selectedDevice.deviceId);
                        }}
                      >
                        Resend
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

          </Box>
        )}
      </Dialog>

      {/* ── Sign out everywhere confirmation ── */}
      <Dialog
        open={signOutAllOpen}
        onClose={() => setSignOutAllOpen(false)}
        title={
          signOutAllIncludesCurrent
            ? "Sign out of every device?"
            : "Sign out every other device?"
        }
        description={
          signOutAllIncludesCurrent
            ? "Every device is removed from the account, including this one. You will be signed out here and have to sign in again."
            : `${otherActive.length + pending.length} device${
                otherActive.length + pending.length === 1 ? "" : "s"
              } lose access immediately. This device stays signed in.`
        }
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setSignOutAllOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              loading={deleteAllDevicesData?.isLoading}
              onClick={async () => {
                await deleteAllDevices(signOutAllIncludesCurrent);
                setSignOutAllOpen(false);
                // Signing this device out reloads, so only refresh the list
                // when we are staying put.
                if (!signOutAllIncludesCurrent) await getMyself();
              }}
            >
              {signOutAllIncludesCurrent ? "Sign out everywhere" : "Sign out others"}
            </Button>
          </>
        }
      />

      {/* ── Remove confirmation ── */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId("")}
        title={`Remove ${
          devices.find((d) => d.deviceId === deleteConfirmId)?.deviceName ||
          "this device"
        }?`}
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

/** Ticks down the life of a displayed sign-in code and clears it on expiry. */
function GrantCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) onExpire();
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  return (
    <Typography level="body-xs" sx={{ color: "text.tertiary", fontFamily: "code" }}>
      Expires in {Math.floor(remaining / 60)}:
      {String(remaining % 60).padStart(2, "0")}
    </Typography>
  );
}

function formatLocation(device: Device): string {
  return [
    device.location?.country,
    device.location?.state,
    device.location?.county,
    device.location?.road,
  ]
    .filter(Boolean)
    .join(", ");
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
