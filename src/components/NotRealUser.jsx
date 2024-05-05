import React from "react";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/User";
import BuildIcon from "@mui/icons-material/Build";
import logo from "../assets/images/logo.png";

function NotRealUser() {
  const { logoutUser } = useUser();
  return (
    <div className="notrealuser">
      <img className="notrealuser-img" src={logo} alt="" />
      <h1 className="notrealuser-title">You are not a <span className="notrealuser-title-span">Real User</span></h1>
      <p className="notrealuser-desc">
        You are not a real user, so you can't watch movies and series until log
        out or log in again
      </p>
      <div className="notrealuser-btns">
        <Link
          className="notrealuser-btn"
          onClick={() => logoutUser()}
          to="/login"
        >
          <LoginIcon />
          Log in Again
        </Link>
        <Link className="notrealuser-btn" onClick={() => logoutUser()}>
          <BuildIcon />
          Fix
        </Link>
      </div>
    </div>
  );
}

export default NotRealUser;
