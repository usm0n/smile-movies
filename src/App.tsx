"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import {
  Box,
  useColorScheme,
} from "@mui/joy";
import NotVerified from "./components/utils/NotVerified";
import { TastePromptProvider } from "./context/TastePrompt";

function App() {
  const { colorScheme } = useColorScheme();


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
        {/* <Navigation /> */}
      </Box>
    </TastePromptProvider>
  );
}
export default App;
