import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import MovieProvider from "./contexts/Movie.jsx";
import CommentsProvider from "./contexts/Comments.jsx";
import UserProvider from "./contexts/User.jsx";
import MoviesProvider from "./contexts/Movies.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <MoviesProvider>
        <MovieProvider>
          <CommentsProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </CommentsProvider>
        </MovieProvider>
      </MoviesProvider>
    </BrowserRouter>
  </>
);
