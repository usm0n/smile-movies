import React, { useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { t } from "i18next";
import EditIcon from "@mui/icons-material/Edit";
import { useUser } from "../../contexts/User";
import {
  backdropLoading,
  isValidEmail,
} from "../../utilities/defaultFunctions";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

function Settings({ user }) {
  const {
    updateUserById,
    statusUpdateUserById,
    getUserByEmail,
    statusGetUserByEmail,
    resendToken,
    statusResendCode,
  } = useUser();
  const [userValue, setUserValue] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  });
  const [dialog, setDialog] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInput = (event) => {
    setUserValue({
      ...userValue,
      [event.target.name]: event.target.value.trim(),
    });
  };

  const handleSubmit = () => {
    updateUserById(user._id, userValue);
  };

  const handleOpenDialog = (name) => {
    setDialog({ ...dialog, [name]: true });
  };

  const handleAgreeEmail = () => {
    updateUserById(user._id, {
      email: userValue.email,
      isVerified: false,
    }).then(() => {
      setDialog({ email: false });
      resendToken().then(() => {
        window.location.reload();
      });
    });
  };

  const handleInputEmail = (e) => {
    if (isValidEmail(userValue.email)) {
      getUserByEmail(e.target.value);
    }
    setUserValue({ email: e.target.value });
  };

  const handleInputPassword = (event) => {
    setPasswords({
      ...passwords,
      [event.target.name]: event.target.value,
    });
  };

  const handleAgreePassword = () => {
    updateUserById(user._id, { password: passwords.newPassword }).then(() => {
      window.location.reload();
    });
  };
  return (
    <div className="settings">
      <div className="container">
        <div className="settings-content">
          <div className="settings-box">
            {backdropLoading(statusResendCode.loading)}
            <Dialog
              open={dialog.email}
              onClose={() => setDialog({ email: false })}
            >
              <DialogTitle>{t("ChangeEmail")}</DialogTitle>
              <DialogContent>
                <DialogContentText>{t("IfYouChangeEmail")}</DialogContentText>
                <TextField
                  onChange={handleInputEmail}
                  autoFocus
                  required
                  margin="dense"
                  id="name"
                  name={"email"}
                  label={t("Email")}
                  type={"email"}
                  fullWidth
                  color={
                    isValidEmail(userValue.email)
                      ? statusGetUserByEmail.isError
                        ? "success"
                        : statusGetUserByEmail.isSuccess
                        ? "error"
                        : "info"
                      : "warning"
                  }
                  variant="standard"
                  value={userValue.email}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialog({ email: false })}>
                  {t("cancel")}
                </Button>
                <Button
                  disabled={
                    userValue.email == user.email ||
                    !userValue.email.trim() ||
                    statusGetUserByEmail.loading ||
                    statusGetUserByEmail.isSuccess ||
                    statusUpdateUserById.loading ||
                    statusUpdateUserById.isSuccess ||
                    !isValidEmail(userValue.email)
                  }
                  onClick={() => handleAgreeEmail()}
                  type="submit"
                >
                  {statusUpdateUserById.loading ? "Loading..." : t("Edit")}
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={dialog.password}
              onClose={() => setDialog({ password: false })}
            >
              <DialogTitle>{t("ChangePassword")}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {t("IfYouChangePassword")}
                </DialogContentText>
                <TextField
                  color={
                    user.password == passwords.oldPassword
                      ? "success"
                      : !passwords.oldPassword.trim()
                      ? "info"
                      : "error"
                  }
                  onChange={handleInputPassword}
                  autoFocus
                  required
                  margin="dense"
                  helperText={
                    user.password == passwords.oldPassword
                      ? ""
                      : !passwords.oldPassword.trim()
                      ? t("EnterOldPassword")
                      : t("OldPasswordIsIncorrect")
                  }
                  error={
                    passwords.oldPassword.trim()
                      ? user.password !== passwords.oldPassword
                      : false
                  }
                  name="oldPassword"
                  label={t("OldPassword")}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  color={
                    !passwords.newPassword.trim()
                      ? "info"
                      : passwords.newPassword.length < 8 ||
                        passwords.newPassword == user.password
                      ? "warning"
                      : passwords.newPassword.trim().length < 8 ||
                        passwords.confirmPassword.trim().length < 8
                      ? "info"
                      : passwords.newPassword == passwords.confirmPassword
                      ? "success"
                      : "error"
                  }
                  error={
                    passwords.newPassword.trim() >= 8 &&
                    passwords.confirmPassword.trim().length >= 8
                      ? passwords.newPassword !== passwords.confirmPassword
                      : false
                  }
                  helperText={
                    !passwords.newPassword.trim()
                      ? t("EnterNewPassword")
                      : passwords.newPassword.length < 8
                      ? t("PasswordShouldBe8")
                      : passwords.newPassword == user.password
                      ? t("NewPasswordCantBeAsOld")
                      : passwords.newPassword.trim().length < 8 ||
                        passwords.confirmPassword.trim().length < 8
                      ? ""
                      : passwords.newPassword == passwords.confirmPassword
                      ? ""
                      : t("PasswordsDoNotMatch")
                  }
                  onChange={handleInputPassword}
                  autoFocus
                  required
                  margin="dense"
                  id="name"
                  name="newPassword"
                  label={t("NewPassword")}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  color={
                    !passwords.confirmPassword.trim()
                      ? "info"
                      : passwords.confirmPassword.length < 8
                      ? "warning"
                      : !passwords.newPassword.trim() ||
                        !passwords.confirmPassword.trim()
                      ? "info"
                      : passwords.newPassword == passwords.confirmPassword
                      ? "success"
                      : "error"
                  }
                  error={
                    passwords.newPassword.trim() >= 8 &&
                    passwords.confirmPassword.trim().length >= 8
                      ? passwords.newPassword !== passwords.confirmPassword
                      : false
                  }
                  helperText={
                    !passwords.confirmPassword.trim()
                      ? t("EnterConfirmPassword")
                      : passwords.newPassword == passwords.confirmPassword
                      ? ""
                      : t("PasswordsDoNotMatch")
                  }
                  autoFocus
                  required
                  margin="dense"
                  id="name"
                  name="confirmPassword"
                  onChange={handleInputPassword}
                  label={t("ConfirmNewPassword")}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialog({ password: false })}>
                  {t("cancel")}
                </Button>
                <Button
                  onClick={() => handleAgreePassword()}
                  disabled={
                    user.password !== passwords.oldPassword ||
                    passwords.newPassword.length < 8 ||
                    passwords.confirmPassword.length < 8 ||
                    passwords.newPassword !== passwords.confirmPassword ||
                    passwords.newPassword == user.password ||
                    statusUpdateUserById.loading ||
                    statusUpdateUserById.isSuccess
                  }
                  type="submit"
                >
                  {statusUpdateUserById.loading ? "Loading..." : t("Edit")}
                </Button>
              </DialogActions>
            </Dialog>
            <Button
              disabled={
                statusUpdateUserById.loading ||
                statusUpdateUserById.isSuccess ||
                (userValue.firstname === user.firstname &&
                  userValue.lastname === user.lastname)
              }
              onClick={() => handleSubmit()}
              className="settings-button edit"
              sx={{
                position: "fixed",
                background: "gold",
                border: "1px solid gold",
                color: "#000",
                borderRadius: "50px",
                padding: "10px 20px",
                bottom: "25px",
                right: "25px",

                "&:hover": {
                  background: "gold",
                  border: "1px solid gold",
                  color: "#000",
                },
              }}
            >
              {statusUpdateUserById.loading ? "Loading..." : t("Edit")}
            </Button>
            {/* <Button
              className="settings-button delete"
              sx={{
                position: "fixed",
                background: "red",
                border: "1px solid red",
                color: "#fff",
                borderRadius: "50px",
                padding: "10px 20px",
                bottom: "25px",
                left: "25px",

                "&:hover": {
                  background: "red",
                  border: "1px solid red",
                  color: "#000",
                },
              }}
            >
              {t("DeleteAccount")}
            </Button> */}
          </div>
          <div className="settings-box">
            <h1 className="settings-title">{t("ProfilePicture")}</h1>
            <div className="settings-user_items">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                }}
                className="settings-user_img"
              >
                {user.firstname ? user.firstname.slice(0, 1) : ""}
              </Avatar>
            </div>
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("FirstName")}</h1>
            <TextField
              name="firstname"
              onChange={handleInput}
              value={userValue.firstname}
              className="settings-input"
              id="filled-basic"
              label={t("FirstName")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("LastName")}</h1>
            <TextField
              name="lastname"
              onChange={handleInput}
              value={userValue.lastname}
              className="settings-input"
              id="filled-basic"
              label={t("LastName")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("Email")}</h1>
            <TextField
              disabled
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleOpenDialog("email")}>
                    <EditIcon />
                  </IconButton>
                ),
              }}
              name="email"
              value={user.email}
              className="settings-input"
              id="filled-basic"
              label={t("Email")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("Password")}</h1>
            <Button
              onClick={() => handleOpenDialog("password")}
              sx={{
                background: "transparent",
                border: "1px solid gold",
                color: "#fff",

                "&:hover": {
                  background: "gold",
                  border: "1px solid gold",
                  color: "#000",
                },
              }}
              className="settings-password_btn"
            >
              {t("ChangePassword")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
