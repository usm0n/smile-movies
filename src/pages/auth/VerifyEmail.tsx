import {
  Box,
  Button,
  CircularProgress,
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
  ModalClose,
  ModalDialog,
  Snackbar,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useUsers } from "../../context/Users";
import { Message, User } from "../../user";
import { Check, Edit, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  backdropLoading,
  isValidEmail,
} from "../../utilities/defaults";

function VerifyEmail() {
  const {
    myselfData,
    isAuthenticated,
    authResolved,
    resendTokenVerification,
    resendTokenVerificationData,
    verify,
    verifyData,
    updateMyself,
    updatedMyselfData,
  } = useUsers();
  const { colorScheme } = useColorScheme();
  const [otp, setOtp] = useState<string>("");
  const [openRVC, setOpenRVC] = useState<boolean>(false);
  const [openChangeEmail, setOpenChangeEmail] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const currentUser = myselfData?.data as User | undefined;
  const verifyMessage = ((verifyData?.data as Message | undefined)?.message || "").trim();
  const verifyErrorMessage = verifyData?.isError ? verifyMessage || "Could not verify the code." : "";
  const verifySuccess = Boolean(verifyData?.isSuccess);

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
      void verify(otp);
    }
  }, [otp]);

  useEffect(() => {
    if (!(currentUser?.isVerified || verifySuccess)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/");
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [currentUser?.isVerified, navigate, verifySuccess]);

  useEffect(() => {
    setNewEmail(currentUser?.email || "");
  }, [currentUser?.email]);

  if (!authResolved) {
    return backdropLoading(true, colorScheme);
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 420 }}>
          <Typography level="h2" sx={{ mb: 1 }}>
            Sign in to verify your email
          </Typography>
          <Typography level="body-md" textColor="neutral.400" sx={{ mb: 2 }}>
            Your verification code is tied to your active session.
          </Typography>
          <Button onClick={() => navigate("/auth/login")}>Go to sign in</Button>
        </Box>
      </Box>
    );
  }

  if (currentUser?.isVerified) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 420 }}>
          <Typography level="h2" sx={{ mb: 1 }}>
            Email already verified
          </Typography>
          <Typography level="body-md" textColor="neutral.400" sx={{ mb: 2 }}>
            Your account is ready. Redirecting you back to the app.
          </Typography>
          <Button onClick={() => navigate("/")}>Go home</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {backdropLoading(myselfData?.isLoading, colorScheme)}
      <Modal open={openChangeEmail} onClose={() => setOpenChangeEmail(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Change Email</DialogTitle>
          <Divider />
          <DialogContent>
            <FormControl
              // color={updatedMyselfData?.isConflict ? "danger" : "neutral"}
            >
              <FormLabel>Email</FormLabel>
              <Input
                startDecorator={<Email />}
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) =>
                  setNewEmail(e.target.value.toLocaleLowerCase())
                }
              />
              {/* {updatedMyselfData?.isConflict && (
                <FormHelperText color="danger">
                  Email already exists
                </FormHelperText>
              )} */}
              <FormHelperText></FormHelperText>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                updateMyself({ ...(myselfData?.data as User), email: newEmail })
              }
              disabled={
                !newEmail ||
                newEmail === (myselfData?.data as User)?.email ||
                !isValidEmail(newEmail) ||
                updatedMyselfData?.isLoading
              }
              sx={{
                width: "100%",
              }}
            >
              {updatedMyselfData?.isLoading ? "Loading..." : "Change"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
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
        {currentUser?.email}!
      </Snackbar>
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
        </Typography>
        <Box sx={{ position: "relative" }}>
          <Input
            disabled
            startDecorator={<Email />}
            value={currentUser?.email}
          />
          <IconButton
            onClick={() => setOpenChangeEmail(true)}
            sx={{
              position: "absolute",
              right: "0",
              top: "0",
            }}
          >
            <Edit />
          </IconButton>
        </Box>
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
                verifyData?.isError
                  ? "danger"
                  : verifySuccess
                    ? "success"
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
        {verifyErrorMessage && (
          <Typography level="body-sm" color="danger">
            {verifyErrorMessage}
          </Typography>
        )}
        {verifySuccess && (
          <Typography level="body-sm" color="success">
            Verification successful. Redirecting you home.
          </Typography>
        )}
        <Link
          startDecorator={
            resendTokenVerificationData?.isLoading && (
              <CircularProgress value={80} variant="plain" size="sm" />
            )
          }
          onClick={() => resendTokenVerification()}
          disabled={resendTokenVerificationData?.isLoading}
          level="body-md"
        >
          Didn't receive the code? Send another one
        </Link>
      </Box>
    </Box>
  );
}

export default VerifyEmail;
