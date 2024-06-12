import React, { useEffect, useState } from "react";
import "./assets/styles/Main.scss";
import { Route, Routes } from "react-router-dom";
import { routes } from "./helpers/routes";
import Navbar from "./components/Navbar";
import { useUser } from "./contexts/User";
import NotRealUser from "./components/utils/error/NotRealUser";
import VerifyEmail from "./components/utils/VerifyEmail";
import { autoChangeLanguage } from "./utilities/defaultFunctions";
import { useAllMovies } from "./contexts/Movies";
import NetworkError from "./components/utils/error/NetworkError";
import devtoolsDetect from "devtools-detect";
import DevtoolsError from "./components/utils/error/DevtoolsError";

function App() {
  const { isNotConnected } = useAllMovies();
  const { isRealUser, isLoggedIn, isVerified, isAdmin } = useUser();
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(devtoolsDetect.isOpen);
  const wrapper = (
    <div className="wrapper">
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
