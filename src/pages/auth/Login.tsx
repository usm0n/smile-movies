import { Lock, Mail, Visibility, VisibilityOff, QrCode2, PhoneIphone } from "../../components/ui/icons";
import {
  Box, Divider, Input, Link, Tab, TabList, TabPanel, Tabs, Typography,
} from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { Shimmer } from "../../components/ui/Skeleton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Location, UserLogin } from "../../user";
import {
  deviceId, deviceName, deviceType, isValidEmail, reload,
} from "../../utilities/defaults";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import { extractQRToken, qrAPI } from "../../service/api/smb/qr.api.service";
import QRCodeDisplay from "../../components/utils/QRCodeDisplay";
import QRScanner, { isQRScanSupported } from "../../components/utils/QRScanner";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { AppleMark, GoogleMark } from "../../components/auth/ProviderIcons";
import { useFederatedSignIn } from "../../components/auth/useFederatedSignIn";
import PhoneSignInPanel from "../../components/auth/PhoneSignInPanel";

// ── QR Login Panel ────────────────────────────────────────────────────────────
function QRLoginPanel() {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "approved" | "expired">("idle");
  const [timeLeft, setTimeLeft] = useState(180);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Two ways through, depending on which screen has the camera: show a code
  // for an approved device to read, or read a code an approved device shows.
  const [mode, setMode] = useState<"show" | "scan">("show");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  const qrUrl = qrToken ? `${window.location.origin}/qr-approve/${qrToken}` : null;

  const handleClaim = useCallback(async (raw: string) => {
    const token = extractQRToken(raw);
    if (!token) {
      setClaimError("That doesn't look like a sign-in code.");
      return;
    }
    setClaiming(true);
    setClaimError("");
    try {
      await qrAPI.claim(token, {
        deviceId: deviceId(),
        deviceName: deviceName(),
        deviceType: deviceType(),
      });
      // The session cookie came back on that response; reload so the Users
      // context picks it up, exactly like the polling path does.
      reload();
    } catch (error) {
      setClaimError(
        (error as { data?: { message?: string } })?.data?.message ||
          "That code could not be used.",
      );
      setClaiming(false);
    }
  }, []);

  const startQR = useCallback(async () => {
    setStatus("pending");
    setTimeLeft(180);
    try {
      // Identify this screen up front: approving the code is what registers it
      // on the account, and a session for an unregistered device gets signed
      // straight back out again.
      const data = await qrAPI.generate({
        deviceId: deviceId(),
        deviceName: deviceName(),
        deviceType: deviceType(),
      });
      setQrToken(data.token);
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => { startQR(); }, [startQR]);

  // Poll for approval
  useEffect(() => {
    if (mode !== "show") return;
    if (!qrToken || status !== "pending") return;
    pollRef.current = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await qrAPI.poll(qrToken);
        if (res.status === "approved") {
          setStatus("approved");
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          // A full reload, like the federated path: the session cookie was set
          // on this response, and the Users context only reads it on mount.
          setTimeout(() => reload(), 800);
        } else if (res.status === "expired") {
          setStatus("expired");
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
        }
      } catch { /* silent */ }
    }, 4000);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus("expired");
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(pollRef.current!); clearInterval(timerRef.current!); };
  }, [qrToken, status, mode]);

  if (status === "approved") return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography level="title-lg">Signed in</Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>Redirecting…</Typography>
    </Box>
  );

  if (status === "expired") return (
    <Box sx={{ textAlign: "center", py: 4, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <Typography level="body-sm">QR code expired.</Typography>
      <Button onClick={() => { setQrToken(null); startQR(); }}>Generate new QR code</Button>
    </Box>
  );

  const modeToggle = isQRScanSupported() ? (
    <Box sx={{ width: "100%", maxWidth: 260 }}>
      <SegmentedControl
        ariaLabel="QR sign-in method"
        segments={[
          { value: "show", label: "Show code" },
          { value: "scan", label: "Scan code" },
        ]}
        value={mode}
        onChange={(value) => {
          setClaimError("");
          setMode(value as "show" | "scan");
        }}
      />
    </Box>
  ) : null;

  if (mode === "scan") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {modeToggle}
        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          On a device you're already signed in on, open{" "}
          <strong>Settings → Devices</strong> and tap{" "}
          <strong>Show code</strong>. Then point this camera at it.
        </Typography>
        <Box sx={{ width: "100%" }}>
          {claiming ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography level="title-sm">Signing in…</Typography>
            </Box>
          ) : (
            <QRScanner onScan={handleClaim} />
          )}
        </Box>
        {claimError && (
          <Typography level="body-xs" sx={{ color: "danger.plainColor", textAlign: "center" }}>
            {claimError}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {modeToggle}
      <Typography level="body-sm" sx={{ textAlign: "center" }}>
        Scan this QR code with a device that's already signed in.
      </Typography>
      {qrToken && qrUrl ? (
        <Box sx={{ p: 1.5, borderRadius: "8px", backgroundColor: "#fff" }}>
          <QRCodeDisplay value={qrUrl} size={180} />
        </Box>
      ) : (
        <Shimmer width={204} height={204} radius={8} />
      )}
      <Badge tone={timeLeft < 30 ? "red" : "neutral"} mono>
        Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </Badge>
      <Typography level="body-xs" sx={{ textAlign: "center" }}>
        Or open <strong>Settings → Devices</strong> on an approved device and paste
        the link under <strong>Approve by QR code</strong>.
      </Typography>
    </Box>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
function Login() {
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const { login, loginData, registerData } = useUsers();
  const { myselfData } = useUsers();
  const { locationData } = useOC();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email from ?hint= (Switch Account flow), or the phone number
  // carried over from a registration attempt on an already-known number.
  const emailHint = searchParams.get("hint") || "";
  const phoneHint = searchParams.get("phone") || "";
  /**
   * "Add account" sends you here while you are still signed in, which the
   * redirect below would otherwise undo the moment `getMyself` resolves —
   * bouncing you straight back home and making the switcher's Add button do
   * nothing at all.
   */
  const isAddingAccount = searchParams.get("add") === "1";
  const signedInAs = myselfData?.isSuccess
    ? (myselfData.data as { firstname?: string; email?: string } | undefined)
    : undefined;
  const [activeTab, setActiveTab] = useState(phoneHint ? 1 : 0);
  const [userValue, setUserValue] = useState<UserLogin>({
    email: emailHint, password: "",
    deviceId: deviceId(), deviceName: deviceName(), deviceType: deviceType(),
    deviceLocation: {} as Location,
  });
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prev) => ({ ...prev, [name]: name === "email" ? value.toLowerCase() : value }));
  };

  useEffect(() => {
    setUserValue((prev) => ({ ...prev, deviceLocation: locationData.data }));
  }, [locationData.data]);

  useEffect(() => {
    if (isAddingAccount) return;
    if (myselfData?.isSuccess) navigate("/");
  }, [isAddingAccount, myselfData?.isSuccess, navigate]);

  // Google and Apple both run through Firebase Auth: the popup returns an ID
  // token, the API verifies it and sets our own session cookie.
  const federated = useFederatedSignIn({
    deviceLocation: locationData.data,
    onSuccess: () => reload(),
  });

  const isBusy = Boolean(loginData?.isLoading || registerData?.isLoading);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: "var(--sm-nav-height)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {isAddingAccount && signedInAs && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, mb: 2.5,
              p: 1.5, borderRadius: "md",
              border: "1px solid", borderColor: "neutral.outlinedBorder",
              backgroundColor: "background.level1",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography level="title-sm">Adding another account</Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }} noWrap>
                {signedInAs.firstname || signedInAs.email} stays signed in — you can
                switch back any time.
              </Typography>
            </Box>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </Box>
        )}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: "1.75rem" }}>
            {isAddingAccount ? "Add an account" : "Sign in to Smile Movies"}
          </Typography>
          <Typography level="body-sm" sx={{ mt: 1 }}>
            Pick up your watchlist and progress on any device.
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "lg",
            backgroundColor: "background.surface",
            p: 3,
          }}
        >
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as number)}>
            <TabList sx={{ mb: 2.5 }}>
              <Tab sx={{ flex: 1 }}>
                <Mail sx={{ fontSize: 15, mr: 0.75 }} />
                Email
              </Tab>
              <Tab sx={{ flex: 1 }}>
                <PhoneIphone sx={{ fontSize: 15, mr: 0.75 }} />
                Phone
              </Tab>
              <Tab sx={{ flex: 1 }}>
                <QrCode2 sx={{ fontSize: 15, mr: 0.75 }} />
                QR
              </Tab>
            </TabList>

            <TabPanel value={0} sx={{ p: 0 }}>
              <form onSubmit={(e) => { e.preventDefault(); login(userValue, "email"); }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Field label="Email">
                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      onChange={handleInput}
                      value={userValue.email}
                      placeholder="you@example.com"
                      startDecorator={<Mail sx={{ fontSize: 16 }} />}
                    />
                  </Field>

                  <Field label="Password">
                    <Input
                      name="password"
                      onChange={handleInput}
                      value={userValue.password}
                      autoComplete="current-password"
                      type={passwordVisibility ? "text" : "password"}
                      placeholder="Your password"
                      startDecorator={<Lock sx={{ fontSize: 16 }} />}
                      endDecorator={
                        <IconButton
                          label={passwordVisibility ? "Hide password" : "Show password"}
                          size="sm"
                          onClick={() => setPasswordVisibility(!passwordVisibility)}
                        >
                          {passwordVisibility ? (
                            <VisibilityOff sx={{ fontSize: 16 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      }
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isBusy}
                    disabled={!isValidEmail(userValue.email) || !userValue.password.trim()}
                  >
                    Sign in
                  </Button>

                  <Divider sx={{ my: 0.5 }}>
                    <Typography level="body-xs">or</Typography>
                  </Divider>

                  <Button
                    size="lg"
                    fullWidth
                    onClick={() => federated.start("google.com")}
                    startDecorator={<GoogleMark />}
                    variant="outlined"
                    color="neutral"
                    loading={federated.pending === "google.com"}
                    disabled={Boolean(federated.pending)}
                  >
                    Continue with Google
                  </Button>

                  <Button
                    size="lg"
                    fullWidth
                    onClick={() => federated.start("apple.com")}
                    startDecorator={<AppleMark />}
                    variant="outlined"
                    color="neutral"
                    loading={federated.pending === "apple.com"}
                    disabled={Boolean(federated.pending)}
                  >
                    Continue with Apple
                  </Button>
                </Box>
              </form>
            </TabPanel>

            <TabPanel value={1} sx={{ p: 0 }}>
              <PhoneSignInPanel
                initialPhone={phoneHint}
                deviceLocation={locationData.data}
                onSuccess={() => reload()}
                // A number with no account can't be signed in; carry it over to
                // registration so the person doesn't retype it.
                onNotRegistered={(phone) =>
                  navigate(`/auth/register?phone=${encodeURIComponent(phone)}`)
                }
              />
            </TabPanel>

            <TabPanel value={2} sx={{ p: 0 }}>
              {activeTab === 2 && <QRLoginPanel />}
            </TabPanel>
          </Tabs>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mt: 2.5,
          }}
        >
          <Typography level="body-sm">
            No account?{" "}
            <Link
              onClick={() =>
                navigate(isAddingAccount ? "/auth/register?add=1" : "/auth/register")
              }
              sx={{ cursor: "pointer" }}
            >
              Create one
            </Link>
          </Typography>
          <Link
            onClick={() => navigate("/auth/forgot-password")}
            sx={{ cursor: "pointer", fontSize: "0.875rem", color: "text.tertiary" }}
          >
            Forgot password?
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
