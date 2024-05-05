import React, { useEffect } from "react";
import { useAllMovies } from "../contexts/Movies";
import MovieSkeletonCard from "./MovieCardSkeleton";
import MovieCard from "./MovieCard";
import { Grid } from "@mui/material";

function Movies({ allMovies, language }) {
  return (
    <section className="movies">
      <div className="container">
        <div className="movies-content">
          <h1 className="movies-title">Kinolar</h1>
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
              ) : allMovies.movies.filter((m) => m.status.type === "movie")
                  .length > 0 ? (
                allMovies.movies
                  .filter((m) => m.status.type === "movie")
                  .map((movie) => (
                    <MovieCard movie={movie} language={language} />
                  ))
              ) : (
                <h1>Movies not found</h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Movies;
