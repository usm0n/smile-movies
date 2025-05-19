import {
  Box,
  CircularProgress,
  IconButton,
  Input,
  Link,
  Snackbar,
  Typography,
  useColorScheme,
} from "@mui/joy";
import logo from "../../assets/images/logo.png";
import { useEffect, useState } from "react";
import { useUsers } from "../../context/Users";
import { Message, User } from "../../user";
import { Check, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { isLoggedIn } from "../../utilities/defaults";

function VerifyEmail() {
  const {
    myselfData,
    resendTokenVerification,
    resendTokenVerificationData,
    logout,
    verify,
    verifyData,
    deleteDeviceData,
  } = useUsers();
  const { colorScheme } = useColorScheme();
  const [otp, setOtp] = useState<string>("");
  const [openRVC, setOpenRVC] = useState<boolean>(false);

  const navigate = useNavigate();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value.length <= 1) {
      const newOtp = otp.split("");
      newOtp[index] = value;
      setOtp(newOtp.join("").toUpperCase());

      if (value && index < 5) {
        const nextInput =
          e.target.parentElement?.nextElementSibling?.querySelector("input");
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  useEffect(() => {
    if (resendTokenVerificationData?.data) {
      setOpenRVC(true);
    }
  }, [resendTokenVerificationData]);

  useEffect(() => {
    if (otp.length === 6) {
      verify(otp);
    }
  }, [otp]);

  useEffect(() => {
    if (
      myselfData?.data &&
      verifyData?.data &&
      (verifyData?.data as Message)?.message !== "Token not found"
    ) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [verifyData]);

  return !isLoggedIn &&
    myselfData?.data &&
    (myselfData?.data as User)?.isVerified ? (
    <NotFound />
  ) : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor:
          colorScheme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
      }}
    >
      <Snackbar
        startDecorator={<Check />}
        endDecorator={
          <IconButton onClick={() => setOpenRVC(false)}>Dismiss</IconButton>
        }
        color="success"
        open={openRVC}
        onClose={() => setOpenRVC(false)}
        autoHideDuration={5000}
      >
        Verification code sent successfully to{" "}
        {(myselfData?.data as User)?.email}!
      </Snackbar>
      <Box
        sx={{
          position: "absolute",
          backgroundColor: "black",
          top: 0,
          left: 0,
          width: "100%",
          height: "100px",
          zIndex: 1000,
        }}
      >
        <img
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
          }}
          width={100}
          src={logo}
          alt=""
        />
        <IconButton
          onClick={() => {
            logout()
            navigate("/");
          }}
          disabled={deleteDeviceData?.isLoading}
          color="danger"
          sx={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
        >
          <Logout />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "1rem",
          width: "90%",
        }}
      >
        <Typography level="h1">Verify your email</Typography>
        <Typography level="body-md">
          We sent you a 6-digit code to your email address{" "}
          <Link>{(myselfData?.data as User)?.email}</Link>. Enter the code
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            margin: "2rem auto",
            width: "90%",
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Input
              color={
                verifyData
                  ? (verifyData?.data as Message)?.message === "Token not found"
                    ? "danger"
                    : "success"
                  : "neutral"
              }
              disabled={verifyData?.isLoading}
              key={index}
              type="text"
              slotProps={{
                input: {
                  maxLength: 1,
                },
              }}
              value={otp[index] || ""}
              sx={{
                width: "40px",
                height: "40px",
              }}
              onChange={(e) => {
                handleInputChange(e, index);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" &&
                  !e.currentTarget.value &&
                  index > 0
                ) {
                  (
                    e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                      "input"
                    ) as HTMLInputElement
                  )?.focus();
                }
              }}
            />
          ))}{" "}
        </Box>
        <Link
          startDecorator={
            resendTokenVerificationData?.isLoading && (
              <CircularProgress value={80} variant="plain" size="sm" />
            )
          }
          onClick={() =>
            resendTokenVerification((myselfData?.data as User)?.email)
          }
          disabled={resendTokenVerificationData?.isLoading}
          level="body-md"
        >
          Didn't receive the code?{" "}
        </Link>
      </Box>
    </Box>
  );
}

export default VerifyEmail;
