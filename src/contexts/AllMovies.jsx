import { createContext, useContext, useEffect, useState } from "react";
import movies from "../service/api/movies.api.service";
import shuffle from "../utilities/shuffle";

const AllMoviesContext = createContext({
  isLoading: false,
  isError: false,
  movies: [],
});
AllMoviesContext.displayName = "AllMoviesContext";

export const useAllMovies = () => useContext(AllMoviesContext);

const AllMoviesProvider = ({ children }) => {
  const [allMovies, setAllMovies] = useState({
    isLoading: false,
    isError: false,
    movies: [],
  });

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
    <AllMoviesContext.Provider value={allMovies}>
      {children}
    </AllMoviesContext.Provider>
  );
};

export default AllMoviesProvider;
