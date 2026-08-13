import { Lock, Mail, Person, Visibility, VisibilityOff, ArrowBack, ArrowForward } from "../../components/ui/icons";
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Option,
  Select,
  Switch,
  Typography,
} from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import { useEffect, useState } from "react";
import { GoogleUserResponse, UserRegister } from "../../user";
import {
  deviceId,
  deviceName,
  deviceType,
  isValidEmail,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import React from "react";
import axios from "axios";
import {
  defaultNotificationPreferences,
  notificationDigestOptions,
  notificationToggleOptions,
} from "../../utilities/notificationPreferences";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function Register() {
  const [step, setStep] = useState(0);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [cpassword, setCpassword] = useState("");

  const [userValue, setUserValue] = useState<UserRegister>({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    deviceId: deviceId(),
    deviceName: deviceName(),
    deviceType: deviceType(),
    loginType: "email",
    deviceLocation: { latitude: 0, longitude: 0, continent: "", country: "", county: "", state: "", road: "" },
    age: undefined,
    gender: undefined,
    notifications: defaultNotificationPreferences,
    privacy: {
      showWatchlist: true,
      showRecentlyWatched: false,
      showRatings: false,
    },
  });

  const { login, loginData, registerData, register, myselfData } = useUsers();
  const { locationData } = useOC();
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prev) => ({ ...prev, [name]: name === "email" ? value.toLowerCase() : value }));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userData: GoogleUserResponse = userInfo.data;
      login(
        { email: userData.email, password: userData.sub, deviceId: deviceId(), deviceName: deviceName(), deviceType: deviceType(), deviceLocation: userValue.deviceLocation },
        "google",
        { email: userData.email, password: userData.sub, firstname: userData.given_name, lastname: userData.family_name, isVerified: userData.email_verified, profilePic: userData.picture, deviceName: deviceName(), deviceType: deviceType(), deviceId: deviceId(), loginType: "google", deviceLocation: userValue.deviceLocation }
      );
    },
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (myselfData?.isSuccess) navigate("/");
  }, [myselfData?.isSuccess, navigate]);

  useEffect(() => {
    setUserValue((prev) => ({ ...prev, deviceLocation: locationData.data }));
  }, [locationData]);

  const step1Valid =
    isValidEmail(userValue.email) &&
    userValue.firstname.trim().length > 0 &&
    userValue.password.trim().length >= 8 &&
    cpassword === userValue.password;

  const step2Valid = !!userValue.age && !!userValue.gender;

  const steps = ["Account", "About You", "Preferences", "Welcome"];

  const isBusy = Boolean(loginData?.isLoading || registerData?.isLoading);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        py: "calc(var(--sm-nav-height) + 32px)",
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: "1.75rem" }}>Create your account</Typography>
          <Typography level="body-sm" sx={{ mt: 1 }}>
            Step {step + 1} of {steps.length} · {steps[step]}
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "lg",
            backgroundColor: "background.surface",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
        {/* progress rail */}
        <Box sx={{ display: "flex", gap: 0.75 }}>
          {steps.map((label, i) => (
            <Box
              key={label}
              sx={{
                flex: 1,
                height: 3,
                borderRadius: "999px",
                backgroundColor: i <= step ? "#ffffff" : "background.level2",
                transition: "background-color 200ms ease",
              }}
            />
          ))}
        </Box>

        {/* ─── STEP 0: Account ─── */}
        {step === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
              <FormControl required sx={{ flex: 1 }}>
                <FormLabel>Firstname</FormLabel>
                <Input name="firstname" value={userValue.firstname} onChange={handleInput} placeholder="John" startDecorator={<Person sx={{ fontSize: 16 }} />} />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Lastname</FormLabel>
                <Input name="lastname" value={userValue.lastname} onChange={handleInput} placeholder="Doe" startDecorator={<Person sx={{ fontSize: 16 }} />} />
              </FormControl>
            </Box>
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input name="email" value={userValue.email} onChange={handleInput} placeholder="user@example.com" startDecorator={<Mail sx={{ fontSize: 16 }} />} />
            </FormControl>
            <FormControl
              required
              color={userValue.password.trim() && userValue.password.length < 8 ? "warning" : cpassword.trim().length >= 8 && cpassword !== userValue.password && userValue.password.trim().length >= 8 ? "danger" : "neutral"}
            >
              <FormLabel>Password</FormLabel>
              <Input
                name="password" value={userValue.password} onChange={handleInput}
                type={passwordVisibility ? "text" : "password"}
                placeholder="Min 8 characters"
                startDecorator={<Lock sx={{ fontSize: 16 }} />}
                endDecorator={<IconButton label={passwordVisibility ? "Hide password" : "Show password"} size="sm" onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</IconButton>}
              />
              <FormHelperText>
                {userValue.password.trim() && userValue.password.length < 8 && "Too short"}
                {cpassword.trim().length >= 8 && cpassword !== userValue.password && userValue.password.trim().length >= 8 && "Passwords don't match"}
              </FormHelperText>
            </FormControl>
            <FormControl required color={cpassword.trim() && cpassword.length < 8 ? "warning" : cpassword !== userValue.password && cpassword.trim().length >= 8 && userValue.password.trim().length >= 8 ? "danger" : "neutral"}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                name="cpassword" value={cpassword} onChange={(e) => setCpassword(e.target.value)}
                type={passwordVisibility ? "text" : "password"}
                placeholder="Repeat your password"
                startDecorator={<Lock sx={{ fontSize: 16 }} />}
                endDecorator={<IconButton label={passwordVisibility ? "Hide password" : "Show password"} size="sm" onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</IconButton>}
              />
            </FormControl>
            <Button
              size="lg"
              fullWidth
              disabled={!step1Valid}
              loading={isBusy}
              endDecorator={<ArrowForward sx={{ fontSize: 16 }} />}
              onClick={() => setStep(1)}
            >
              Continue
            </Button>
            <Divider><Typography level="body-xs">or</Typography></Divider>
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
        )}

        {/* ─── STEP 1: About You ─── */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography level="title-lg">Tell us about yourself</Typography>
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                This helps SmileAI give you better recommendations.
              </Typography>
            </Box>

            <FormControl required>
              <FormLabel>Your Age</FormLabel>
              <Input
                name="age" type="number" value={userValue.age || ""}
                onChange={(e) => setUserValue((prev) => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="e.g. 25" slotProps={{ input: { min: 5, max: 120 } }}
              />
            </FormControl>

            <FormControl required>
              <FormLabel>Gender</FormLabel>
              <Select
                value={userValue.gender || null}
                onChange={(_, v) => setUserValue((prev) => ({ ...prev, gender: v as any }))}
                placeholder="Select gender"
              >
                {GENDER_OPTIONS.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="lg" variant="outlined" color="neutral" startDecorator={<ArrowBack sx={{ fontSize: 16 }} />} onClick={() => setStep(0)} sx={{ flex: 1 }}>Back</Button>
              <Button
                size="lg"
                disabled={!step2Valid}
                endDecorator={<ArrowForward sx={{ fontSize: 16 }} />}
                onClick={() => setStep(2)}
                sx={{ flex: 2 }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* ─── STEP 2: Preferences ─── */}
        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography level="title-lg">Preferences</Typography>
              <Typography level="body-sm" sx={{ mt: 0.5 }}>Customise your experience.</Typography>
            </Box>

            <Typography level="title-sm">Notifications</Typography>
            {notificationToggleOptions.map(({ key, label }) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Typography level="body-sm">{label}</Typography>
                <Switch
                  checked={Boolean((userValue.notifications as any)?.[key])}
                  slotProps={{ input: { "aria-label": label } }}
                  onChange={() => setUserValue((prev) => ({ ...prev, notifications: { ...defaultNotificationPreferences, ...prev.notifications!, [key]: !(prev.notifications as any)[key] } }))}
                />
              </Box>
            ))}

            <FormControl>
              <FormLabel>Email cadence</FormLabel>
              <Select
                value={userValue.notifications?.digestMode || "instant"}
                onChange={(_, value) =>
                  setUserValue((prev) => ({
                    ...prev,
                    notifications: {
                      ...defaultNotificationPreferences,
                      ...prev.notifications!,
                      digestMode: (value || "instant") as any,
                    },
                  }))
                }
              >
                {notificationDigestOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <Divider />
            <Typography level="title-sm">Privacy</Typography>
            {[
              { key: "showWatchlist", label: "Show my watchlist to others" },
              { key: "showRecentlyWatched", label: "Show my recently watched titles" },
              { key: "showRatings", label: "Show my ratings to others" },
            ].map(({ key, label }) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Typography level="body-sm">{label}</Typography>
                <Switch
                  checked={Boolean((userValue.privacy as any)?.[key])}
                  slotProps={{ input: { "aria-label": label } }}
                  onChange={() => setUserValue((prev) => ({ ...prev, privacy: { ...prev.privacy!, [key]: !(prev.privacy as any)[key] } }))}
                />
              </Box>
            ))}

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button size="lg" variant="outlined" color="neutral" startDecorator={<ArrowBack sx={{ fontSize: 16 }} />} onClick={() => setStep(1)} sx={{ flex: 1 }}>Back</Button>
              <Button
                size="lg"
                onClick={() => register(userValue)}
                loading={isBusy}
                sx={{ flex: 2 }}
              >
                Create account
              </Button>
            </Box>
          </Box>
        )}
        </Box>

        <Typography level="body-sm" sx={{ textAlign: "center", mt: 2.5 }}>
          Already have an account?{" "}
          <Link onClick={() => navigate("/auth/login")} sx={{ cursor: "pointer" }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Register;
