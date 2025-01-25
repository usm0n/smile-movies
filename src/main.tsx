import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TMDBProvider } from "./context/TMDB.tsx";
import UsersProvider from "./context/Users.tsx";

createRoot(document.getElementById("root")!).render(
  <UsersProvider>
    <TMDBProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </TMDBProvider>
  </UsersProvider>
);
