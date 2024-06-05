import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAllMovies } from "../../contexts/Movies";
import { Grid } from "@mui/material";
import MovieCard from "../../components/MovieCard/MovieCard";
import { backButton, language } from "../../utilities/defaultFunctions";
import MovieSkeletonCard from "../../components/MovieCard/Skeleton/MovieCardSkeleton";
import { t } from "i18next";
import Pagination from "../../components/utils/Pagination";

function Search({ backTo, linkTo }) {
  const { value } = useParams();
  const { allMovies } = useAllMovies();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);

  const prods = allMovies.movies.filter((m) => {
    return (
      m.title.uz.toLowerCase().includes(value.toLowerCase()) ||
      m.title.en.toLowerCase().includes(value.toLowerCase()) ||
      m.title.ru.toLowerCase().includes(value.toLowerCase()) ||
      m.releaseDate.year.includes(value)
    );
  });
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = prods.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="search">
      {backButton(() => navigate(backTo))}
      <h1 className="search-title">
        {t("SearchPlaceholder")}: {value}
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
          <h1 className="search-not-found">
            {language == "en" &&
              (prods.length ? prods.length : "No") + " results found"}
            {language == "uz" &&
              (prods.length
                ? prods.length + " natija topildi"
                : "Natijalar topilmadi")}
            {language == "ru" &&
              (prods.length
                ? "Найдено " + prods.length + " результатов"
                : "Результатов не найдено")}
          </h1>
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
                      linkTo={`${linkTo}/${m._id}`}
                      movie={m}
                      language={language}
                    />
                  </Grid>
                </>
              );
            })}
          </Grid>
          <Pagination
            totalPosts={prods.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </>
      )}
    </div>
  );
}

export default Search;
