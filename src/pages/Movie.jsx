import React, { useEffect } from "react";
import { useMovie } from "../contexts/Movie";
import MovieComponent from "../components/Movie";
import { useParams } from "react-router-dom";
import MovieSkeleton from "../components/Movie/Skeleton/index";

function Movie() {
  const { movieById, getMovieId } = useMovie();
  const { movieId } = useParams();
  useEffect(() => {
    getMovieId(movieId);
  }, [movieId]);
  return !movieById.isLoading ? (
    movieById.movie && <MovieComponent movie={movieById.movie}/>
  ) : (
    <MovieSkeleton />
  );
}

export default Movie;
