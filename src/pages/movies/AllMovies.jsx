import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAllMovies } from "../../contexts/Movies";
import { Grid } from "@mui/material";
import MovieCard from "../../components/MovieCard/MovieCard";
import { backButton, language } from "../../utilities/defaultFunctions";
import MovieSkeletonCard from "../../components/MovieCard/Skeleton/MovieCardSkeleton";
import Pagination from "../../components/utils/Pagination";
import { t } from "i18next";

function AllMovies({ MovieType, MoviesType }) {
  const { allMovies } = useAllMovies();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);

  const movies = allMovies.movies.filter((m) => {
    return m.status.type == MovieType;
  });
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = movies.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="search">
      {backButton(() => navigate("/"))}
      <h1 className="search-title">
        {MoviesType == "movies"
          ? t("MoviesTitle")
          : MoviesType == "cartoons"
          ? t("CartoonsTitle")
          : t("SeriesTitle")}
      </h1>
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
      ) : (
        <>
          <Grid
            container
            spacing={10}
            justifyContent="flex-start"
            alignItems="stretch"
            className="search-found"
          >
            {currentPosts.map((m, i) => {
              return (
                <>
                  <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                    <MovieCard
                      linkTo={`/movie/${m._id}`}
                      movie={m}
                      language={language}
                    />
                  </Grid>
                </>
              );
            })}
          </Grid>
          <Pagination
            totalPosts={movies.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            MoviesType={MoviesType}
            onChangeLink={"movies"}
          />
        </>
      )}
    </div>
  );
}

export default AllMovies;
