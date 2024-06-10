import React from "react";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";
import { useUser } from "../../../contexts/User";
import BuildIcon from "@mui/icons-material/Build";
import logo from "../../../assets/images/logo.png";
import { t } from "i18next";
import PersonOffIcon from "@mui/icons-material/PersonOff";

function NotRealUser() {
  const { logoutUser } = useUser();
  return (
    <div className="notrealuser">
      <img className="network-logo" src={logo} alt="" />
      <PersonOffIcon
        sx={{ width: "150px", height: "150px" }}
        className="network-icon"
      />
      <div className="network-content">
        <h1 className="notrealuser-title">{t("YourNotRealUser")}</h1>
        <p className="notrealuser-desc">{t("YourNotRealUserDesc")}</p>
        <div className="notrealuser-btns">
          <Link
            className="notrealuser-btn"
            onClick={() => logoutUser()}
            to="/login"
          >
            <LoginIcon />
            {t("MenuLoginText")}
          </Link>
          <Link className="notrealuser-btn" onClick={() => logoutUser()}>
            <BuildIcon />
            {t("fix")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotRealUser;
