import {
  Lock,
  Mail,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Link,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { GoogleUserResponse, UserRegister } from "../../user";
import {
  backdropLoading,
  deviceId,
  deviceName,
  deviceType,
  isLoggedIn,
  isValidEmail,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useUsers } from "../../context/Users";

function Register() {
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const [cpassword, setCpassword] = useState<string>("");
  const [userValue, setUserValue] = useState<UserRegister>({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    deviceId: deviceId(),
    deviceName: deviceName(),
    deviceType: deviceType(),
    loginType: "email",
  });

  const { login, loginData, registerData, register } = useUsers();

  const { colorScheme } = useColorScheme();

  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prevUserData) => ({
      ...prevUserData,
      [name]: value.toLocaleLowerCase(),
    }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        register(userValue);
      }}
    >
      {backdropLoading(
        loginData?.isLoading || registerData?.isLoading,
        colorScheme
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "120vh",
        }}
      >
        <Card
          sx={{
            padding: "50px",
            borderRadius: "10px",
            gap: "20px",
          }}
        >
          <FormLabel sx={{ fontSize: "20px" }}>Sign up</FormLabel>
          <Box gap={1} display={"flex"} flexDirection={"column"}>
            <FormControl required={true}>
              <FormLabel>Firstname</FormLabel>
              <Input
                required
                name="firstname"
                onChange={handleInput}
                value={userValue.firstname}
                placeholder="You firstname"
                startDecorator={<Person />}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Lastname</FormLabel>
              <Input
                name="lastname"
                onChange={handleInput}
                value={userValue.lastname}
                placeholder="You lastname"
                startDecorator={<Person />}
              />
            </FormControl>
            <FormControl
              required={true}
              color={registerData?.isConflict ? "danger" : "neutral"}
            >
              <FormLabel>Email</FormLabel>
              <Input
                required
                name="email"
                onChange={handleInput}
                value={userValue.email}
                placeholder="user@example.com"
                startDecorator={<Mail />}
              />
              <FormHelperText>
                {registerData?.isConflict && "Email already in use"}
              </FormHelperText>
            </FormControl>
            <FormControl
              required={true}
              color={
                userValue.password.trim() && userValue.password.length < 8
                  ? "warning"
                  : cpassword !== userValue.password &&
                    cpassword.trim().length >= 8 &&
                    userValue.password.trim().length >= 8
                  ? "danger"
                  : "neutral"
              }
            >
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                onChange={handleInput}
                value={userValue.password}
                endDecorator={
                  <IconButton
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                  >
                    {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                placeholder="Your Password"
                type={passwordVisibility ? "text" : "password"}
                startDecorator={<Lock />}
              />
              <FormHelperText>
                {!userValue.password.trim() ||
                  (userValue.password.length < 8 && "Password is too short")}
                {cpassword.trim().length >= 8 &&
                  cpassword !== userValue.password &&
                  userValue.password.trim().length >= 8 &&
                  "Password does not match"}
              </FormHelperText>
            </FormControl>
            <FormControl
              required={true}
              color={
                cpassword.trim() && cpassword.length < 8
                  ? "warning"
                  : cpassword !== userValue.password &&
                    cpassword.trim().length >= 8 &&
                    userValue.password.trim().length >= 8
                  ? "danger"
                  : "neutral"
              }
            >
              <FormLabel>Confirm Password</FormLabel>
              <Input
                name="cpassword"
                onChange={(e) => setCpassword(e.target.value)}
                value={cpassword}
                endDecorator={
                  <IconButton
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                  >
                    {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                placeholder="Confirm Your Password"
                type={passwordVisibility ? "text" : "password"}
                startDecorator={<Lock />}
              />
              <FormHelperText>
                {!cpassword.trim() ||
                  (cpassword.length < 8 && "Password is too short")}
                {cpassword !== userValue.password &&
                  cpassword.trim().length >= 8 &&
                  userValue.password.trim().length >= 8 &&
                  "Password does not match"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Button
            type="submit"
            disabled={
              !isValidEmail(userValue.email) ||
              !userValue.firstname.trim() ||
              loginData?.isLoading ||
              registerData?.isLoading ||
              cpassword.trim().length < 8 ||
              cpassword !== userValue.password ||
              userValue.password.trim().length < 8
            }
            sx={{
              background: "rgb(255, 216, 77)",
              color: "black",
              ":hover": {
                background: "rgb(255, 216, 77)",
                opacity: 0.8,
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            {loginData?.isLoading || registerData?.isLoading
              ? "Loading..."
              : "Sign up"}
          </Button>
          <FormHelperText>
            Already have an account?{" "}
            <Link onClick={() => navigate("/auth/login")}>Sign in</Link>
          </FormHelperText>
          <Divider>or</Divider>
          <Box gap={2} display={"flex"} flexDirection={"column"}>
            <GoogleLogin
              size="large"
              text="signin_with"
              theme={colorScheme === "dark" ? "filled_black" : "outline"}
              onSuccess={(credentialResponse) => {
                const decodedToken: GoogleUserResponse = jwtDecode(
                  credentialResponse.credential || ""
                );
                login(
                  {
                    email: decodedToken.email,
                    password: decodedToken.sub,
                    deviceId: deviceId(),
                    deviceName: deviceName(),
                    deviceType: deviceType(),
                  },
                  "google",
                  {
                    email: decodedToken.email,
                    password: decodedToken.sub,
                    firstname: decodedToken.given_name,
                    lastname: decodedToken.family_name,
                    isVerified: true,
                    profilePic: decodedToken.picture,
                    deviceId: deviceId(),
                    deviceName: deviceName(),
                    deviceType: deviceType(),
                    loginType: "google",
                  }
                );
              }}
              onError={() => console.log("Login Failed")}
              useOneTap={!isLoggedIn}
              auto_select={!isLoggedIn}
            />
          </Box>
          {registerData?.isConflict && (
            <FormControl sx={{ width: "300px" }} color="danger">
              <FormHelperText>
                This email is already used by "Email & Password" method. Please
                enter the password correctly or try another Google Account
              </FormHelperText>
            </FormControl>
          )}
        </Card>
      </Box>
    </form>
  );
}

export default Register;
