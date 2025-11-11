"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import {
  Box,
  Button,
  Link,
  Snackbar,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { GitHub, Telegram } from "@mui/icons-material";
import NotVerified from "./components/utils/NotVerified";

function App() {
  const { colorScheme } = useColorScheme();
  const [snackbar, setSnackbar] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("openSnackbar");
    return stored ? stored === "true" : true;
  });

  useEffect(() => {
    sessionStorage.setItem("openSnackbar", snackbar.toString());
  }, [snackbar]);

  
  return (
    <Box
      sx={{
        backgroundColor:
          colorScheme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
      }}
    >
      <NotVerified type="snackbar" />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar}
        onClose={() => {
          setSnackbar(false);
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Box>
            <Typography level="title-lg">
              You’re Using the Beta Version
            </Typography>
            <Typography level="body-md">
              <Typography
                sx={{
                  color: "rgb(255, 220, 92)",
                  fontWeight: "bold",
                  textShadow: "0 0 10px rgba(255, 220, 92, 0.5)",
                }}
              >
                Smile Movies V2
              </Typography>{" "}
              is still under development and not yet in its final form. A
              complete rebuild (
              <Typography
                sx={{
                  color: "rgb(255, 220, 92)",
                  fontWeight: "bold",
                  textShadow: "0 0 10px rgba(255, 220, 92, 0.5)",
                }}
              >
                V3
              </Typography>
              ) is planned with major improvements. In the meantime, you can
              continue enjoying the current{" "}
              <Typography
                sx={{
                  color: "rgb(255, 220, 92)",
                  fontWeight: "bold",
                  textShadow: "0 0 10px rgba(255, 220, 92, 0.5)",
                }}
              >
                V2 BETA
              </Typography>
              . If you encounter any issues or have suggestions, feel free to
              share them on our{" "}
              <Link
                href="https://github.com/usm0n/Smile-Movies/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                GitHub repository
              </Link>{" "}
              or via{" "}
              <Link
                href="https://t.me/usmondev"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Telegram
              </Link>
              .
            </Typography>
          </Box>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
            }}
          >
            <Button
              onClick={() => {
                setSnackbar(false);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://github.com/usm0n/Smile-Movies/issues/new",
                  "_blank"
                )
              }
              color="neutral"
              variant="soft"
              startDecorator={<GitHub />}
            >
              GitHub
            </Button>
            <Button
              onClick={() => window.open("https://t.me/usmondev", "_blank")}
              color="neutral"
              variant="soft"
              startDecorator={<Telegram />}
            >
              Telegram
            </Button>{" "}
          </Stack>
        </Box>{" "}
      </Snackbar>
      <Navbar />
      <Routes>
        {mainRoutes?.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      {/* <Navigation /> */}
    </Box>
  );
}
export default App;
