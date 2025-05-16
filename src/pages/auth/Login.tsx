import { Lock, Mail, Visibility, VisibilityOff } from "@mui/icons-material";
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
import { GoogleUserResponse, UserLogin } from "../../user";
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

function Login() {
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const [userValue, setUserValue] = useState<UserLogin>({
    email: "",
    password: "",
    deviceId: deviceId(),
    deviceName: deviceName(),
    deviceType: deviceType(),
  });

  const { login, loginData, registerData } = useUsers();

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
        login(userValue, "email");
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
          height: "100vh",
        }}
      >
        <Card
          sx={{
            padding: "50px",
            borderRadius: "10px",
            gap: "20px",
          }}
        >
          <FormLabel sx={{ fontSize: "20px" }}>Sign in</FormLabel>
          <Box gap={1} display={"flex"} flexDirection={"column"}>
            <FormControl color={loginData?.isIncorrect ? "danger" : "neutral"}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                onChange={handleInput}
                value={userValue.email}
                placeholder="Your email"
                startDecorator={<Mail />}
              />
              <FormHelperText>
                {loginData?.isIncorrect && "Invalid credentials"}
              </FormHelperText>
            </FormControl>

            <FormControl color={loginData?.isIncorrect ? "danger" : "neutral"}>
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
                {loginData?.isIncorrect && "Invalid credentials"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Button
            type="submit"
            disabled={
              !isValidEmail(userValue.email) ||
              !userValue.email.trim() ||
              !userValue.password.trim() ||
              loginData?.isLoading ||
              registerData?.isLoading
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
              : "Sign in"}
          </Button>
          <FormHelperText>
            Don't have an account yet?{" "}
            <Link onClick={() => navigate("/auth/register")}>Create one</Link>
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
                    deviceName: deviceName(),
                    deviceType: deviceType(),
                    deviceId: deviceId(),
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

export default Login;
