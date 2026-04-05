import {
  Box,
  ButtonGroup,
  Chip,
  IconButton,
  Typography,
  Select,
  Option,
} from "@mui/joy";
import { useTMDB } from "../context/TMDB";
import { useEffect, useState } from "react";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import type { DiscoverMovie, DiscoverTV } from "../tmdb-res";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../components/navigation/Pagination";

type DiscoverSort = "popularity" | "release" | "rating" | "title";
type DiscoverYearFilter = "all" | "2020s" | "2010s" | "2000s" | "classic";
type DiscoverRatingFilter = "all" | "6" | "7" | "8";

const getResultTitle = (item: any) => ("name" in item ? item?.name : item?.title) || "";
const getResultType = (item: any) => ("name" in item ? "tv" : "movie");
const getResultYear = (item: any) => {
  const year = Number(
    String("release_date" in item ? item.release_date : item.first_air_date || "").slice(0, 4),
  );
  return Number.isFinite(year) && year > 1800 ? year : null;
};

const matchesYearFilter = (year: number | null, filter: DiscoverYearFilter) => {
  if (filter === "all") return true;
  if (!year) return false;
  if (filter === "2020s") return year >= 2020;
  if (filter === "2010s") return year >= 2010 && year <= 2019;
  if (filter === "2000s") return year >= 2000 && year <= 2009;
  return year < 2000;
};

function Discover() {
  const { page, type: typeFromParams } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState<"tv" | "movie" | "all">(
    typeFromParams === "TV Shows"
      ? "tv"
      : typeFromParams === "Movies"
        ? "movie"
        : "all",
  );
  const [sortBy, setSortBy] = useState<DiscoverSort>("popularity");
  const [yearFilter, setYearFilter] = useState<DiscoverYearFilter>("all");
  const [ratingFilter, setRatingFilter] =
    useState<DiscoverRatingFilter>("all");

  const changeType = (newType: "tv" | "movie" | "all") => {
    setType(newType);
    navigate(
      `/discover/${newType === "all" ? "all" : newType === "tv" ? "TV Shows" : "Movies"}/${currentPage}`,
    );
  };

  const { discoverMovie, discoverMovieData, discoverTv, discoverTvData } =
    useTMDB();
  const currentPage = page ? +page : 1;

  const baseResults =
    type === "movie"
      ? (discoverMovieData?.data as DiscoverMovie)?.results || []
      : type === "tv"
        ? (discoverTvData?.data as DiscoverTV)?.results || []
        : [
            ...((discoverTvData?.data as DiscoverTV)?.results || []),
            ...((discoverMovieData?.data as DiscoverMovie)?.results || []),
          ];

  let results = [...baseResults].filter((item) => {
    const year = getResultYear(item);
    const rating =
      typeof item.vote_average === "number" ? item.vote_average : 0;
    const ratingMatch =
      ratingFilter === "all" || rating >= Number(ratingFilter);

    return matchesYearFilter(year, yearFilter) && ratingMatch;
  });

  results = [...results].sort((a, b) => {
    if (sortBy === "release") {
      return (getResultYear(b) || 0) - (getResultYear(a) || 0);
    }

    if (sortBy === "rating") {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }

    if (sortBy === "title") {
      return getResultTitle(a).localeCompare(getResultTitle(b));
    }

    return (b.popularity || 0) - (a.popularity || 0);
  });

  const movieCount = results.filter((item) => getResultType(item) === "movie").length;
  const tvCount = results.filter((item) => getResultType(item) === "tv").length;

  const totalPages =
    type === "movie"
      ? (discoverMovieData?.data as DiscoverMovie)?.total_pages
      : type === "tv"
        ? (discoverTvData?.data as DiscoverTV)?.total_pages
        : Math.max(
            (discoverMovieData?.data as DiscoverMovie)?.total_pages || 0,
            (discoverTvData?.data as DiscoverTV)?.total_pages || 0,
          );

  useEffect(() => {
    if (type === "movie") {
      discoverMovie(currentPage);
    } else if (type === "tv") {
      discoverTv(currentPage);
    } else {
      discoverMovie(currentPage);
      discoverTv(currentPage);
    }
  }, [type, currentPage]);

  const isLoading = discoverMovieData?.isLoading || discoverTvData?.isLoading;

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
      <Box
        sx={{
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography
          level="h1"
          sx={{
            fontSize: { xs: "2rem", md: "3.5rem" },
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            animation:
              "slideInBounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            "@keyframes slideInBounce": {
              "0%": {
                opacity: 0,
                transform: "translateY(-50px) scale(0.9)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0) scale(1)",
              },
            },
          }}
        >
          Discover Your Next Favorite
        </Typography>
        <Typography
          level="body-lg"
          sx={{
            color: "text.secondary",
            animation: "fadeInUp 0.8s ease-out 0.3s both",
            "@keyframes fadeInUp": {
              from: {
                opacity: 0,
                transform: "translateY(20px)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          Movies & TV Shows Await
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <ButtonGroup>
          <IconButton
            onClick={() => changeType("all")}
            color={type === "all" ? "primary" : "neutral"}
            variant={type === "all" ? "solid" : "outlined"}
            sx={{ padding: "0 20px" }}
          >
            All
          </IconButton>
          <IconButton
            onClick={() => changeType("movie")}
            color={type === "movie" ? "primary" : "neutral"}
            variant={type === "movie" ? "solid" : "outlined"}
            sx={{ padding: "0 20px" }}
          >
            Movies
          </IconButton>
          <IconButton
            onClick={() => changeType("tv")}
            color={type === "tv" ? "primary" : "neutral"}
            variant={type === "tv" ? "solid" : "outlined"}
            sx={{ padding: "0 20px" }}
          >
            TV shows
          </IconButton>
        </ButtonGroup>

        <Select
          value={sortBy}
          onChange={(_, value) => setSortBy((value || "popularity") as DiscoverSort)}
        >
          <Option value="popularity">Popular</Option>
          <Option value="release">Newest</Option>
          <Option value="rating">Top rated</Option>
          <Option value="title">Title A-Z</Option>
        </Select>
        <Select
          value={yearFilter}
          onChange={(_, value) => setYearFilter((value || "all") as DiscoverYearFilter)}
        >
          <Option value="all">All years</Option>
          <Option value="2020s">2020s</Option>
          <Option value="2010s">2010s</Option>
          <Option value="2000s">2000s</Option>
          <Option value="classic">Before 2000</Option>
        </Select>
        <Select
          value={ratingFilter}
          onChange={(_, value) => setRatingFilter((value || "all") as DiscoverRatingFilter)}
        >
          <Option value="all">Any rating</Option>
          <Option value="6">6.0+</Option>
          <Option value="7">7.0+</Option>
          <Option value="8">8.0+</Option>
        </Select>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          sx={{
            background: "rgba(96, 183, 255, 0.1)",
            border: "1px solid rgba(96, 183, 255, 0.24)",
            color: "rgb(96, 183, 255)",
          }}
        >
          Showing {results.length} titles
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
            background: "rgba(255, 220, 92, 0.08)",
            border: "1px solid rgba(255, 220, 92, 0.2)",
            color: "rgb(255, 220, 92)",
          }}
        >
          Page {currentPage}
        </Chip>
      </Box>

      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {!isLoading && !results.length ? (
          <Typography level="h2" textColor="neutral.300" fontWeight={700}>
            No titles match these filters
          </Typography>
        ) : !isLoading ? (
          results.map((result) => (
            <EventMC
              key={result?.id}
              eventPoster={result?.poster_path}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          whereTo={`/discover/${type === "all" ? "all" : type === "tv" ? "TV Shows" : "Movies"}`}
        />
      </Box>
    </Box>
  );
}

export default Discover;
