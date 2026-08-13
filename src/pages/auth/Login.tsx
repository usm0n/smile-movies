import { Lock, Mail, Visibility, VisibilityOff, QrCode2 } from "../../components/ui/icons";
import {
  Box, Divider, Input, Link, Tab, TabList, TabPanel, Tabs, Typography,
} from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { Shimmer } from "../../components/ui/Skeleton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleUserResponse, Location, UserLogin } from "../../user";
import {
  deviceId, deviceName, deviceType, isValidEmail,
} from "../../utilities/defaults";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import axios from "axios";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import QRCodeDisplay from "../../components/utils/QRCodeDisplay";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userData: GoogleUserResponse = userInfo.data;
      const loc = locationData.data;
      login(
        { email: userData.email, password: userData.sub, deviceName: deviceName(), deviceType: deviceType(), deviceId: deviceId(), deviceLocation: loc },
        "google",
        { email: userData.email, password: userData.sub, firstname: userData.given_name, lastname: userData.family_name, isVerified: userData.email_verified, profilePic: userData.picture, deviceName: deviceName(), deviceType: deviceType(), deviceId: deviceId(), loginType: "google", deviceLocation: loc },
      );
    },
    onError: () => console.error("Google login failed"),
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
              <Tab sx={{ flex: 1 }}>Email</Tab>
              <Tab sx={{ flex: 1 }}>
                <QrCode2 sx={{ fontSize: 15, mr: 0.75 }} />
                QR code
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
                    onClick={() => googleLogin()}
                    startDecorator={<GoogleIcon />}
                    variant="outlined"
                    color="neutral"
                    loading={isBusy}
                  >
                    Continue with Google
                  </Button>
                </Box>
              </form>
            </TabPanel>

            <TabPanel value={1} sx={{ p: 0 }}>
              {activeTab === 1 && <QRLoginPanel />}
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
