import React, { useEffect } from "react";
import { useAllMovies } from "../contexts/AllMovies";
import MovieSkeletonCard from "./MovieCardSkeleton";
import MovieCard from "./MovieCard";
import { Grid } from "@mui/material";

function Cartoons({ allMovies, language }) {
  return (
    <section className="movies">
      <div className="container">
        <div className="movies-content">
          <h1 className="movies-title">Multifilmlar</h1>
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
              ) : allMovies.movies.filter((m) => m.status.type === "cartoon")
                  .length > 0 ? (
                allMovies.movies
                  .filter((m) => m.status.type === "cartoon")
                  .map((movie) => <MovieCard movie={movie} language={language} />)
              ) : (
                <h1>Cartoons not found</h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cartoons;
