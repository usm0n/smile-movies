import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import MovieProvider from "./contexts/Movie.jsx";
import CommentsProvider from "./contexts/Comments.jsx";
import UserProvider from "./contexts/User.jsx";
import MoviesProvider from "./contexts/Movies.jsx";
import WatchLaterProvider from "./contexts/WatchLater.jsx";
import FavouritesProvider from "./contexts/Favourites.jsx";
import TranslationProvider from "./provider/TranslationProvider.jsx";
import UsersProvider from "./contexts/Users.jsx";
import MoviesTMDBProvider from "./contexts/MoviesTMDB.tsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <MoviesTMDBProvider>
        <MoviesProvider>
          <UsersProvider>
            <MovieProvider>
              <UserProvider>
                <CommentsProvider>
                  <WatchLaterProvider>
                    <FavouritesProvider>
                      <TranslationProvider>
                        <App />
                      </TranslationProvider>
                    </FavouritesProvider>
                  </WatchLaterProvider>
                </CommentsProvider>
              </UserProvider>
            </MovieProvider>
          </UsersProvider>
        </MoviesProvider>
      </MoviesTMDBProvider>
    </BrowserRouter>
  </>
);
