import {
  Box,
  ButtonGroup,
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
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "release">(
    "popularity",
  );

  const changeType = (newType: "tv" | "movie" | "all") => {
    setType(newType);
    navigate(
      `/discover/${newType === "all" ? "all" : newType === "tv" ? "TV Shows" : "Movies"}/${currentPage}`,
    );
  };

  const { discoverMovie, discoverMovieData, discoverTv, discoverTvData } =
    useTMDB();
  const currentPage = page ? +page : 1;

  let results =
    type === "movie"
      ? (discoverMovieData?.data as DiscoverMovie)?.results || []
      : type === "tv"
        ? (discoverTvData?.data as DiscoverTV)?.results || []
        : [
            ...((discoverTvData?.data as DiscoverTV)?.results || []),
            ...((discoverMovieData?.data as DiscoverMovie)?.results || []),
          ];

  results = [...results].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.vote_average || 0) - (a.vote_average || 0);
    } else if (sortBy === "release") {
      return (
        new Date(
          "release_date" in b ? b.release_date : b.first_air_date || "",
        ).getTime() -
        new Date(
          "release_date" in a ? a.release_date : a.first_air_date || "",
        ).getTime()
      );
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

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

        <Select value={sortBy} onChange={(_, value) => setSortBy(value as any)}>
          <Option value="popularity">Popular</Option>
          <Option value="rating">Highest Rated</Option>
          <Option value="release">Newest</Option>
        </Select>
      </Box>

      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {!isLoading ? (
          results.map((result) => (
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
