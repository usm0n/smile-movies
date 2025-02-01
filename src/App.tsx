"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import { Box, useColorScheme } from "@mui/joy";

function App() {
  const { colorScheme } = useColorScheme();

  return (
    <Box
      sx={{
        backgroundColor:
          colorScheme === "light"
            ? "rgb(255, 255, 255)"
            : "rgb(0, 0, 0)",
      }}
    >
      <Navbar />
      <Routes>
        {mainRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Box>
  );
}

export default App;
