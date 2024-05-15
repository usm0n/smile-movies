import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAllMovies } from "../../contexts/Movies";
import { Box, Button, Grid, Typography } from "@mui/material";
import MovieCard from "../../components/MovieCard";
import { language } from "../../utilities/defaultFunctions";
import MovieSkeletonCard from "../../components/MovieCardSkeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function DeleteMovie() {
  const { value } = useParams();
  const { allMovies } = useAllMovies();
  const navigate = useNavigate();

  const prods = allMovies.movies.filter((m) => {
    return (
      m.title.uz.toLowerCase().includes(value) ||
      m.title.en.toLowerCase().includes(value) ||
      m.title.ru.toLowerCase().includes(value)
    );
  });

  return (
    <div className="search">
      <Button
        onClick={() => navigate("/admin/delete-movie")}
        sx={{
          position: "absolute",
          top: "80px",
          left: "10px",
          display: "flex",
          gap: "10px",
          color: "#fff",
        }}
      >
        <ArrowBackIcon />
        Back to search
      </Button>
      <h1 className="search-title">Search: {value}</h1>
      {allMovies.isLoading ? (
        <>
          <Grid
            sx={{ display: "flex", flexWrap: "wrap" }}
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <MovieSkeletonCard />
            <MovieSkeletonCard />
            <MovieSkeletonCard />
            <MovieSkeletonCard />
          </Grid>
        </>
      ) : !prods.length ? (
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
                  <MovieCard
                    linkTo={`/admin/delete-movie/${m._id}`}
                    movie={m}
                    language={language}
                  />
                </Grid>
              </>
            );
          })}
        </Grid>
      )}
    </div>
  );
}

export default DeleteMovie;
