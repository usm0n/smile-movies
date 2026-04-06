"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import AppFooter from "./components/layout/AppFooter";
import {
  Box,
  useColorScheme,
} from "@mui/joy";
import NotVerified from "./components/utils/NotVerified";
import { TastePromptProvider } from "./context/TastePrompt";
import { useLocation } from "react-router-dom";

function App() {
  const { colorScheme } = useColorScheme();
  const location = useLocation();
  const hideFooter = /\/watch(\/|$)/.test(location.pathname);


  return (
    <TastePromptProvider>
      <Box
        className="app-shell"
        sx={{
          backgroundColor:
            colorScheme === "light" ? "rgb(255, 255, 255)" : "transparent",
        }}
      >
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
    </TastePromptProvider>
  );
}
export default App;
