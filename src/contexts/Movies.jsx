import { createContext, useContext, useEffect, useState } from "react";
import movies from "../service/api/movies.api.service";
import shuffle from "../utilities/shuffle";

const MoviesContext = createContext({
  allMovies: {
    isLoading: false,
    isError: false,
    movies: [],
  },
  deleteAllMovies: () => {},
});
MoviesContext.displayName = "MoviesContext";

export const useAllMovies = () => useContext(MoviesContext);

const MoviesProvider = ({ children }) => {
  const [allMovies, setAllMovies] = useState({
    isLoading: false,
    isError: false,
    movies: [],
  });

  const deleteAllMovies = async () => {
    await movies.deleteAllMovies().then(() => {
      setAllMovies({
        isLoading: false,
        isError: false,
        movies: [],
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
      .then((result) =>
        setAllMovies({
          isLoading: false,
          isError: false,
          movies: shuffle(result.data),
        })
      )
      .catch((err) =>
        setAllMovies({ isLoading: false, movies: [], isError: true })
      );
  };

  useEffect(() => {
    getAllMovies();
  }, []);
  return (
    <MoviesContext.Provider value={{ allMovies, deleteAllMovies }}>
      {children}
    </MoviesContext.Provider>
  );
};

export default MoviesProvider;
