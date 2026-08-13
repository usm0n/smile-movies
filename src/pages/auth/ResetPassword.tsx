import { useNavigate, useParams } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { Box, Input } from "@mui/joy";
import { useEffect, useState } from "react";
import { Lock, Visibility, VisibilityOff } from "../../components/ui/icons";
import { isValidEmail } from "../../utilities/defaults";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import IconButton from "../../components/ui/IconButton";

function ResetPassword() {
  const { email, token } = useParams();
  const { resetPassword, resetPasswordData } = useUsers();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [password, setPassword] = useState({ newPassword: "", newPasswordConfirm: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (resetPasswordData?.isSuccess) {
      navigate("/auth/login");
    }
  }, [resetPasswordData]);

  const tooShort =
    password.newPassword.trim().length > 0 && password.newPassword.length < 8;
  const mismatch =
    password.newPasswordConfirm.trim().length >= 8 &&
    password.newPassword.trim().length >= 8 &&
    password.newPasswordConfirm !== password.newPassword;

  const visibilityToggle = (
    <IconButton
      label={passwordVisibility ? "Hide password" : "Show password"}
      size="sm"
      onClick={() => setPasswordVisibility(!passwordVisibility)}
    >
      {passwordVisibility ? (
        <VisibilityOff sx={{ fontSize: 16 }} />
      ) : (
        <Visibility sx={{ fontSize: 16 }} />
      )}
    </IconButton>
  );

  return (
    <AuthCard
      title="Set a new password"
      description={`Choose a new password for ${email}.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          resetPassword(email!, token!, password.newPassword);
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field
            label="New password"
            required
            error={tooShort ? "Use at least 8 characters" : null}
          >
            <Input
              name="password"
              autoComplete="new-password"
              onChange={(e) =>
                setPassword({ ...password, newPassword: e.target.value })
              }
              value={password.newPassword}
              endDecorator={visibilityToggle}
              placeholder="Min 8 characters"
              type={passwordVisibility ? "text" : "password"}
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
            />
          </Field>

          <Field
            label="Confirm new password"
            required
            error={mismatch ? "Passwords don't match" : null}
          >
            <Input
              name="cpassword"
              autoComplete="new-password"
              onChange={(e) =>
                setPassword({ ...password, newPasswordConfirm: e.target.value })
              }
              value={password.newPasswordConfirm}
              endDecorator={visibilityToggle}
              placeholder="Repeat your password"
              type={passwordVisibility ? "text" : "password"}
              startDecorator={<Lock sx={{ fontSize: 16 }} />}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={resetPasswordData?.isLoading}
            disabled={
              !isValidEmail(email!) ||
              password.newPasswordConfirm.trim().length < 8 ||
              password.newPasswordConfirm !== password.newPassword ||
              password.newPassword.trim().length < 8
            }
          >
            Update password
          </Button>
        </Box>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;
