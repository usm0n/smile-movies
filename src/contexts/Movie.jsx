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

  getMovieId: (movieId) => {},
  addMovie: () => {},
  editMovie: (data) => {},
  deleteMovie: (movieId) => {},
  likeMovie: (currentLike, currentDisLike) => {},
  dislikeMovie: (currentLike, currentDisLike) => {},
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

  const editMovie = async (movie) => {
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

  const likeMovie = async (currentLike, currentDisLike) => {
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
        window.location.reload();
      });
  };

  const dislikeMovie = async (currentLike, currentDisLike) => {
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
        window.location.reload();
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
      value={{
        movieById,
        getMovieId,
        addMovie,
        statusAddMovie,
        statusEditMovie,
        editMovie,
        deleteMovie,
        statusDeleteMovie,
        likeMovie,
        dislikeMovie,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
