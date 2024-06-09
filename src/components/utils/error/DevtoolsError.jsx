import React, { useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { t } from "i18next";
import { debug } from "../../../utilities/debugger";

function DevtoolsError() {
  useEffect(() => {
    console.clear();
    debug()
  }, []);
  return (
    <div className="network">
      <img src={logo} className="network-logo" alt="" />
      <DoNotDisturbAltIcon
        sx={{
          width: "150px",
          height: "150px",
        }}
        className="network-icon"
      />
      <div className="network-content">
        <h1 className="network-content-title">{t("DevtoolsError")}</h1>
        <p className="network-content-desc">{t("DevtoolsErrorDesc")}</p>
        {/* <button
          onClick={() => window.location.reload()}
          className="network-content-btn"
        >
          <ReplayIcon /> {t("Reload")}
        </button> */}
      </div>
    </div>
  );
}

export default DevtoolsError;
