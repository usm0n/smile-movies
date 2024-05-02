import React, { useState } from "react";
import bg from "../../assets/images/login-bg.png";
import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="login">
      <div className="login-bg">
        <img src={bg} className="login-img" alt="" />
      </div>

      <div className="container">
        <div className="login-content">
          <div className="login-card">
            <h1 className="login-title">Login</h1>

            <form className="login-form">
              <input
                type="text"
                placeholder="Email address"
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
              />

              <button className="login-btn">Sign in</button>
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
