import {
  AutoAwesome,
  Lock,
  Mail,
  Person,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Search,
} from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Link,
  Option,
  Select,
  Step,
  StepIndicator,
  Stepper,
  Textarea,
  Tooltip,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { FavoriteMedia, GoogleUserResponse, UserRegister } from "../../user";
import {
  backdropLoading,
  deviceId,
  deviceName,
  deviceType,
  isLoggedIn,
  isValidEmail,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import React from "react";
import axios from "axios";
import { tmdbAPI } from "../../service/api/api";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
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
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaResults, setMediaResults] = useState<FavoriteMedia[]>([]);
  const [mediaSearchLoading, setMediaSearchLoading] = useState(false);
  const searchTimeout = useRef<any>(null);

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
    favoriteMovies: [],
    notifications: { emailNotifications: true, newReleases: true, recommendations: true, watchlistUpdates: true },
    privacy: { showWatchlist: true, showFavorites: true },
  });

  const { login, loginData, registerData, register } = useUsers();
  const { getLocation, locationData } = useOC();
  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prev) => ({ ...prev, [name]: name === "email" ? value.toLowerCase() : value }));
  };

  // TMDB autocomplete for favorite movies/shows
  useEffect(() => {
    if (!mediaSearch.trim()) { setMediaResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setMediaSearchLoading(true);
      try {
        const res = await tmdbAPI.get(`/search/multi?query=${encodeURIComponent(mediaSearch)}&page=1`);
        const results: FavoriteMedia[] = (res.data?.results || [])
          .filter((r: any) => (r.media_type === "movie" || r.media_type === "tv") && (r.title || r.name))
          .slice(0, 8)
          .map((r: any) => ({
            id: String(r.id),
            title: r.title || r.name,
            type: r.media_type as "movie" | "tv",
            poster: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : undefined,
          }));
        setMediaResults(results);
      } catch (_) {}
      setMediaSearchLoading(false);
    }, 350);
  }, [mediaSearch]);

  const addFavorite = (media: FavoriteMedia) => {
    if ((userValue.favoriteMovies || []).length >= 3) return;
    if ((userValue.favoriteMovies || []).find((m) => m.id === media.id)) return;
    setUserValue((prev) => ({ ...prev, favoriteMovies: [...(prev.favoriteMovies || []), media] }));
    setMediaSearch("");
    setMediaResults([]);
  };

  const removeFavorite = (id: string) => {
    setUserValue((prev) => ({ ...prev, favoriteMovies: (prev.favoriteMovies || []).filter((m) => m.id !== id) }));
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
    if (isLoggedIn) navigate("/");
    else getLocation();
  }, [isLoggedIn]);

  useEffect(() => {
    setUserValue((prev) => ({ ...prev, deviceLocation: locationData.data }));
  }, [locationData]);

  const step1Valid =
    isValidEmail(userValue.email) &&
    userValue.firstname.trim().length > 0 &&
    userValue.password.trim().length >= 8 &&
    cpassword === userValue.password;

  const step2Valid = !!userValue.age && !!userValue.gender && (userValue.favoriteMovies || []).length === 3;

  const steps = ["Account", "About You", "Preferences", "Welcome"];

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", py: 6, px: 2 }}>
      {backdropLoading(loginData?.isLoading || registerData?.isLoading, colorScheme)}
      <Card sx={{ padding: "40px", borderRadius: "16px", gap: "24px", width: "100%", maxWidth: 520 }}>
        {/* Stepper */}
        <Stepper sx={{ width: "100%" }}>
          {steps.map((label, i) => (
            <Step
              key={label}
              indicator={
                <StepIndicator
                  variant={i <= step ? "solid" : "outlined"}
                  color={i < step ? "success" : i === step ? "primary" : "neutral"}
                >
                  {i < step ? <CheckCircle sx={{ fontSize: 16 }} /> : i + 1}
                </StepIndicator>
              }
            >
              <Typography level="body-xs" sx={{ display: { xs: "none", sm: "block" } }}>{label}</Typography>
            </Step>
          ))}
        </Stepper>

        {/* ─── STEP 0: Account ─── */}
        {step === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h4" fontWeight={700}>Create your account</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl required sx={{ flex: 1 }}>
                <FormLabel>Firstname</FormLabel>
                <Input name="firstname" value={userValue.firstname} onChange={handleInput} placeholder="John" startDecorator={<Person />} />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Lastname</FormLabel>
                <Input name="lastname" value={userValue.lastname} onChange={handleInput} placeholder="Doe" startDecorator={<Person />} />
              </FormControl>
            </Box>
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input name="email" value={userValue.email} onChange={handleInput} placeholder="user@example.com" startDecorator={<Mail />} />
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
                startDecorator={<Lock />}
                endDecorator={<IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff /> : <Visibility />}</IconButton>}
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
                startDecorator={<Lock />}
                endDecorator={<IconButton onClick={() => setPasswordVisibility(!passwordVisibility)}>{passwordVisibility ? <VisibilityOff /> : <Visibility />}</IconButton>}
              />
            </FormControl>
            <Button
              disabled={!step1Valid || loginData?.isLoading || registerData?.isLoading}
              endDecorator={<ArrowForward />}
              onClick={() => setStep(1)}
              sx={{ background: "rgb(255,216,77)", color: "black", "&:hover": { background: "rgb(230,195,60)" } }}
            >
              Continue
            </Button>
            <FormHelperText>Already have an account? <Link onClick={() => navigate("/auth/login")}>Sign in</Link></FormHelperText>
            <Divider>or</Divider>
            <Button onClick={() => googleLogin()} startDecorator={<GoogleIcon />} variant="soft" color="neutral">Sign in with Google</Button>
          </Box>
        )}

        {/* ─── STEP 1: About You ─── */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography level="h4" fontWeight={700}>Tell us about yourself</Typography>
              <Typography level="body-sm" textColor="neutral.400">
                This helps SmileAI give you better recommendations
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

            <Box>
              <FormLabel>3 Favorite Movies or TV Shows</FormLabel>
              <Typography level="body-xs" textColor="neutral.400" sx={{ mb: 1 }}>
                Search and pick exactly 3. SmileAI uses these for recommendations.
              </Typography>

              {(userValue.favoriteMovies || []).length < 3 && (
                <Box sx={{ position: "relative" }}>
                  <Input
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Search a movie or TV show..."
                    startDecorator={<Search />}
                    disabled={mediaSearchLoading}
                  />
                  {mediaResults.length > 0 && (
                    <Card
                      sx={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                        maxHeight: 280, overflowY: "auto", mt: 0.5, p: 0.5,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    >
                      {mediaResults.map((media) => (
                        <Box
                          key={media.id}
                          onClick={() => addFavorite(media)}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1.5, p: 1,
                            borderRadius: 8, cursor: "pointer",
                            "&:hover": { background: "rgba(255,216,77,0.1)" },
                          }}
                        >
                          {media.poster ? (
                            <Box component="img" src={media.poster} sx={{ width: 32, height: 48, borderRadius: 4, objectFit: "cover" }} />
                          ) : (
                            <Box sx={{ width: 32, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} />
                          )}
                          <Box>
                            <Typography level="body-sm" fontWeight={600}>{media.title}</Typography>
                            <Chip size="sm" variant="soft" color={media.type === "movie" ? "primary" : "success"} sx={{ fontSize: 10 }}>
                              {media.type === "movie" ? "Movie" : "TV"}
                            </Chip>
                          </Box>
                        </Box>
                      ))}
                    </Card>
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {(userValue.favoriteMovies || []).map((media) => (
                  <Chip
                    key={media.id}
                    startDecorator={media.poster ? <Avatar src={media.poster} size="sm" /> : undefined}
                    endDecorator={
                      <IconButton size="sm" onClick={() => removeFavorite(media.id)}>✕</IconButton>
                    }
                    variant="soft"
                    color="primary"
                  >
                    {media.title}
                  </Chip>
                ))}
                {(userValue.favoriteMovies || []).length < 3 && (
                  <Typography level="body-xs" textColor="neutral.400" sx={{ alignSelf: "center" }}>
                    {3 - (userValue.favoriteMovies || []).length} more needed
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" color="neutral" startDecorator={<ArrowBack />} onClick={() => setStep(0)} sx={{ flex: 1 }}>Back</Button>
              <Button
                disabled={!step2Valid}
                endDecorator={<ArrowForward />}
                onClick={() => setStep(2)}
                sx={{ flex: 2, background: "rgb(255,216,77)", color: "black", "&:hover": { background: "rgb(230,195,60)" } }}
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
              <Typography level="h4" fontWeight={700}>Preferences</Typography>
              <Typography level="body-sm" textColor="neutral.400">Customize your experience</Typography>
            </Box>

            <Typography level="title-sm">Notifications</Typography>
            {[
              { key: "emailNotifications", label: "Email notifications" },
              { key: "newReleases", label: "New release alerts" },
              { key: "recommendations", label: "Personalized recommendations" },
              { key: "watchlistUpdates", label: "Watchlist updates" },
            ].map(({ key, label }) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography level="body-sm">{label}</Typography>
                <Button
                  size="sm"
                  variant={(userValue.notifications as any)?.[key] ? "solid" : "outlined"}
                  color={(userValue.notifications as any)?.[key] ? "success" : "neutral"}
                  onClick={() => setUserValue((prev) => ({ ...prev, notifications: { ...prev.notifications!, [key]: !(prev.notifications as any)[key] } }))}
                  sx={{ minWidth: 60 }}
                >
                  {(userValue.notifications as any)?.[key] ? "On" : "Off"}
                </Button>
              </Box>
            ))}

            <Divider />
            <Typography level="title-sm">Privacy</Typography>
            {[
              { key: "showWatchlist", label: "Show my watchlist to others" },
              { key: "showFavorites", label: "Show my favorites to others" },
            ].map(({ key, label }) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography level="body-sm">{label}</Typography>
                <Button
                  size="sm"
                  variant={(userValue.privacy as any)?.[key] ? "solid" : "outlined"}
                  color={(userValue.privacy as any)?.[key] ? "primary" : "neutral"}
                  onClick={() => setUserValue((prev) => ({ ...prev, privacy: { ...prev.privacy!, [key]: !(prev.privacy as any)[key] } }))}
                  sx={{ minWidth: 60 }}
                >
                  {(userValue.privacy as any)?.[key] ? "On" : "Off"}
                </Button>
              </Box>
            ))}

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button variant="outlined" color="neutral" startDecorator={<ArrowBack />} onClick={() => setStep(1)} sx={{ flex: 1 }}>Back</Button>
              <Button
                endDecorator={<ArrowForward />}
                onClick={() => register(userValue)}
                disabled={loginData?.isLoading || registerData?.isLoading}
                sx={{ flex: 2, background: "rgb(255,216,77)", color: "black", "&:hover": { background: "rgb(230,195,60)" } }}
              >
                {loginData?.isLoading || registerData?.isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default Register;
