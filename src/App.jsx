import React, { useEffect } from "react";
import "./assets/styles/Main.scss";
import { Route, Routes } from "react-router-dom";
import { routes } from "./helpers/routes";
import Navbar from "./components/Navbar";
import { useUser } from "./contexts/User";
import NotRealUser from "./components/utils/NotRealUser";
import VerifyEmail from "./components/utils/VerifyEmail";
import { autoChangeLanguage } from "./utilities/defaultFunctions";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar } from "@mui/material";
import { t } from "i18next";
import { useAllMovies } from "./contexts/Movies";
import NetworkError from "./components/utils/NetworkError";

function App() {
  const { isNotConnected } = useAllMovies();
  const [open, setOpen] = React.useState(
    sessionStorage.getItem("headerAlert") || true
  );
  const wrapper = (
    <div className="wrapper">
      <div className="warning">
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open == true}
        >
          <Alert
            open={false}
            severity="warning"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  sessionStorage.setItem("headerAlert", false);
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              position: "absolute",
              top: "80px",
              width: "350px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {t("warningText")}
          </Alert>
        </Snackbar>
      </div>
      <Navbar />
      <Routes>
        {routes.map((item) => (
          <Route path={item.path} element={item.element} key={item.path} />
        ))}
      </Routes>
    </div>
  );
  const { isRealUser, isLoggedIn, isVerified } = useUser();
  useEffect(() => {
    autoChangeLanguage();
  }, []);
  return !isNotConnected ? (
    isLoggedIn ? (
      isRealUser.result || isRealUser.loading ? (
        isVerified ? (
          wrapper
        ) : (
          <VerifyEmail />
        )
      ) : (
        <NotRealUser />
      )
    ) : (
      wrapper
    )
  ) : (
    <NetworkError />
  );
}

export default App;
