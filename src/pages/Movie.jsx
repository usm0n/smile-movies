import React, { useEffect } from "react";
import { useMovie } from "../contexts/Movie";
import MovieComponent from "../components/Movie";
import { useParams } from "react-router-dom";
import MovieSkeleton from "../components/Movie/Skeleton/index";
import NotFound from "../pages/error/NotFound";

function Movie() {
  const { movieById, likeMovie, dislikeMovie, ratingLoading, getMovieById } =
    useMovie();
  const { movieId } = useParams();

  useEffect(() => {
    getMovieById(movieId);
  }, [movieId]);
  return !movieById.isLoading ? (
    movieById.movie ? (
      <MovieComponent
        ratingLoading={ratingLoading}
        likeMovie={likeMovie}
        dislikeMovie={dislikeMovie}
        movie={movieById.movie}
      />
    ) : (
      <NotFound />
    )
  ) : (
    <MovieSkeleton />
  );
}

export default Movie;
