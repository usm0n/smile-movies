import React, { useEffect } from "react";
import { useMovie } from "../contexts/Movie";
import MovieComponent from "../components/Movie";
import { useParams } from "react-router-dom";
import MovieSkeleton from "../components/MovieSkeleton";
import CommentSkeleton from "../components/CommentsSkeleton";

function Movie() {
  const { movieById, getMovieId } = useMovie();
  const { movieId } = useParams();
  useEffect(() => {
    getMovieId(movieId);
  }, [movieId]);
  return !movieById.isLoading ? (
    <>
      {movieById.movie && !movieById.isLoading && (
        <MovieComponent movie={movieById.movie} language={"uz"} />
      )}
    </>
  ) : (
    <>
      <MovieSkeleton />
    </>
  );
}

export default Movie;
