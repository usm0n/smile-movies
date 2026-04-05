import { Box, ButtonGroup, Chip, IconButton, Option, Select, Typography } from "@mui/joy";
import { useTMDB } from "../../context/TMDB";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { searchMovie, searchPerson, searchTV } from "../../tmdb-res";
import EventMC from "../../components/cards/EventMC";
import EventMCS from "../../components/cards/skeleton/EventMC";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import Pagination from "../../components/navigation/Pagination";

type SearchSort = "popularity" | "rating" | "release" | "title";
type SearchYearFilter = "all" | "2020s" | "2010s" | "2000s" | "classic";
type SearchRatingFilter = "all" | "6" | "7" | "8";

const decodeRouteQuery = (value?: string) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getResultTitle = (result: any) =>
  ("gender" in result ? result?.name : "name" in result ? result?.name : result?.title) || "";

const getResultType = (result: any) =>
  ("gender" in result ? "person" : "name" in result ? "tv" : "movie");

const getResultYear = (result: any) => {
  if ("gender" in result) return null;
  const year = Number(
    String("release_date" in result ? result.release_date : result.first_air_date || "").slice(0, 4),
  );
  return Number.isFinite(year) && year > 1800 ? year : null;
};

const matchesYearFilter = (year: number | null, filter: SearchYearFilter) => {
  if (filter === "all") return true;
  if (!year) return false;
  if (filter === "2020s") return year >= 2020;
  if (filter === "2010s") return year >= 2010 && year <= 2019;
  if (filter === "2000s") return year >= 2000 && year <= 2009;
  return year < 2000;
};

function Search() {
  const { query, page } = useParams();
  const [type, setType] = useState<"tv" | "movie" | "all" | "person">("all");
  const [sortBy, setSortBy] = useState<SearchSort>("popularity");
  const [yearFilter, setYearFilter] = useState<SearchYearFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<SearchRatingFilter>("all");
  const {
    searchMovie,
    searchMovieData,
    searchTv,
    searchTvData,
    searchPerson,
    searchPersonData,
  } = useTMDB();

  const movieResults =
    (searchMovieData?.data as searchMovie)?.results?.sort(
      (a, b) => b.popularity - a.popularity,
    ) || [];
  const tvResults =
    (searchTvData?.data as searchTV)?.results?.sort(
      (a, b) => b.popularity - a.popularity,
    ) || [];
  const personResults =
    (searchPersonData?.data as searchPerson)?.results?.sort(
      (a, b) => b.popularity - a.popularity,
    ) || [];
  const decodedQuery = decodeRouteQuery(query);
  const mediaFiltersActive = yearFilter !== "all" || ratingFilter !== "all";

  const searchResults =
    type === "movie"
      ? movieResults
      : type === "tv"
        ? tvResults
        : type === "person"
          ? personResults
          : [...tvResults, ...movieResults, ...personResults];

  const filteredResults = [...searchResults]
    .filter((result) => {
      const resultType = getResultType(result);
      if (resultType === "person") {
        return type === "person" || !mediaFiltersActive;
      }

      const year = getResultYear(result);
      const rating =
        typeof result.vote_average === "number" ? result.vote_average : 0;
      const ratingMatch =
        ratingFilter === "all" || rating >= Number(ratingFilter);

      return matchesYearFilter(year, yearFilter) && ratingMatch;
    })
    .sort((a, b) => {
      if (sortBy === "release") {
        const releaseDelta = (getResultYear(b) || 0) - (getResultYear(a) || 0);
        if (releaseDelta !== 0) return releaseDelta;
        return (b.popularity || 0) - (a.popularity || 0);
      }

      if (sortBy === "rating") {
        const ratingDelta = (b.vote_average || 0) - (a.vote_average || 0);
        if (ratingDelta !== 0) return ratingDelta;
        return (b.popularity || 0) - (a.popularity || 0);
      }

      if (sortBy === "title") {
        return getResultTitle(a).localeCompare(getResultTitle(b));
      }

      return (b.popularity || 0) - (a.popularity || 0);
    });

  const totalPages =
    type === "movie"
      ? (searchMovieData?.data as searchMovie)?.total_pages
      : type === "tv"
        ? (searchTvData?.data as searchTV)?.total_pages
        : type === "person"
          ? (searchPersonData?.data as searchPerson)?.total_pages
          : Math.max(
              (searchMovieData?.data as searchMovie)?.total_pages || 0,
              (searchTvData?.data as searchTV)?.total_pages || 0,
              (searchPersonData?.data as searchPerson)?.total_pages || 0,
            );
  const totalResults =
    type === "all"
      ? ((searchMovieData?.data as searchMovie)?.total_results || 0) +
        ((searchTvData?.data as searchTV)?.total_results || 0) +
        ((searchPersonData?.data as searchPerson)?.total_results || 0)
      : type === "movie"
        ? (searchMovieData?.data as searchMovie)?.total_results
        : type === "tv"
          ? (searchTvData?.data as searchTV)?.total_results
          : (searchPersonData?.data as searchPerson)?.total_results || 0;
  const currentPage = page ? +page : 1;
  const movieCount = filteredResults.filter((result) => getResultType(result) === "movie").length;
  const tvCount = filteredResults.filter((result) => getResultType(result) === "tv").length;
  const peopleCount = filteredResults.filter((result) => getResultType(result) === "person").length;

  const isLoading =
    searchMovieData?.isLoading ||
    searchTvData?.isLoading ||
    searchPersonData?.isLoading;

  useEffect(() => {
    if (query) {
      searchMovie(query, page ? +page : 1);
      searchTv(query, page ? +page : 1);
      searchPerson(query, page ? +page : 1);
    }
  }, [query, page]);
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
          {decodedQuery}
        </Typography>
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
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
        <IconButton
          onClick={() => setType("person")}
          color={type === "person" ? "primary" : "neutral"}
          variant={type === "person" ? "solid" : "outlined"}
          sx={{ padding: "0 20px" }}
        >
          People
        </IconButton>
        </ButtonGroup>
        <Select
          value={sortBy}
          onChange={(_, value) => setSortBy((value || "popularity") as SearchSort)}
          size="sm"
        >
          <Option value="popularity">Sort: Popularity</Option>
          <Option value="rating">Sort: Rating</Option>
          <Option value="release">Sort: Newest</Option>
          <Option value="title">Sort: Title</Option>
        </Select>
        {type !== "person" && (
          <>
            <Select
              value={yearFilter}
              onChange={(_, value) => setYearFilter((value || "all") as SearchYearFilter)}
              size="sm"
            >
              <Option value="all">All years</Option>
              <Option value="2020s">2020s</Option>
              <Option value="2010s">2010s</Option>
              <Option value="2000s">2000s</Option>
              <Option value="classic">Before 2000</Option>
            </Select>
            <Select
              value={ratingFilter}
              onChange={(_, value) => setRatingFilter((value || "all") as SearchRatingFilter)}
              size="sm"
            >
              <Option value="all">Any rating</Option>
              <Option value="6">6.0+</Option>
              <Option value="7">7.0+</Option>
              <Option value="8">8.0+</Option>
            </Select>
          </>
        )}
      </Box>

      {!isLoading && filteredResults.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            sx={{
              background: "rgba(96, 183, 255, 0.1)",
              border: "1px solid rgba(96, 183, 255, 0.24)",
              color: "rgb(96, 183, 255)",
            }}
          >
            Showing {filteredResults.length} of {totalResults} results
          </Chip>
          <Chip
            sx={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Movies: {movieCount}
          </Chip>
          <Chip
            sx={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            TV shows: {tvCount}
          </Chip>
          <Chip
            sx={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            People: {peopleCount}
          </Chip>
        </Box>
      )}
      {!isLoading && filteredResults.length > 0 && (
        <Typography>{totalResults} results found</Typography>
      )}
      {!isLoading && filteredResults.length > 0 && (
        <Typography
          startDecorator={<AutoGraphIcon sx={{ color: "neutral.300" }} />}
        >
          {sortBy === "popularity"
            ? "Sorted by popularity"
            : sortBy === "rating"
              ? "Sorted by rating"
              : sortBy === "release"
                ? "Sorted by newest release"
                : "Sorted alphabetically"}
        </Typography>
      )}

      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {!filteredResults.length && !isLoading && (
          <Typography textColor={"neutral.300"} level="h2" fontWeight={700}>
            No Results Found
          </Typography>
        )}

        {!isLoading ? (
          filteredResults.map((result) => (
            <EventMC
              key={result?.id}
              eventPoster={
                "poster_path" in result
                  ? result?.poster_path
                  : "profile_path" in result
                    ? result?.profile_path
                    : ""
              }
              eventTitle={getResultTitle(result)}
              eventId={result?.id}
              eventType={getResultType(result)}
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

        {filteredResults.length > 0 && (
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
