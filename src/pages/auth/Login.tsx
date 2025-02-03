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
import { useUsers } from "../../context/Users";
import { useEffect, useState } from "react";
import { GoogleUserResponse, UserLogin } from "../../user";
import {
  backdropLoading,
  isLoggedIn,
  isValidEmail,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Login() {
  const { login, loginData, register, registerData } = useUsers();
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const [userValue, setUserValue] = useState<UserLogin>({
    email: "",
    password: "",
  });

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
        login(userValue);
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
            <FormControl color={loginData?.isError ? "danger" : "neutral"}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                onChange={handleInput}
                value={userValue.email}
                placeholder="user@example.com"
                startDecorator={<Mail />}
              />
              <FormHelperText>
                {loginData?.isError && "Invalid credentials"}
              </FormHelperText>
            </FormControl>

            <FormControl color={loginData?.isError ? "danger" : "neutral"}>
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
                {loginData?.isError && "Invalid credentials"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Button
            type="submit"
            disabled={
              !isValidEmail(userValue.email) ||
              !userValue ||
              loginData?.isLoading
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
            {loginData?.isLoading ? "Loading..." : "Sign in"}
          </Button>
          <FormHelperText>
            Don't have an account yet? <Link>Create one</Link>
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
                login({
                  email: decodedToken.email,
                  password: decodedToken.sub,
                }).then(() => {
                  if (loginData?.isError) {
                    register({
                      email: decodedToken.email,
                      password: decodedToken.sub,
                      firstname: decodedToken.given_name,
                      lastname: decodedToken.family_name,
                      profilePic: decodedToken.picture,
                      isVerified: true,
                    });
                  }
                });
              }}
              onError={() => console.log("Login Failed")}
              useOneTap
              auto_select
            />
          </Box>
        </Card>
      </Box>
    </form>
  );
}

export default Login;
