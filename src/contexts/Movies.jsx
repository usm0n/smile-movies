import { createContext, useContext, useEffect, useState } from "react";
import movies from "../service/api/movies.api.service";
import shuffle from "../utilities/shuffle";

const MoviesContext = createContext({
  allMovies: {
    isLoading: false,
    isError: false,
    movies: [],
  },
  statusDeleteAllMovies: {
    isLoading: false,
    isError: false,
    isSuccess: false,
  },
  isNotConnected: false,
  deleteAllMovies: () => {},
});

export const useAllMovies = () => useContext(MoviesContext);

const MoviesProvider = ({ children }) => {
  const [allMovies, setAllMovies] = useState({
    isLoading: false,
    isError: false,
    movies: [],
  });
  const [statusDeleteAllMovies, setStatusDeleteAllMovies] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });
  const [isNotConnected, setIsNotConnected] = useState(false);

  const deleteAllMovies = async () => {
    setStatusDeleteAllMovies({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    await movies
      .deleteAllMovies()
      .then(() => {
        setStatusDeleteAllMovies({
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
        setAllMovies({
          isLoading: false,
          isError: false,
          movies: [],
        });
      })
      .catch(() => {
        setStatusDeleteAllMovies({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  const getAllMovies = async () => {
    setAllMovies({
      isLoading: true,
      isError: false,
      movies: [],
    });
    await movies
      .getAllMovies()
      .then((result) => {
        if (result.message == "Network Error") {
          setIsNotConnected(true);
        }
        setAllMovies({
          isLoading: false,
          isError: false,
          movies: shuffle(result.data),
        });
      })
      .catch((err) =>
        setAllMovies({ isLoading: false, movies: [], isError: true })
      );
  };

  useEffect(() => {
    getAllMovies();
  }, []);
  return (
    <MoviesContext.Provider
      value={{
        allMovies,
        deleteAllMovies,
        isNotConnected,
        statusDeleteAllMovies,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
};

export default MoviesProvider;
