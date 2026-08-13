"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import AppFooter from "./components/layout/AppFooter";
import CommandMenu from "./components/ui/CommandMenu";
import { Box, useColorScheme } from "@mui/joy";
import NotVerified from "./components/utils/NotVerified";
import { useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import RouteFallback from "./components/utils/RouteFallback";

function App() {
  const { setMode } = useColorScheme();
  const location = useLocation();
  const isWatchPage = /\/watch(\/|$)/.test(location.pathname);

  useEffect(() => {
    setMode("dark");
  }, [setMode]);

  return (
    <Box className="app-shell">
      <NotVerified type="snackbar" />
      <Navbar />
      <CommandMenu />
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {mainRoutes?.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </Box>
      {!isWatchPage && <AppFooter />}
    </Box>
  );
}
export default App;
