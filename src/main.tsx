import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TMDBProvider } from "./context/TMDB.tsx";
import UsersProvider from "./context/Users.tsx";
import { BrowserRouter } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <CssVarsProvider defaultMode="system">
      <BrowserRouter>
        <UsersProvider>
          <TMDBProvider>
            <StrictMode>
              <App />
            </StrictMode>
          </TMDBProvider>
        </UsersProvider>
      </BrowserRouter>
    </CssVarsProvider>
  </GoogleOAuthProvider>
);
