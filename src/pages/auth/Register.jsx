import React from "react";
import bg from "../../assets/images/login-bg.png";
import { Link } from "react-router-dom";

function Register() {
  return (
    <section className="register">
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>

      <div className="container">
        <div className="login-content">
          <div className="register-card">
            <h1 className="login-title">Register</h1>

            <form className="login-form">
              <input
                type="text"
                placeholder="Your First Name"
                className="login-input"
              />
              <input
                type="password"
                placeholder="Your Email Adress"
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="login-input"
              />

              <Link to="/register" className="login-btn">
                Register
              </Link>
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
