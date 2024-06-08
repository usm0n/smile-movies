import React, { useEffect, useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import { isValidEmail, snackbar } from "../../utilities/defaultFunctions";
import {
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { t } from "i18next";

function Register() {
  const { registerUser, statusRegister, setStatusRegister } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [registerValue, setRegisterValue] = useState({
    firstname: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();

  const handleInput = (e) => {
    setStatusRegister({
      isEmpty: false,
      confirmPassword: false,
      buttonLoading: false,
      isSuccess: false,
      isError: false,
    });
    setRegisterValue({
      ...registerValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(
      e,
      registerValue.firstname,
      registerValue.email.toLowerCase(),
      registerValue.password,
      registerValue.cpassword,
      rememberMe == true ? "local" : "session"
    );
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });

  return (
    <section className="register">
      {statusRegister.isSuccess && snackbar("success", t("registerSuccess"))}
      {statusRegister.isError && snackbar("danger", t("somethingWentWrong"))}
      {statusRegister.isEmpty && snackbar("warning", t("pleaseFillFields"))}
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>

      <div className="container">
        <div className="login-content">
          <div className="register-card">
            <h1 className="login-title">{t("signUp")}</h1>
            <form className="login-form">
              <TextField
                onChange={handleInput}
                name="firstname"
                className={
                  statusRegister.buttonLoading
                    ? "login-input disabled"
                    : "login-input"
                }
                label={t("ContactInputName1")}
                sx={{
                  background: "#fff",
                }}
                variant="filled"
                fullWidth
                disabled={statusRegister.buttonLoading}
                error={statusRegister.isError}
                color={
                  statusRegister.isEmpty
                    ? "warning"
                    : statusRegister.isSuccess
                    ? "success"
                    : "info"
                }
              />
              <TextField
                onChange={handleInput}
                name="email"
                helperText={statusRegister.isConflict && t("alreadyRegistered")}
                className={
                  statusRegister.buttonLoading
                    ? "login-input disabled"
                    : "login-input"
                }
                id="filled-adornment-password"
                type={"email"}
                label={t("ContactInputName3")}
                disabled={statusRegister.buttonLoading}
                color={
                  statusRegister.isError
                    ? "error"
                    : registerValue.email.trim() &&
                      !isValidEmail(registerValue.email)
                    ? "warning"
                    : statusRegister.isSuccess
                    ? "success"
                    : statusRegister.isConflict
                    ? "error"
                    : "info"
                }
                error={statusRegister.isError || statusRegister.isConflict}
                sx={{
                  background: "#fff",
                }}
                variant="filled"
              />
              <TextField
                onChange={handleInput}
                name="password"
                className={
                  statusRegister.buttonLoading
                    ? "login-input disabled"
                    : "login-input"
                }
                type={showPassword ? "text" : "password"}
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
                helperText={
                  statusRegister.confirmPassword
                    ? t("passwordsDontMatch")
                    : registerValue.password.length < 8
                    ? t("PasswordShouldBe8")
                    : ""
                }
                label={t("password")}
                disabled={statusRegister.buttonLoading}
                color={
                  statusRegister.isError
                    ? "error"
                    : statusRegister.isEmpty
                    ? "warning"
                    : statusRegister.isSuccess
                    ? "success"
                    : statusRegister.confirmPassword
                    ? "error"
                    : "info"
                }
                error={statusRegister.isError || statusRegister.confirmPassword}
                sx={{
                  background: "#fff",
                }}
                variant="filled"
              />
              <TextField
                helperText={
                  statusRegister.confirmPassword && t("passwordsDontMatch")
                }
                onChange={handleInput}
                name="cpassword"
                className={
                  statusRegister.buttonLoading
                    ? "login-input disabled"
                    : "login-input"
                }
                type={showPassword ? "text" : "password"}
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
                label={t("cpassword")}
                disabled={statusRegister.buttonLoading}
                color={
                  statusRegister.isError
                    ? "error"
                    : statusRegister.isEmpty
                    ? "warning"
                    : statusRegister.isSuccess
                    ? "success"
                    : statusRegister.confirmPassword
                    ? "error"
                    : "info"
                }
                error={statusRegister.isError || statusRegister.confirmPassword}
                sx={{
                  background: "#fff",
                }}
                variant="filled"
              />
              <button
                disabled={
                  statusRegister.isSuccess ||
                  statusRegister.buttonLoading ||
                  !registerValue.firstname.trim() ||
                  !registerValue.email.trim() ||
                  !registerValue.password.trim() ||
                  !registerValue.cpassword.trim() ||
                  !isValidEmail(registerValue.email)
                }
                onClick={(e) => handleSubmit(e)}
                className={
                  statusRegister.buttonLoading ||
                  statusRegister.isSuccess ||
                  !registerValue.firstname.trim() ||
                  !registerValue.email.trim() ||
                  !registerValue.password.trim() ||
                  !registerValue.cpassword.trim() ||
                  !isValidEmail(registerValue.email)
                    ? "login-btn disabled"
                    : "login-btn"
                }
              >
                {statusRegister.buttonLoading ? "Loading..." : t("signUp")}
              </button>
              <div className="login-remember">
                <input
                  onChange={() => setRememberMe(!rememberMe)}
                  defaultChecked={rememberMe == true}
                  type="checkbox"
                  className="login-checkbox"
                />
                <label className="login-label">{t("rememberMe")}</label>
              </div>
              <h1>
                {t("alreadyHaveAnAcc")}{" "}
                <Link to="/login" className="login-register-link">
                  {t("MenuLoginText")}
                </Link>
              </h1>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
