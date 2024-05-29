import React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import logo from "../../../assets/images/logo.png";
import ReplayIcon from "@mui/icons-material/Replay";
import { t } from "i18next";

function NetworkError() {
  return (
    <div className="network">
      <img src={logo} className="network-logo" alt="" />
      <WifiOffIcon
        sx={{
          width: "150px",
          height: "150px",
        }}
        className="network-icon"
      />
      <div className="network-content">
        <h1 className="network-content-title">{t("NetworkError")}</h1>
        <p className="network-content-desc">{t("NetworkErrorDesc")}</p>
        <button
          onClick={() => window.location.reload()}
          className="network-content-btn"
        >
          <ReplayIcon /> {t("Reload")}
        </button>
      </div>
    </div>
  );
}

export default NetworkError;
