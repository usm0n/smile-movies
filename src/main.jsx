import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AllMoviesProvider from "./contexts/AllMovies.jsx";
import MovieProvider from "./contexts/Movie.jsx";
import CommentsProvider from "./contexts/Comments.jsx";
import UserProvider from "./contexts/User.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AllMoviesProvider>
        <MovieProvider>
          <CommentsProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </CommentsProvider>
        </MovieProvider>
      </AllMoviesProvider>
    </BrowserRouter>
  </>
);
