import { createContext, useContext, useEffect, useState } from "react";
import users from "../service/api/users.api.service";
import { userId } from "../utilities/defaultFunctions";

const FavouritesContext = createContext({
  favourites: {
    loading: false,
    isEmpty: false,
    isError: false,
    result: [],
  },
  statusAddFavourites: {
    loading: false,
    isSuccess: false,
    isError: false,
    isAlreadyIn: false,
  },
  statusRemoveFavourites: {
    loading: false,
    isSuccess: false,
    isError: false,
    isNotFound: false,
  },
  addFavourites: (movieId) => {},
  removeFavourites: (movieId) => {},
});

export const useFavourites = () => useContext(FavouritesContext);

const FavouritesProvider = ({ children }) => {
  const [favourites, setFavourites] = useState({
    loading: false,
    isEmpty: false,
    isError: false,
    result: [],
  });
  const [statusAddFavourites, setStatusAddFavourites] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
    isAlreadyIn: false,
  });
  const [statusRemoveFavourites, setStatusRemoveFavourites] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
    isNotFound: false,
  });
  const addFavourites = (movieId) => {
    setStatusAddFavourites({
      loading: true,
      isSuccess: false,
      isError: false,
      isAlreadyIn: false,
    });
    users
      .addMovieToFavourites(userId, movieId)
      .then((res) => {
        if (!res.data) {
          setStatusAddFavourites({
            loading: false,
            isSuccess: false,
            isError: false,
            isAlreadyIn: true,
          });
        } else {
          setStatusAddFavourites({
            loading: false,
            isSuccess: true,
            isError: false,
            isAlreadyIn: false,
          });
        }
      })
      .catch(() => {
        setStatusAddFavourites({
          loading: false,
          isSuccess: false,
          isError: true,
          isAlreadyIn: false,
        });
      });
  };

  const removeFavourites = (movieId) => {
    setStatusRemoveFavourites({
      loading: true,
      isSuccess: false,
      isError: false,
      isNotFound: false,
    });
    users
      .removeMovieFromFavourites(userId, movieId)
      .then((res) => {
        if (res.response) {
          setStatusRemoveFavourites({
            loading: false,
            isSuccess: false,
            isError: false,
            isNotFound: true,
          });
        } else {
          setStatusRemoveFavourites({
            loading: false,
            isSuccess: true,
            isError: false,
            isNotFound: false,
          });
        }
      })
      .catch(() => {
        setStatusRemoveFavourites({
          loading: false,
          isSuccess: false,
          isError: true,
          isNotFound: false,
        });
      });
  };
  useEffect(() => {
    setFavourites({
      loading: true,
      isEmpty: false,
      isError: false,
      result: [],
    });
    users
      .getFavourites(userId)
      .then((result) => {
        if (!result.data.length) {
          setFavourites({
            loading: false,
            isEmpty: true,
            isError: false,
            result: [],
          });
        } else if (result.response) {
          setFavourites({
            loading: false,
            isEmpty: false,
            isError: true,
            result: [],
          });
        } else {
          setFavourites({
            loading: false,
            isEmpty: false,
            isError: false,
            result: result.data.movies,
          });
        }
      })
      .catch(() => {
        setFavourites({
          loading: false,
          isEmpty: false,
          isError: true,
          result: [],
        });
      });
  }, []);
  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        addFavourites,
        removeFavourites,
        statusAddFavourites,
        statusRemoveFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export default FavouritesProvider;
