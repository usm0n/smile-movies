import { Box, ButtonGroup, IconButton, Typography } from "@mui/joy";
import { useTMDB } from "../../context/TMDB";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { searchMovie, searchTV } from "../../tmdb-res";
import EventMC from "../../components/cards/EventMC";
import EventMCS from "../../components/cards/skeleton/EventMC";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import Pagination from "../../components/navigation/Pagination";

function Search() {
  const { query, page } = useParams();
  const [type, setType] = useState<"tv" | "movie" | "all">("all");
  const { searchMovie, searchMovieData, searchTv, searchTvData } = useTMDB();

  const movieResults =
    (searchMovieData?.data as searchMovie)?.results?.sort(
      (a, b) => b.popularity - a.popularity,
    ) || [];
  const tvResults =
    (searchTvData?.data as searchTV)?.results?.sort(
      (a, b) => b.popularity - a.popularity,
    ) || [];
  const searchResults =
    type === "movie"
      ? movieResults
      : type === "tv"
        ? tvResults
        : [...tvResults, ...movieResults]?.sort(
            (a, b) => b.popularity - a.popularity,
          );

  const totalPages =
    type === "movie"
      ? (searchMovieData?.data as searchMovie)?.total_pages
      : type === "tv"
        ? (searchTvData?.data as searchTV)?.total_pages
        : Math.max(
            (searchMovieData?.data as searchMovie)?.total_pages || 0,
            (searchTvData?.data as searchTV)?.total_pages || 0,
          );

  const totalResults =
    type === "all"
      ? ((searchMovieData?.data as searchMovie)?.total_results || 0) +
        ((searchTvData?.data as searchTV)?.total_results || 0)
      : type === "movie"
        ? (searchMovieData?.data as searchMovie)?.total_results
        : (searchTvData?.data as searchTV)?.total_results;
  const currentPage = page ? +page : 1;

  useEffect(() => {
    if (query) {
      searchMovie(query, page ? +page : 1);
      searchTv(query, page ? +page : 1);
    }
  }, [query, page]);

  const isLoading = searchMovieData?.isLoading || searchTvData?.isLoading;

  return (
    <Box
      sx={{
        width: "90%",
        padding: "100px 0px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        minHeight: "100vh",
      }}
    >
      <Typography
        level="h1"
        fontWeight={700}
        sx={{ "@media (max-width: 768px)": { fontSize: "30px" } }}
      >
        Search Results for:{" "}
        <Typography fontWeight={400} textColor={"neutral.300"}>
          {query}
        </Typography>
      </Typography>

      <ButtonGroup>
        <IconButton
          onClick={() => setType("all")}
          color={type === "all" ? "primary" : "neutral"}
          variant={type === "all" ? "solid" : "outlined"}
          sx={{ padding: "0 20px" }}
        >
          All
        </IconButton>
        <IconButton
          onClick={() => setType("movie")}
          color={type === "movie" ? "primary" : "neutral"}
          variant={type === "movie" ? "solid" : "outlined"}
          sx={{ padding: "0 20px" }}
        >
          Movies
        </IconButton>
        <IconButton
          onClick={() => setType("tv")}
          color={type === "tv" ? "primary" : "neutral"}
          variant={type === "tv" ? "solid" : "outlined"}
          sx={{ padding: "0 20px" }}
        >
          TV shows
        </IconButton>
      </ButtonGroup>

      {!isLoading && searchResults.length > 0 && (
        <Typography>{totalResults} results found</Typography>
      )}
      {!isLoading && searchResults.length > 0 && (
        <Typography
          startDecorator={<AutoGraphIcon sx={{ color: "neutral.300" }} />}
        >
          Sorted by popularity
        </Typography>
      )}

      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {!searchResults.length && !isLoading && (
          <Typography textColor={"neutral.300"} level="h2" fontWeight={700}>
            No Results Found
          </Typography>
        )}

        {!isLoading ? (
          searchResults.map((result) => (
            <EventMC
              key={result?.id}
              eventPoster={result?.poster_path}
              eventId={result?.id}
              eventType={"name" in result ? "tv" : "movie"}
            />
          ))
        ) : (
          <>
            {Array(10)
              .fill(null)
              .map((_, i) => (
                <EventMCS key={i} />
              ))}
          </>
        )}

        {searchResults.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            whereTo={`/search/${query}`}
          />
        )}
      </Box>
    </Box>
  );
}

export default Search;
