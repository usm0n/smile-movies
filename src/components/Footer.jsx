import React from "react";
import logo from "../assets/images/logo.png";
import { Link } from "react-router-dom";
import Instagram from "../assets/icons/InstagramIcon";
import Telegram from "../assets/icons/Telegram";
import Youtube from "../assets/icons/YouTube";

function Footer() {
  return (
    <section className="footer">
      <div className="container">
        <div className="footer-content">
          <img src={logo} className="footer-image" alt="Smile movies logo" />

          <div className="footer-links">
            <Link to="/" className="footer-link">
              Home
            </Link>
            <Link to="/about" className="footer-link">
              About
            </Link>
            <Link to="/contact" className="footer-link">
              Contact
            </Link>
            <Link to="/premium" className="footer-link">
              Premium
            </Link>
          </div>

          <div className="footer-social">
            <a href="#" className="footer-social_link">
              <Instagram />
            </a>
            <a href="#" className="footer-social_link">
              <Telegram />
            </a>
            <a href="#" className="footer-social_link">
              <Youtube />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
