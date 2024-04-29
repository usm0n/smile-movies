import React, { useEffect } from "react";
import { useMovie } from "../contexts/Movie";
import MovieComponent from "../components/Movie";
import { useParams } from "react-router-dom";

function Movie() {
  const { movieById, getMovieId } = useMovie();
  const { movieId } = useParams();
  useEffect(() => {
    getMovieId(movieId);
  }, [movieId]);
  return (
    <>
      {movieById.movie && !movieById.isLoading && (
        <MovieComponent movie={movieById.movie} language={"uz"} />
      )}
    </>
  );
}

export default Movie;
