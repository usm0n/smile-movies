import { createContext, useContext, useEffect, useState } from "react";
import movies from "../service/api/movies.api.service";

const MovieContext = createContext({
  movieById: {
    isLoading: false,
    isError: false,
    movie: {},
  },

  statusAddMovie: {
    loading: false,
    isError: false,
    isSuccess: false,
  },

  getMovieId: () => {},
  addMovie: () => {},
});

export const useMovie = () => useContext(MovieContext);

const MovieProvider = ({ children }) => {
  const [movieById, setMovie] = useState({});
  const [statusAddMovie, setStatusAddMovie] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [movieId, setMovieId] = useState();

  const getMovieId = async (movieId) => {
    setMovieId(movieId);
  };

  const addMovie = async (movie) => {
    setStatusAddMovie({
      loading: true,
      isError: false,
      isSuccess: false,
    });
    await movies
      .createMovie({ ...movie })
      .then(() => {
        setStatusAddMovie({
          loading: false,
          isError: false,
          isSuccess: true,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusAddMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      })
      .catch(() => {
        setStatusAddMovie({
          loading: false,
          isError: true,
          isSuccess: false,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusAddMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      });
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
    <MovieContext.Provider
      value={{ movieById, getMovieId, addMovie, statusAddMovie }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
