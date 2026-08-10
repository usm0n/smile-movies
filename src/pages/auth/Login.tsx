import { Lock, Mail, Visibility, VisibilityOff, QrCode2 } from "@mui/icons-material";
import {
  Box, Button, Card, Chip, CircularProgress, Divider, FormControl,
  FormHelperText, FormLabel, IconButton, Input, Link, Tab, TabList,
  TabPanel, Tabs, Typography, useColorScheme,
} from "@mui/joy";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleUserResponse, Location, UserLogin } from "../../user";
import {
  backdropLoading, deviceId, deviceName, deviceType, isValidEmail,
} from "../../utilities/defaults";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import axios from "axios";
import { qrAPI } from "../../service/api/smb/qr.api.service";
import QRCodeDisplay from "../../components/utils/QRCodeDisplay";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
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
      <Typography level="h4" sx={{ color: "rgb(100,220,120)" }}>✓ Logged in!</Typography>
      <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 1 }}>Redirecting...</Typography>
    </Box>
  );

  if (status === "expired") return (
    <Box sx={{ textAlign: "center", py: 4, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <Typography level="body-md" sx={{ color: "text.tertiary" }}>QR code expired.</Typography>
      <Button onClick={() => { setQrToken(null); startQR(); }}>Generate new QR code</Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography level="body-sm" sx={{ color: "text.tertiary", textAlign: "center" }}>
        Scan this QR code with an active device that's already logged in.
      </Typography>
      {qrToken && qrUrl ? (
        <QRCodeDisplay value={qrUrl} size={180} />
      ) : (
        <CircularProgress />
      )}
      <Chip size="sm" variant="soft" color={timeLeft < 30 ? "danger" : "neutral"}>
        Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </Chip>
      <Typography level="body-xs" sx={{ color: "text.tertiary", textAlign: "center" }}>
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
  const { colorScheme } = useColorScheme();
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

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      {backdropLoading(loginData?.isLoading || registerData?.isLoading, colorScheme)}
      <Card sx={{ padding: "40px", borderRadius: "12px", gap: "20px", width: "100%", maxWidth: 420 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as number)}>
          <TabList>
            <Tab sx={{ flex: 1 }}>Sign in</Tab>
            <Tab sx={{ flex: 1 }}><QrCode2 sx={{ fontSize: 18, mr: 0.5 }} />QR Login</Tab>
          </TabList>

          {/* Email/Password tab */}
          <TabPanel value={0} sx={{ p: 0, pt: 2 }}>
            <form onSubmit={(e) => { e.preventDefault(); login(userValue, "email"); }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" onChange={handleInput} value={userValue.email} placeholder="Your email" startDecorator={<Mail />} />
                </FormControl>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password" onChange={handleInput} value={userValue.password}
                    type={passwordVisibility ? "text" : "password"} placeholder="Your Password"
                    startDecorator={<Lock />}
                    endDecorator={
                      <IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>
                        {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    }
                  />
                </FormControl>
                <Button
                  type="submit"
                  disabled={!isValidEmail(userValue.email) || !userValue.password.trim() || loginData?.isLoading || registerData?.isLoading}
                  sx={{ background: "rgb(255,216,77)", color: "black", ":hover": { background: "rgb(255,216,77)", opacity: 0.8 } }}
                >
                  {loginData?.isLoading || registerData?.isLoading ? "Loading..." : "Sign in"}
                </Button>
                <FormHelperText>
                  Don't have an account? <Link onClick={() => navigate("/auth/register")}>Create one</Link>
                </FormHelperText>
                <FormHelperText>
                  <Link onClick={() => navigate("/auth/forgot-password")}>Forgot your password?</Link>
                </FormHelperText>
                <Divider>or</Divider>
                <Button onClick={() => googleLogin()} startDecorator={<GoogleIcon />} variant="soft" color="neutral">
                  Sign in with Google
                </Button>
              </Box>
            </form>
          </TabPanel>

          {/* QR Login tab */}
          <TabPanel value={1} sx={{ p: 0, pt: 2 }}>
            {activeTab === 1 && <QRLoginPanel />}
          </TabPanel>
        </Tabs>
      </Card>
    </Box>
  );
}

export default Login;
