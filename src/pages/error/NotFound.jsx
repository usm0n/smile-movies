import React from "react";
import logo from "../../assets/images/logo.png";

function NotFound() {
  return (
    <div className="notfound">
      <img className="notfound-logo" src={logo} alt="" />
      <div className="notfound-content">
        <h1 className="notfound-404">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-desc">
          The page you are looking for might have been removed had its name
          changed or is temporarily unavailable.
        </p>
      </div>
    </div>
  );
}

export default NotFound;
