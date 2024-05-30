import React, { useState } from "react";
import { Avatar, Button, TextField } from "@mui/material";
import { t } from "i18next";

function Settings({ user, updateUserById, statusUpdateUserById }) {
  const [userValue, setUserValue] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  });

  const handleInput = (event) => {
    setUserValue({
      ...userValue,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = () => {
    updateUserById(user._id, userValue);
  };
  return (
    <div className="settings">
      <div className="container">
        <div className="settings-content">
          <div className="settings-box">
            <Button
              disabled={
                statusUpdateUserById.loading ||
                statusUpdateUserById.isSuccess ||
                (userValue.firstname === user.firstname &&
                  userValue.lastname === user.lastname)
              }
              onClick={() => handleSubmit()}
              className="settings-button edit"
              sx={{
                position: "fixed",
                background: "gold",
                border: "1px solid gold",
                color: "#000",
                borderRadius: "50px",
                padding: "10px 20px",
                bottom: "25px",
                right: "25px",

                "&:hover": {
                  background: "gold",
                  border: "1px solid gold",
                  color: "#000",
                },
              }}
            >
              {statusUpdateUserById.loading ? "Loading..." : t("Edit")}
            </Button>
            {/* <Button
              className="settings-button delete"
              sx={{
                position: "fixed",
                background: "red",
                border: "1px solid red",
                color: "#fff",
                borderRadius: "50px",
                padding: "10px 20px",
                bottom: "25px",
                left: "25px",

                "&:hover": {
                  background: "red",
                  border: "1px solid red",
                  color: "#000",
                },
              }}
            >
              {t("DeleteAccount")}
            </Button> */}
          </div>
          <div className="settings-box">
            <h1 className="settings-title">{t("ProfilePicture")}</h1>
            <div className="settings-user_items">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                }}
                className="settings-user_img"
              >
                {user.firstname ? user.firstname.slice(0, 1) : ""}
              </Avatar>
            </div>
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("FirstName")}</h1>
            <TextField
              name="firstname"
              onChange={handleInput}
              value={userValue.firstname}
              className="settings-input"
              id="filled-basic"
              label={t("FirstName")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("LastName")}</h1>
            <TextField
              name="lastname"
              onChange={handleInput}
              value={userValue.lastname}
              className="settings-input"
              id="filled-basic"
              label={t("LastName")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("Email")}</h1>
            <TextField
              disabled
              name="email"
              onChange={handleInput}
              value={userValue.email}
              className="settings-input"
              id="filled-basic"
              label={t("Email")}
              variant="filled"
            />
          </div>

          <div className="settings-box">
            <h1 className="settings-title">{t("Password")}</h1>
            <Button
              sx={{
                background: "transparent",
                border: "1px solid gold",
                color: "#fff",

                "&:hover": {
                  background: "gold",
                  border: "1px solid gold",
                  color: "#000",
                },
              }}
              className="settings-password_btn"
            >
              {t("ChangePassword")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
