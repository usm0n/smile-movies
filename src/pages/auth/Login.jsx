import React, { useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/User";
import { Alert, Snackbar, buttonBaseClasses } from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, statusLogin, setStatusLogin, isLoggedIn } = useUser();

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
  return (
    <section className="login">
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>
      <div className="container">
        {statusLogin.isEmpty && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={open}
            autoHideDuration={6000}
          >
            <Alert
              severity={"warning"}
              variant="filled"
              sx={{ marginTop: "60px" }}
            >
              Please fill inputs
            </Alert>
          </Snackbar>
        )}
        {statusLogin.isSuccess && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={open}
            autoHideDuration={6000}
          >
            <Alert
              severity={"success"}
              variant="filled"
              sx={{ marginTop: "60px" }}
            >
              Login success
            </Alert>
          </Snackbar>
        )}
        {statusLogin.isError && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={open}
            autoHideDuration={6000}
          >
            <Alert
              severity={"error"}
              variant="filled"
              sx={{ marginTop: "60px" }}
            >
              Error at Login (User not found)
            </Alert>
          </Snackbar>
        )}
        <div className="login-content">
          <div className="login-card">
            <h1 className="login-title">Login</h1>

            <form className="login-form">
              <input
                onChange={(e) => handleInput(e)}
                type="text"
                name="email"
                placeholder="Email address"
                disabled={setStatusLogin.isSuccess || statusLogin.buttonLoading}
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
              />
              <input
                onChange={(e) => handleInput(e)}
                type="password"
                name="password"
                placeholder="Password"
                disabled={setStatusLogin.isSuccess || statusLogin.buttonLoading}
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
              />

              <button
                disabled={statusLogin.buttonLoading}
                onClick={(e) => loginUser(e, email, password)}
                className={
                  statusLogin.buttonLoading ? "login-btn disabled" : "login-btn"
                }
              >
                {statusLogin.buttonLoading ? "Loading..." : "Sign in"}
              </button>
              <div className="login-remember">
                <input
                  defaultChecked
                  type="checkbox"
                  className="login-checkbox"
                />
                <label className="login-label">Remember me</label>
              </div>
              <h1>
                Don't have an accaunt?{" "}
                <Link to="/register" className="login-register-link">
                  Sign up
                </Link>{" "}
                now
              </h1>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
