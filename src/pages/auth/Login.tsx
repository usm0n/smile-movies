import {
  Lock,
  Mail,
  Visibility,
  VisibilityOff,
  Warning,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Link,
  Modal,
  ModalDialog,
  useColorScheme,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { GoogleUserResponse, Location, UserLogin } from "../../user";
import {
  backdropLoading,
  deviceId,
  deviceName,
  deviceType,
  isLoggedIn,
  isValidEmail,
  reload,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUsers } from "../../context/Users";
import { useOC } from "../../context/OC";
import axios from "axios";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="24"
    height="24"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

function Login() {
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const [userValue, setUserValue] = useState<UserLogin>({
    email: "",
    password: "",
    deviceId: deviceId(),
    deviceName: deviceName(),
    deviceType: deviceType(),
    deviceLocation: {} as Location,
  });

  const { login, loginData, registerData } = useUsers();
  const { getLocation, locationData } = useOC();

  const { colorScheme } = useColorScheme();

  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prevUserData) => ({
      ...prevUserData,
      [name]: name == "email" ? value.toLocaleLowerCase() : value,
    }));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );
      const userData: GoogleUserResponse = userInfo.data;
      login(
        {
          email: userData.email,
          password: userData.sub,
          deviceId: deviceId(),
          deviceName: deviceName(),
          deviceType: deviceType(),
          deviceLocation: userValue.deviceLocation,
        },
        "google",
        {
          email: userData.email,
          password: userData.sub,
          firstname: userData.given_name,
          lastname: userData.family_name,
          isVerified: userData.email_verified,
          profilePic: userData.picture,
          deviceName: deviceName(),
          deviceType: deviceType(),
          deviceId: deviceId(),
          loginType: "google",
          deviceLocation: userValue.deviceLocation,
        }
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    } else {
      getLocation();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setUserValue((prevUserData) => ({
      ...prevUserData,
      deviceLocation: locationData.data,
    }));
  }, [locationData]);

  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        login(userValue, "email");
      }}
    >
      {backdropLoading(
        loginData?.isLoading ||
          registerData?.isLoading ||
          locationData?.loading,
        colorScheme
      )}
      <Modal
        sx={{
          zIndex: 10000,
        }}
        open={locationData.error}
      >
        <ModalDialog>
          <DialogTitle>
            <Warning />
            You denied location access
          </DialogTitle>
          <DialogContent>
            Please allow location access to continue
          </DialogContent>
          <DialogActions>
            <Button onClick={() => reload()}>Allow</Button>
            <Button
              color="neutral"
              variant="soft"
              onClick={() => navigate("/")}
            >
              Don't Allow
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
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
            <Button
              onClick={() => googleLogin()}
              startDecorator={<GoogleIcon />}
              variant="soft"
              color="neutral"
            >
              Sign in with Google
            </Button>
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
