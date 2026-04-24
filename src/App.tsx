"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import AppFooter from "./components/layout/AppFooter";
import { Box, useColorScheme } from "@mui/joy";
import NotVerified from "./components/utils/NotVerified";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function App() {
  const { setMode } = useColorScheme();
  const location = useLocation();
  const hideFooter = /\/watch(\/|$)/.test(location.pathname);

  useEffect(() => {
    setMode("dark");
  }, [setMode]);

  return (
    <Box className="app-shell">
      <NotVerified type="snackbar" />
      <Navbar />
      <Routes>
        {mainRoutes?.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      {!hideFooter && <AppFooter />}
      {/* <Navigation /> */}
    </Box>
  );
}
export default App;
