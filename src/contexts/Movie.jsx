import { createContext, useContext, useEffect, useState } from "react";
import movies from "../service/api/movies.api.service";

const MovieContext = createContext({
  movie: {
    isLoading: false,
    isError: false,
    movie: {},
  },
  getMovieById: () => {},
});

export const useMovie = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [movieById, setMovie] = useState({});
  const [movieId, setMovieId] = useState();

  const getMovieId = async (movieId) => {
    setMovieId(movieId);
  };

  useEffect(() => {
    setMovie({
      isLoading: true,
      isError: false,
      movie: {},
    });
    movies
      .getMovieById(movieId)
      .then((movie) => {
        setMovie({
          isLoading: false,
          isError: false,
          movie: movie.data,
        });
      })
      .catch((error) => {
        setMovie({
          isLoading: false,
          isError: true,
          movie: {},
        });
      });
  }, [movieId]);

  return (
    <MovieContext.Provider value={{ movieById, getMovieId }}>
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
