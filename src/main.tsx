import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import App from "./App.tsx";
import { TMDBProvider } from "./context/TMDB.tsx";
import UsersProvider from "./context/Users.tsx";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import OCProvider from "./context/OC.tsx";
import { StreamProvider } from "./context/Stream.tsx";
import { registerServiceWorker } from "./pwa/registerServiceWorker.ts";
import theme from "./theme";
import { Toaster } from "./components/ui/toast.tsx";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <CssVarsProvider theme={theme} defaultMode="dark" modeStorageKey="smile-mode">
    <CssBaseline />
    <BrowserRouter>
      <StreamProvider>
        <OCProvider>
          <UsersProvider>
            <TMDBProvider>
              <StrictMode>
                <Toaster />
                <App />
              </StrictMode>
            </TMDBProvider>
          </UsersProvider>
        </OCProvider>
      </StreamProvider>
    </BrowserRouter>
  </CssVarsProvider>,
);
