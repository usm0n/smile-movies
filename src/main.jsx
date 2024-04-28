import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AllMoviesProvider from "./contexts/AllMovies.jsx";
import MovieProvider from "./contexts/Movie.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AllMoviesProvider>
        <MovieProvider>
          <App />
        </MovieProvider>
      </AllMoviesProvider>
    </BrowserRouter>
  </>
);
