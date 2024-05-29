import React from "react";
import User from "../../assets/images/user.png"
import { t } from "i18next";

function Settings() {
  return (
    <div className="settings">
      <div className="container">
        <div className="settings-content">
          <div className="settings-user">
            <h1 className="settings-user_title">{t("ProfilePicture")}</h1>

            <div className="settings-user_items">
              <div>
                <img src={User} className="settings-user_img" alt="" />
              </div>
              <div className="settings-change_button">
                <button className="settings-user_button">{t("ChangePicture")}</button>
                <p className="settings-user_text">{t("AccauntText")}</p>
              </div>
            </div>
          </div>

          <form className="settings-name_form">
            <div className="settings-name_box">
              <h1 className="settings-name_title">{t("FirsName")}</h1>
              <input type="text" className="settings-name_input" placeholder="Usmon" />
            </div>
          </form>

          <div className="settings-email">
            <h1 className="settings-email_title">{t("Email")}</h1>
            <h2 className="settings-email_name">mustafo@icloud.com</h2>
          </div>

          <div className="settings-password">
            <h1 className="settings-password_title">{t("Password")}</h1>
            <button className="settings-password_btn">{t("ChangePassword")}</button>
          </div>

          <form className="settings-time_form">
            <div className="settings-time_box">
              <h1 className="settings-time_title">{t("TimeZone")}</h1>
                <input type="text" className="settings-name_input" placeholder="America - Los Angeles" />
            </div>
          </form>

          <form className="settings-mode_form">
            <h1 className="settings-mode_title">{t("DevelopmentMode")}</h1>
            <input type="text" className="settings-name_input" placeholder="Alissa ST (models-user-60)" />
          </form>

          <form className="settings-mode_form">
            <h1 className="settings-mode_title">{t("TextEditorMode")}</h1>
            <input type="text" className="settings-name_input" placeholder="Default" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
