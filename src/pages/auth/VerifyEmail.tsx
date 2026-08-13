import { Box, Input, Link, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import EmptyState from "../../components/ui/EmptyState";
import AuthCard from "../../components/auth/AuthCard";
import { toast } from "../../components/ui/toast";
import { useEffect, useState } from "react";
import { useUsers } from "../../context/Users";
import { Message, User } from "../../user";
import { CheckCircle, Edit, Email, Person } from "../../components/ui/icons";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "../../utilities/defaults";

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
  const [otp, setOtp] = useState<string>("");
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
      toast.success(`New code sent to ${currentUser?.email}`);
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
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Box className="sm-shimmer" sx={{ width: 220, height: 12, borderRadius: "6px" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <EmptyState
            icon={Person}
            title="Sign in to verify your email"
            description="Your verification code is tied to your active session."
            action={<Button onClick={() => navigate("/auth/login")}>Sign In</Button>}
          />
        </Box>
      </Box>
    );
  }

  if (currentUser?.isVerified) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <EmptyState
            icon={CheckCircle}
            title="Email already verified"
            description="Your account is ready. Redirecting you back to the app."
            action={<Button onClick={() => navigate("/")}>Go home</Button>}
          />
        </Box>
      </Box>
    );
  }

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox."
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Field label="Email">
          <Input
            disabled
            startDecorator={<Email sx={{ fontSize: 16 }} />}
            value={currentUser?.email}
            endDecorator={
              <IconButton
                label="Change email"
                size="sm"
                onClick={() => setOpenChangeEmail(true)}
              >
                <Edit sx={{ fontSize: 15 }} />
              </IconButton>
            }
          />
        </Field>

        <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
          {[...Array(6)].map((_, index) => (
            <Input
              color={verifyData?.isError ? "danger" : verifySuccess ? "success" : "neutral"}
              disabled={verifyData?.isLoading}
              key={index}
              type="text"
              aria-label={`Digit ${index + 1}`}
              slotProps={{
                input: {
                  maxLength: 1,
                  style: { textAlign: "center", padding: 0 },
                },
              }}
              value={otp[index] || ""}
              sx={{
                width: 46,
                height: 52,
                fontFamily: "code",
                fontSize: "1.125rem",
                "& input": { textAlign: "center" },
              }}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
                  (
                    e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                      "input",
                    ) as HTMLInputElement
                  )?.focus();
                }
              }}
            />
          ))}
        </Box>

        {verifyErrorMessage && (
          <Typography level="body-sm" sx={{ color: "danger.plainColor" }}>
            {verifyErrorMessage}
          </Typography>
        )}
        {verifySuccess && (
          <Typography level="body-sm" sx={{ color: "success.plainColor" }}>
            Verified. Taking you home…
          </Typography>
        )}

        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          Didn't get it?{" "}
          <Link
            onClick={() => resendTokenVerification()}
            disabled={resendTokenVerificationData?.isLoading}
            sx={{ cursor: "pointer" }}
          >
            Send another code
          </Link>
        </Typography>
      </Box>

      <Dialog
        open={openChangeEmail}
        onClose={() => setOpenChangeEmail(false)}
        title="Change email"
        description="We'll send a fresh verification code to the new address."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setOpenChangeEmail(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                updateMyself({ ...(myselfData?.data as User), email: newEmail })
              }
              loading={updatedMyselfData?.isLoading}
              disabled={
                !newEmail ||
                newEmail === (myselfData?.data as User)?.email ||
                !isValidEmail(newEmail)
              }
            >
              Update email
            </Button>
          </>
        }
      >
        <Field label="New email">
          <Input
            startDecorator={<Email sx={{ fontSize: 16 }} />}
            type="email"
            placeholder="you@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value.toLocaleLowerCase())}
          />
        </Field>
      </Dialog>
    </AuthCard>
  );
}

export default VerifyEmail;
