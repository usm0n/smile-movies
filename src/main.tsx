import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TMDBProvider } from "./context/TMDB.tsx";
import UsersProvider from "./context/Users.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UsersProvider>
      <TMDBProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </TMDBProvider>
    </UsersProvider>
  </BrowserRouter>
);
