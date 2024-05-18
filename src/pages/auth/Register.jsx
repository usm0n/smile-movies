import React, { useEffect, useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import { snackbar } from "../../utilities/defaultFunctions";
import {
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
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
      {statusRegister.isError && snackbar("error", t("somethingWentWrong"))}
      {statusRegister.isEmpty && snackbar("warning", t("pleaseFillFields"))}
      {statusRegister.isConflict && snackbar("warning", t("alreadyRegistered"))}
      {statusRegister.confirmPassword &&
        snackbar("warning", t("passwordsDontMatch"))}
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>

      <div className="container">
        <div className="login-content">
          <div className="register-card">
            <h1 className="login-title">{t("signUp")}</h1>
            <form className="login-form">
              <FormControl
                disabled={
                  statusRegister.isSuccess || statusRegister.buttonLoading
                }
                color={
                  statusRegister.isError
                    ? "error"
                    : statusRegister.isEmpty
                    ? "warning"
                    : statusRegister.isSuccess
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
                  {t("ContactInputName1")}
                </InputLabel>
                <FilledInput
                  onChange={handleInput}
                  name="firstname"
                  className={
                    statusRegister.isError
                      ? "login-input error"
                      : statusRegister.isEmpty
                      ? "login-input warning"
                      : statusRegister.isSuccess
                      ? "login-input success disabled"
                      : statusRegister.buttonLoading
                      ? "login-input disabled"
                      : "login-input"
                  }
                  id="filled-adornment-password"
                  type={"text"}
                />
              </FormControl>
              <FormControl
                disabled={
                  statusRegister.isSuccess || statusRegister.buttonLoading
                }
                color={
                  statusRegister.isError
                    ? "error"
                    : statusRegister.isEmpty
                    ? "warning"
                    : statusRegister.isSuccess
                    ? "success"
                    : statusRegister.isConflict
                    ? "error"
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
                    statusRegister.isSuccess
                      ? "login-input success disabled"
                      : statusRegister.isError
                      ? "login-input error"
                      : statusRegister.isEmpty
                      ? "login-input warning"
                      : statusRegister.buttonLoading
                      ? "login-input disabled"
                      : statusRegister.isConflict
                      ? "login-input error"
                      : "login-input"
                  }
                  id="filled-adornment-password"
                  type={"email"}
                />
              </FormControl>
              <FormControl
                disabled={
                  statusRegister.isSuccess || statusRegister.buttonLoading
                }
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
                    statusRegister.isSuccess
                      ? "login-input success disabled"
                      : statusRegister.isError
                      ? "login-input error"
                      : statusRegister.isEmpty
                      ? "login-input warning"
                      : statusRegister.buttonLoading
                      ? "login-input disabled"
                      : statusRegister.confirmPassword
                      ? "login-input error"
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
              <FormControl
                disabled={
                  statusRegister.isSuccess || statusRegister.buttonLoading
                }
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
                sx={{
                  m: 1,
                  width: "100%",
                  background: "#fff",
                  borderRadius: "5px",
                }}
                variant="filled"
              >
                <InputLabel htmlFor="filled-adornment-password">
                  {t("cpassword")}
                </InputLabel>
                <FilledInput
                  onChange={handleInput}
                  name="cpassword"
                  className={
                    statusRegister.isSuccess
                      ? "login-input success disabled"
                      : statusRegister.isError
                      ? "login-input error"
                      : statusRegister.isEmpty
                      ? "login-input warning"
                      : statusRegister.buttonLoading
                      ? "login-input disabled"
                      : statusRegister.confirmPassword
                      ? "login-input error"
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
                disabled={
                  statusRegister.isSuccess || statusRegister.buttonLoading
                }
                onClick={(e) => handleSubmit(e)}
                className={
                  statusRegister.buttonLoading || statusRegister.isSuccess
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
