import React, { useEffect } from "react";
import "./assets/styles/Main.scss";
import { Route, Routes } from "react-router-dom";
import { routes } from "./helpers/routes";
import Navbar from "./components/Navbar";
import { useUser } from "./contexts/User";
import NotRealUser from "./components/NotRealUser";
import VerifyEmail from "./components/VerifyEmail";

function App() {
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
  const { isRealUser, isLoggedIn, isVerified } = useUser();
  return isLoggedIn ? (
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
  );
}

export default App;
