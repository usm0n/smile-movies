import React, { useRef, useState } from "react";
import logo from "../assets/images/logo.png";
import { useUser } from "../contexts/User";
import { snackbar } from "../utilities/defaultFunctions";
import { Link } from "react-router-dom";

function VerifyEmail() {
  const {
    verifyUser,
    statusVerifyUser,
    setStatusVerifyUser,
    logoutUser,
    statusLogout,
    user,
    statusResendCode,
    resendToken,
  } = useUser();
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState();
  const inputsRef = useRef([]);

  const handleOTPChange = (index, value) => {
    setStatusVerifyUser({
      loading: false,
      isError: false,
      isSuccess: false,
      isIncorrect: false,
    });
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    // Move to the next input
    if (value !== "" && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      const newOTP = [...otp];
      newOTP[index - 1] = "";
      setOTP(newOTP);
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 6) {
      setError("Fill all inputs");
    } else {
      verifyUser(enteredOTP);
    }
  };

  return (
    <section className="email">
      {statusResendCode.isSuccess && snackbar("success", "Code resent")}
      {statusResendCode.isError && snackbar("error", "Error has occurred")}
      <div className="container">
        <div className="email-card">
          <div className="email-content">
            <img src={logo} width={300} alt="Apple ID" />
            <h1 className="email-title">Verify Your Email Address</h1>
            <h3 className="email-desc">
              Please enter code that we have sent to your email{" "}
              <span className="email-desc-email">{user.email}</span>
            </h3>
            <form className="email-form">
              <div className="email-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(ref) => (inputsRef.current[index] = ref)}
                    type="text"
                    className={
                      statusVerifyUser.loading
                        ? "email-input disabled"
                        : statusVerifyUser.isSuccess
                        ? "email-input success disabled"
                        : statusVerifyUser.isIncorrect ||
                          statusVerifyUser.isError ||
                          error
                        ? "email-input error"
                        : "email-input"
                    }
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOTPChange(index, e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <h1 className={"email-error-status"}>
                {error
                  ? "Fill all fields"
                  : statusVerifyUser.isIncorrect
                  ? "Incorrect verification code"
                  : statusVerifyUser.isError
                  ? "Something went wrong. Please try again"
                  : ""}
              </h1>
              <div className="email-links">
                <button
                  onClick={(e) => handleSubmit(e)}
                  disabled={
                    statusVerifyUser.loading || statusVerifyUser.isSuccess
                  }
                  type="submit"
                  className={
                    statusVerifyUser.loading || statusVerifyUser.isSuccess
                      ? "email-link disabled"
                      : "email-link"
                  }
                >
                  {statusVerifyUser.loading ? "Loading..." : "Continue"}
                </button>
                <button
                  onClick={() => resendToken()}
                  disabled={
                    statusResendCode.loading || statusResendCode.isSuccess
                  }
                  className={
                    statusResendCode.loading || statusResendCode.isSuccess
                      ? "email-resend disabled"
                      : "email-resend"
                  }
                >
                  {statusResendCode.loading ? "Resending..." : "Resend"}
                </button>
                <Link
                  onClick={logoutUser}
                  className={
                    statusLogout.loading
                      ? "email-logout disabled"
                      : "email-logout"
                  }
                >
                  {statusLogout.loading ? "Logging out..." : "Logout"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmail;
