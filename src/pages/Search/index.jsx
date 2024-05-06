import React from "react";
import { useParams } from "react-router-dom";
import { useAllMovies } from "../../contexts/Movies";
import { Box, Grid, Typography } from "@mui/material";
import MovieCard from "../../components/MovieCard";
import { language } from "../../utilities/defaultFunctions";

function Search() {
  const { value } = useParams();
  const { allMovies } = useAllMovies();

  const prods = allMovies.movies.filter((m) => {
    return (
      m.title.uz.toLowerCase().includes(value.toLowerCase()) ||
      m.title.en.toLowerCase().includes(value.toLowerCase()) ||
      m.title.ru.toLowerCase().includes(value.toLowerCase())
    );
  });

  return (
    <div className="search">
      <h1 className="search-title">Search: {value}</h1>

      {!prods.length ? (
        <h1 className="search-not-found">No results found for "{value}"</h1>
      ) : (
        <Grid
          container
          spacing={10}
          justifyContent="flex-start"
          alignItems="stretch"
          className="search-found"
        >
          {prods.map((m, i) => {
            return (
              <>
                <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                  <MovieCard movie={m} language={language} />
                </Grid>
              </>
            );
          })}
        </Grid>
      )}
    </div>
  );
}

export default Search;
