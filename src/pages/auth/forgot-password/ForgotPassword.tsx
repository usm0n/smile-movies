import { Mail } from "../../../components/ui/icons";
import { Box, Input, Link, Typography } from "@mui/joy";
import { isValidEmail, reload } from "../../../utilities/defaults";
import { useEffect, useState } from "react";
import { useUsers } from "../../../context/Users";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../../components/auth/AuthCard";
import Button from "../../../components/ui/Button";
import Field from "../../../components/ui/Field";

function ForgotPasswordEmail() {
  const [userEmail, setUserEmail] = useState("");
  const { forgotPassword, forgotPasswordData } = useUsers();
  const navigate = useNavigate();

  useEffect(() => {
    if (forgotPasswordData?.data) {
      sessionStorage.setItem("forgot-password", `${userEmail}`);
      reload();
    }
  }, [forgotPasswordData]);

  return (
    <AuthCard
      title="Reset your password"
      description="We'll email you a link to set a new one."
      footer={
        <Typography level="body-sm">
          Remembered it?{" "}
          <Link onClick={() => navigate("/auth/login")} sx={{ cursor: "pointer" }}>
            Back to sign in
          </Link>
        </Typography>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          forgotPassword(userEmail);
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field label="Email">
            <Input
              disabled={forgotPasswordData?.isLoading}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value.toLocaleLowerCase())}
              startDecorator={<Mail sx={{ fontSize: 16 }} />}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={forgotPasswordData?.isLoading}
            disabled={!isValidEmail(userEmail) || !userEmail.trim()}
          >
            Send reset link
          </Button>
        </Box>
      </form>
    </AuthCard>
  );
}

export default ForgotPasswordEmail;
