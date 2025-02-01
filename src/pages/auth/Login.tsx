import {
  GitHub,
  Lock,
  Mail,
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
  Typography,
} from "@mui/joy";
import SvgIcon from "@mui/joy/SvgIcon";
import { useUsers } from "../../context/Users";
import { useEffect, useState } from "react";
import { UserLogin } from "../../user";
import { isLoggedIn, isValidEmail } from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login, loginData } = useUsers();
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  const [userValue, setUserValue] = useState<UserLogin>({
    email: "",
    password: "",
  });

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
            <Card
              size="sm"
              sx={{
                justifyContent: "center",
                cursor: "pointer",
                ":hover": {
                  transition: "all 0.2s ease-in-out",
                  filter: "brightness(0.9)",
                },
              }}
              orientation="horizontal"
            >
              <Typography startDecorator={<GoogleIcon />}>
                Sign in with Google
              </Typography>
            </Card>
            <Card
              size="sm"
              sx={{
                justifyContent: "center",
                cursor: "pointer",
                ":hover": {
                  transition: "all 0.2s ease-in-out",
                  filter: "brightness(0.9)",
                },
              }}
              orientation="horizontal"
            >
              <Typography startDecorator={<GitHub />}>
                Sign in with GitHub
              </Typography>
            </Card>
          </Box>
        </Card>
      </Box>
    </form>
  );
}

export default Login;

function GoogleIcon() {
  return (
    <SvgIcon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="705.6"
        height="720"
        viewBox="0 0 186.69 190.5"
        fill="currentColor"
      >
        <g transform="translate(1184.583 765.171)">
          <path
            clipPath="none"
            mask="none"
            d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
            fill="#4285f4"
          />
          <path
            clipPath="none"
            mask="none"
            d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
            fill="#34a853"
          />
          <path
            clipPath="none"
            mask="none"
            d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
            fill="#fbbc05"
          />
          <path
            d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
            fill="#ea4335"
            clipPath="none"
            mask="none"
          />
        </g>
      </svg>
    </SvgIcon>
  );
}
