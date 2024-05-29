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

  statusEditMovie: {
    loading: false,
    isError: false,
    isSuccess: false,
  },

  statusDeleteMovie: {
    loading: false,
    isError: false,
    isSuccess: false,
  },

  ratingLoading: false,

  getMovieById: (movieId) => {},
  addMovie: () => {},
  editMovie: (movieId, data) => {},
  deleteMovie: (movieId) => {},
  likeMovie: (movieId, currentLike, currentDisLike) => {},
  dislikeMovie: (movieId, currentLike, currentDisLike) => {},
});

export const useMovie = () => useContext(MovieContext);

const MovieProvider = ({ children }) => {
  const [movieById, setMovie] = useState({});
  const [statusAddMovie, setStatusAddMovie] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [statusEditMovie, setStatusEditMovie] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [statusDeleteMovie, setStatusDeleteMovie] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const getMovieById = async (movieId) => {
    setMovie({
      isLoading: true,
      isError: false,
      movie: {},
    });
    await movies
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

  const editMovie = async (movieId, movie) => {
    setStatusEditMovie({
      loading: true,
      isError: false,
      isSuccess: false,
    });
    await movies
      .updateMovieById(movieId, movie)
      .then(() => {
        setStatusEditMovie({
          loading: false,
          isError: false,
          isSuccess: true,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusEditMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      })
      .catch(() => {
        setStatusEditMovie({
          loading: false,
          isError: true,
          isSuccess: false,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusEditMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      });
  };

  const deleteMovie = async (movieId) => {
    setStatusDeleteMovie({
      loading: true,
      isError: false,
      isSuccess: false,
    });
    await movies
      .deleteMovieById(movieId)
      .then(() => {
        setStatusDeleteMovie({
          loading: false,
          isError: false,
          isSuccess: true,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusDeleteMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      })
      .catch(() => {
        setStatusDeleteMovie({
          loading: false,
          isError: true,
          isSuccess: false,
        });
        setTimeout(() => {
          window.location.reload();
          setStatusDeleteMovie({
            loading: false,
            isError: false,
            isSuccess: false,
          });
        }, 1500);
      });
  };

  const likeMovie = async (movieId, currentLike, currentDisLike) => {
    setRatingLoading(true);
    await movies
      .updateMovieById(movieId, {
        rating: {
          like: localStorage.getItem(`likeMovie${movieId}`)
            ? currentLike - 1
            : currentLike + 1,
          dislike: localStorage.getItem(`dislikeMovie${movieId}`)
            ? currentDisLike - 1
            : currentDisLike,
        },
      })
      .then(() => {
        localStorage.getItem(`likeMovie${movieId}`)
          ? localStorage.removeItem(`likeMovie${movieId}`)
          : localStorage.setItem(`likeMovie${movieId}`, true);
        localStorage.getItem(`dislikeMovie${movieId}`)
          ? localStorage.removeItem(`dislikeMovie${movieId}`)
          : null;
        setRatingLoading(false);
        window.location.reload();
      });
  };

  const dislikeMovie = async (movieId, currentLike, currentDisLike) => {
    setRatingLoading(true);
    await movies
      .updateMovieById(movieId, {
        rating: {
          like: localStorage.getItem(`likeMovie${movieId}`)
            ? currentLike - 1
            : currentLike,
          dislike: localStorage.getItem(`dislikeMovie${movieId}`)
            ? currentDisLike - 1
            : currentDisLike + 1,
        },
      })
      .then(() => {
        localStorage.getItem(`likeMovie${movieId}`)
          ? localStorage.removeItem(`likeMovie${movieId}`)
          : null;
        localStorage.getItem(`dislikeMovie${movieId}`)
          ? localStorage.removeItem(`dislikeMovie${movieId}`)
          : localStorage.setItem(`dislikeMovie${movieId}`, true);
        setRatingLoading(false);
        window.location.reload();
      });
  };

  return (
    <MovieContext.Provider
      value={{
        movieById,
        addMovie,
        statusAddMovie,
        statusEditMovie,
        editMovie,
        deleteMovie,
        statusDeleteMovie,
        likeMovie,
        dislikeMovie,
        ratingLoading,
        getMovieById,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
