import { Box, Typography } from "@mui/joy";
import { MarkEmailReadRounded } from "../../../components/ui/icons";
import { useUsers } from "../../../context/Users";
import AuthCard from "../../../components/auth/AuthCard";
import Button from "../../../components/ui/Button";

function EmailSent() {
  const email = sessionStorage.getItem("forgot-password");
  const { resendForgotPasswordData, resendForgotPasswordToken } = useUsers();

  return (
    <AuthCard title="Check your email" description={`We sent a reset link to ${email}.`}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 44,
            height: 44,
            borderRadius: "md",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.level1",
            color: "text.secondary",
          }}
        >
          <MarkEmailReadRounded sx={{ fontSize: 20 }} />
        </Box>
        <Typography level="body-sm">
          The link expires shortly. If it doesn't arrive, check your spam folder.
        </Typography>
        <Button
          variant="outlined"
          color="neutral"
          fullWidth
          loading={resendForgotPasswordData?.isLoading}
          onClick={() => resendForgotPasswordToken(email!)}
        >
          Resend link
        </Button>
      </Box>
    </AuthCard>
  );
}

export default EmailSent;
