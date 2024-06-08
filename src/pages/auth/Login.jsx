import React, { useEffect, useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import {
  Alert,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  buttonBaseClasses,
} from "@mui/material";
import { snackbar } from "../../utilities/defaultFunctions";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { t } from "i18next";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, statusLogin, setStatusLogin, isLoggedIn } = useUser();

  const navigate = useNavigate();

  const handleInput = (e) => {
    setStatusLogin({
      isEmpty: false,
      buttonLoading: false,
      isSuccess: false,
      isError: false,
    });
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });
  return (
    <section className="login">
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>
      <div className="container">
        {statusLogin.isEmpty && snackbar("warning", t("pleaseFillFields"))}
        {/* {statusLogin.isSuccess && snackbar("success", t("loginSuccess"))} */}
        {statusLogin.isError && snackbar("danger", t("userNotFound"))}
        <div className="login-content">
          <div className="login-card">
            <h1 className="login-title">{t("MenuLoginText")}</h1>

            <form className="login-form">
              <FormControl
                disabled={statusLogin.isSuccess || statusLogin.buttonLoading}
                color={
                  statusLogin.isError
                    ? "error"
                    : statusLogin.isEmpty
                    ? "warning"
                    : statusLogin.isSuccess
                    ? "success"
                    : "info"
                }
                sx={{
                  m: 1,
                  width: "100%",
                  background: "#fff",
                  borderRadius: "5px",
                }}
                variant="filled"
              >
                <InputLabel htmlFor="filled-adornment-password">
                  {t("ContactInputName3")}
                </InputLabel>
                <FilledInput
                  onChange={handleInput}
                  name="email"
                  className={
                    statusLogin.isError
                      ? "login-input error"
                      : statusLogin.isEmpty
                      ? "login-input warning"
                      : statusLogin.isSuccess
                      ? "login-input success disabled"
                      : statusLogin.buttonLoading
                      ? "login-input disabled"
                      : "login-input"
                  }
                  id="filled-adornment-password"
                  type={"email"}
                />
              </FormControl>
              <FormControl
                disabled={statusLogin.isSuccess || statusLogin.buttonLoading}
                color={
                  statusLogin.isError
                    ? "error"
                    : statusLogin.isEmpty
                    ? "warning"
                    : statusLogin.isSuccess
                    ? "success"
                    : "info"
                }
                sx={{
                  m: 1,
                  width: "100%",
                  background: "#fff",
                  borderRadius: "5px",
                }}
                variant="filled"
              >
                <InputLabel htmlFor="filled-adornment-password">
                  {t("password")}
                </InputLabel>
                <FilledInput
                  onChange={handleInput}
                  name="password"
                  className={
                    statusLogin.isError
                      ? "login-input error"
                      : statusLogin.isEmpty
                      ? "login-input warning"
                      : statusLogin.isSuccess
                      ? "login-input success disabled"
                      : statusLogin.buttonLoading
                      ? "login-input disabled"
                      : "login-input"
                  }
                  id="filled-adornment-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <button
                disabled={statusLogin.buttonLoading || statusLogin.isSuccess}
                onClick={(e) =>
                  loginUser(
                    e,
                    email.toLowerCase(),
                    password,
                    rememberMe == true ? "local" : "session"
                  )
                }
                className={
                  statusLogin.buttonLoading || statusLogin.isSuccess
                    ? "login-btn disabled"
                    : "login-btn"
                }
              >
                {statusLogin.buttonLoading
                  ? "Loading..."
                  : statusLogin.isSuccess
                  ? t("signingIn")
                  : t("MenuLoginText")}
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
                {t("dontHaveAnAccaunt")}{" "}
                <Link to="/register" className="login-register-link">
                  {t("signUp")}
                </Link>{" "}
              </h1>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
