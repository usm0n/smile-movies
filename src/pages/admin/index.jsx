import React from "react";
import logo from "../../assets/images/logo.png";
import { t } from "i18next";

function index() {
  return (
    <div className="admin-index">
      <img className="admin-index-img" src={logo} alt="" />
      <div className="admin-index-texts">
        <h1 className="admin-index-texts-title">{t("AdminPanelTitle")}</h1>
        <p className="admin-index-texts-desc">{t("AdminPanelSubtitle")}</p>
      </div>
    </div>
  );
}

export default index;