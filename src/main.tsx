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
import { LocaleProvider } from "./context/Locale.tsx";
import NotificationsProvider from "./context/Notifications.tsx";
import { registerServiceWorker } from "./pwa/registerServiceWorker.ts";
import { refreshPushTokenIfEnabled } from "./pwa/push.ts";
import theme from "./theme";
import { Toaster } from "./components/ui/toast.tsx";

registerServiceWorker();
// FCM rotates device tokens on its own schedule, so a browser that was
// receiving push last month can go quiet with nothing to show for it. This
// re-registers whatever token is current. It never prompts — it returns
// immediately unless permission was already granted.
void refreshPushTokenIfEnabled();

createRoot(document.getElementById("root")!).render(
  <CssVarsProvider theme={theme} defaultMode="dark" modeStorageKey="smile-mode">
    <CssBaseline />
    <BrowserRouter>
      <LocaleProvider>
        <StreamProvider>
          <OCProvider>
            <UsersProvider>
              <TMDBProvider>
                <NotificationsProvider>
                  <StrictMode>
                    <Toaster />
                    <App />
                  </StrictMode>
                </NotificationsProvider>
              </TMDBProvider>
            </UsersProvider>
          </OCProvider>
        </StreamProvider>
      </LocaleProvider>
    </BrowserRouter>
  </CssVarsProvider>,
);
