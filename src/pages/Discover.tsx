import { Box, Select, Option } from "@mui/joy";
import SegmentedControl from "../components/ui/SegmentedControl";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Compass } from "../components/ui/icons";
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
        width: "100%",
        maxWidth: "var(--sm-page-max)",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        pt: "calc(var(--sm-nav-height) + 48px)",
        pb: 8,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minHeight: "100vh",
      }}
    >
      <PageHeader
        title="Discover"
        description="Browse everything, then narrow it down by type, year and rating."
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <SegmentedControl
          ariaLabel="Content type"
          value={type}
          onChange={(value) => changeType(value as typeof type)}
          segments={[
            { value: "all", label: "All" },
            { value: "movie", label: "Movies" },
            { value: "tv", label: "TV shows" },
          ]}
        />

        <Select
          size="sm"
          value={sortBy}
          onChange={(_, value) => setSortBy((value || "popularity") as DiscoverSort)}
        >
          <Option value="popularity">Popular</Option>
          <Option value="release">Newest</Option>
          <Option value="rating">Top rated</Option>
          <Option value="title">Title A-Z</Option>
        </Select>
        <Select
          size="sm"
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
          size="sm"
          value={ratingFilter}
          onChange={(_, value) => setRatingFilter((value || "all") as DiscoverRatingFilter)}
        >
          <Option value="all">Any rating</Option>
          <Option value="6">6.0+</Option>
          <Option value="7">7.0+</Option>
          <Option value="8">8.0+</Option>
        </Select>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        <Badge tone="contrast">{results.length} titles</Badge>
        <Badge>Movies {movieCount}</Badge>
        <Badge>TV {tvCount}</Badge>
        <Badge mono>Page {currentPage}</Badge>
      </Box>

      {!isLoading && !results.length && (
        <EmptyState
          icon={Compass}
          title="No titles match these filters"
          description="Loosen the year or rating filter and try again."
        />
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        }}
      >
        {!isLoading ? (
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

      </Box>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        whereTo={`/discover/${type === "all" ? "all" : type === "tv" ? "TV Shows" : "Movies"}`}
      />
    </Box>
  );
}

export default Discover;
