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
            <Typography level="title-lg">This website is in BETA</Typography>
            <Typography level="body-md">
              We are still adding features and fixing bugs. Please be patient
              for the release. If you find any bugs or new feature that you want
              to see on this website, please report them on our{" "}
              <Link
                href="https://github.com/usm0n/Smile-Movies/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                GitHub repository
              </Link>{" "}
              or on my{" "}
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
    </Box>
  );
}
export default App;