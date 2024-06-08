import React, { useEffect, useState } from "react";
import "./assets/styles/Main.scss";
import { Route, Routes } from "react-router-dom";
import { routes } from "./helpers/routes";
import Navbar from "./components/Navbar";
import { useUser } from "./contexts/User";
import NotRealUser from "./components/utils/error/NotRealUser";
import VerifyEmail from "./components/utils/VerifyEmail";
import { autoChangeLanguage, language } from "./utilities/defaultFunctions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar } from "@mui/material";
import { useAllMovies } from "./contexts/Movies";
import NetworkError from "./components/utils/error/NetworkError";
import { Alert } from "@mui/joy";
import Countdown from "react-countdown";
import devtoolsDetect from "devtools-detect";
import DevtoolsError from "./components/utils/error/DevtoolsError";

function App() {
  const { isNotConnected, allMovies } = useAllMovies();
  const { isRealUser, isLoggedIn, isVerified, isAdmin } = useUser();
  const [ServerAlert, setServerAlert] = useState(true);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(devtoolsDetect.isOpen);
  const wrapper = (
    <div className="wrapper">
      {allMovies.isLoading && (
        <Countdown date={Date.now() + 3000}>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={ServerAlert == true}
            onClose={() => setServerAlert(false)}
          >
            <Alert
              endDecorator={
                <IconButton onClick={() => setServerAlert(false)}>
                  <CloseIcon />
                </IconButton>
              }
              open={true}
              color="warning"
              variant="outlined"
              sx={{
                position: "absolute",
                top: "70px",
                width: "350px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div>
                {language == "uz" ? (
                  <>
                    Saytimiz <Countdown date={Date.now() + 40000} /> ichida
                    ishga tushadi
                  </>
                ) : language == "en" ? (
                  <>
                    Our site will be launched within{" "}
                    <Countdown date={Date.now() + 40000} />
                  </>
                ) : (
                  language == "ru" && (
                    <>
                      Наш сайт будет запущен в течение{" "}
                      <Countdown date={Date.now() + 40000} />
                    </>
                  )
                )}
              </div>
            </Alert>
          </Snackbar>
        </Countdown>
      )}
      <Navbar />
      <Routes>
        {routes.map((item) => (
          <Route path={item.path} element={item.element} key={item.path} />
        ))}
      </Routes>
    </div>
  );

  useEffect(() => {
    autoChangeLanguage();
    const handleChange = (event) => {
      setIsDevToolsOpen(event.detail.isOpen);
    };
    window.addEventListener("devtoolschange", handleChange);
    return () => {
      window.removeEventListener("devtoolschange", handleChange);
    };
  }, []);
  return !isNotConnected ? (
    !isAdmin.result && isDevToolsOpen ? (
      <DevtoolsError />
    ) : isLoggedIn ? (
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
