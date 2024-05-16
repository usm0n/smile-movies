import React, {  useRef, useState } from "react";
import logo from "../assets/images/logo.png";

function VerifyEmail() {
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState();
  const inputsRef = useRef([]);

  const handleOTPChange = (index, value) => {
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

  return (
    <section className="email">
      <div className="container">
        <div className="email-card">
          <div className="email-content">
            <img src={logo} width={300} alt="Apple ID" />
            <h1 className="email-title">Verify Your Email Address</h1>
            <h3 className="email-desc">
              Please enter code that we have sent to your email{" "}
              <span className="email-desc-email">example@email.com</span>
            </h3>
            <form className="email-form">
              <div className="email-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(ref) => (inputsRef.current[index] = ref)}
                    type="text"
                    className={"email-input"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOTPChange(index, e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <h1 className={"email-error-status"}>{error}</h1>
              <div className="email-links">
                <button type="submit" className="email-link">
                  Continue
                </button>
                <button className="email-resend">Resend</button>
                <button className="email-logout">Log Out</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmail;
