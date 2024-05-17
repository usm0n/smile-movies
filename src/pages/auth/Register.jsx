import React, { useEffect, useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import { snackbar } from "../../utilities/defaultFunctions";

function Register() {
  const { registerUser, statusRegister, setStatusRegister } = useUser();
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
      registerValue.email,
      registerValue.password,
      registerValue.cpassword
    );
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });

  return (
    <section className="register">
      {statusRegister.isSuccess &&
        snackbar("success", "You have registered successfully")}
      {statusRegister.isError && snackbar("error", "Something went wrong")}
      {statusRegister.isEmpty &&
        snackbar("warning", "All fields are required, please fill all fields")}
      {statusRegister.isConflict &&
        snackbar(
          "warning",
          "This email is already registered, please use another email"
        )}
      {statusRegister.confirmPassword &&
        snackbar(
          "warning",
          "Passwords do not match, please check your password"
        )}
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>

      <div className="container">
        <div className="login-content">
          <div className="register-card">
            <h1 className="login-title">Register</h1>
            <form className="login-form">
              <input
                disabled={
                  statusRegister.buttonLoading || statusRegister.isSuccess
                }
                onChange={(e) => handleInput(e)}
                type="text"
                name="firstname"
                placeholder="Your First Name"
                className={
                  statusRegister.isSuccess
                    ? "login-input success disabled"
                    : statusRegister.isError
                    ? "login-input error"
                    : statusRegister.isEmpty
                    ? "login-input warning"
                    : statusRegister.buttonLoading
                    ? "login-input disabled"
                    : "login-input"
                }
              />
              <input
                disabled={
                  statusRegister.buttonLoading || statusRegister.isSuccess
                }
                onChange={(e) => handleInput(e)}
                type="email"
                name="email"
                placeholder="Your Email Adress"
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
              />
              <input
                minLength={8}
                onChange={(e) => handleInput(e)}
                disabled={
                  statusRegister.buttonLoading || statusRegister.isSuccess
                }
                name="password"
                type="password"
                placeholder="Password"
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
              />
              <input
                minLength={8}
                disabled={
                  statusRegister.buttonLoading || statusRegister.isSuccess
                }
                onChange={(e) => handleInput(e)}
                name="cpassword"
                type="password"
                placeholder="Confirm Password"
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
              />

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
                Register
              </button>
              <h1>
                Already have an accaunt?{" "}
                <Link to="/login" className="login-register-link">
                  Sign in
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
