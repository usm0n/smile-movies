import React from "react";
import { useAllMovies } from "../contexts/AllMovies";
import MovieSkeletonCard from "./MovieSkeletonCard";
import MovieCard from "./MovieCard";
import { Grid } from "@mui/material";

function Movies() {
  const allMovies = useAllMovies();
  return (
    <section className="movies">
      <div className="container">
        <div className="movies-content">
          <h1 className="movies-title">Tarjima kinolar</h1>
          <div className="movies-movies">
            <div className="movies-cards">
              {allMovies.isLoading ? (
                <>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <MovieSkeletonCard />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <MovieSkeletonCard />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <MovieSkeletonCard />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <MovieSkeletonCard />
                  </Grid>
                </>
              ) : (
                allMovies.movies.map((movie) => (
                  <MovieCard movie={movie} language={"uz"} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Movies;
