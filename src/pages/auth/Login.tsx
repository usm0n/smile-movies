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
import { qrAPI } from "../../service/api/smb/qr.api.service";
import QRCodeDisplay from "../../components/utils/QRCodeDisplay";
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
  const navigate = useNavigate();

  const qrUrl = qrToken ? `${window.location.origin}/qr-approve/${qrToken}` : null;

  const startQR = useCallback(async () => {
    setStatus("pending");
    setTimeLeft(180);
    try {
      const data = await qrAPI.generate();
      setQrToken(data.token);
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => { startQR(); }, [startQR]);

  // Poll for approval
  useEffect(() => {
    if (!qrToken || status !== "pending") return;
    pollRef.current = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await qrAPI.poll(qrToken);
        if (res.status === "approved") {
          setStatus("approved");
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setTimeout(() => navigate("/"), 800);
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
  }, [qrToken, status, navigate]);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography level="body-sm" sx={{ textAlign: "center" }}>
        Scan this QR code with an active device that's already logged in.
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
        Go to <strong>Settings → Devices</strong> on an active device and tap <strong>Scan QR</strong>.
      </Typography>
    </Box>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
function Login() {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { login, loginData, registerData } = useUsers();
  const { myselfData } = useUsers();
  const { locationData } = useOC();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email from ?hint= (Switch Account flow)
  const emailHint = searchParams.get("hint") || "";
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
    if (myselfData?.isSuccess) navigate("/");
  }, [myselfData?.isSuccess, navigate]);

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
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: "1.75rem" }}>
            Sign in to Smile Movies
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
                deviceLocation={locationData.data}
                onSuccess={() => reload()}
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
            <Link onClick={() => navigate("/auth/register")} sx={{ cursor: "pointer" }}>
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
