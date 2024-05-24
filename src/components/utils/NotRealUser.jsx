import React from "react";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/User";
import BuildIcon from "@mui/icons-material/Build";
import logo from "../../assets/images/logo.png";
import { t } from "i18next";

function NotRealUser() {
  const { logoutUser } = useUser();
  return (
    <div className="notrealuser">
      <img className="notrealuser-img" src={logo} alt="" />
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
  );
}

export default NotRealUser;
