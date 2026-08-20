import { Box, Option, Select, Typography } from "@mui/joy";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useTMDB } from "../../context/TMDB";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Movie, searchMovie, searchPerson, searchTV } from "../../tmdb-res";
import EventMC from "../../components/cards/EventMC";
import EventMCS from "../../components/cards/skeleton/EventMC";
import { Search as SearchIcon } from "../../components/ui/icons";
import Pagination from "../../components/navigation/Pagination";
import AISuggestions from "../../components/ai/AISuggestions";
import { aiService } from "../../service/api/ai/ai.api.service";
import type { ResolvedMedia } from "../../utilities/resolveSuggestedMedia";

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
  const [rescueResults, setRescueResults] = useState<ResolvedMedia[]>([]);
  const [rescueNote, setRescueNote] = useState("");
  const [rescueStrategy, setRescueStrategy] = useState("");
  const [rescueLoading, setRescueLoading] = useState(false);
  const [rescueError, setRescueError] = useState("");
  const rescuedQueryRef = useRef("");
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
        typeof (result as Movie).vote_average === "number" ? (result as Movie).vote_average : 0;
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
        const ratingDelta = ((b as Movie).vote_average || 0) - ((a as Movie).vote_average || 0);
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

  /**
   * TMDB matches on titles only, so a search phrased as a description — "the one
   * where the guy has tattoos and can't form memories" — returns nothing even
   * though the answer is obvious. When that happens, ask the assistant what the
   * viewer probably meant and resolve its guesses back into real catalogue
   * entries, rather than leaving them at a dead end.
   */
  const runSearchRescue = useCallback(async (rescueQuery: string) => {
    setRescueLoading(true);
    setRescueError("");
    setRescueNote("");
    setRescueStrategy("");
    setRescueResults([]);

    try {
      const assist = await aiService.searchAssist(rescueQuery);
      setRescueNote(assist.interpretation);
      setRescueStrategy(assist.strategy);
      // Results already carry real TMDB ids and posters, so unlike the
      // assistant's recommendations there is nothing left to look up.
      setRescueResults(
        assist.results.map((item) => ({
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          year: item.year,
          reason: item.matchedOn,
        })),
      );
    } catch {
      setRescueError("Couldn't work out what you meant. Try rewording it.");
    } finally {
      setRescueLoading(false);
    }
  }, []);

  // Only a true zero-result search is a dead end. Every tab must be empty, not
  // just the active one — if the catalogue matched a TV show while the viewer
  // is on the Movies tab, the fix is to switch tabs, not to guess. Likewise a
  // filter hiding results is a filter problem, not a search problem.
  const catalogueMatchCount = [...movieResults, ...tvResults, ...personResults].length;
  const isDeadEndSearch =
    !isLoading && !!decodedQuery && !mediaFiltersActive && catalogueMatchCount === 0;

  useEffect(() => {
    if (!isDeadEndSearch) {
      rescuedQueryRef.current = "";
      setRescueResults([]);
      setRescueNote("");
      setRescueStrategy("");
      setRescueError("");
      return;
    }

    // Results arrive from three separate requests, so this effect can fire more
    // than once for the same dead end. Only pay for the first.
    if (rescuedQueryRef.current === decodedQuery) return;
    rescuedQueryRef.current = decodedQuery;
    void runSearchRescue(decodedQuery);
  }, [decodedQuery, isDeadEndSearch, runSearchRescue]);
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
        overline="Search"
        title={decodedQuery}
        description={
          isLoading ? "Searching…" : `${totalResults} result${totalResults === 1 ? "" : "s"} found`
        }
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <SegmentedControl
          ariaLabel="Result type"
          value={type}
          onChange={(value) => setType(value as typeof type)}
          segments={[
            { value: "all", label: "All" },
            { value: "movie", label: "Movies" },
            { value: "tv", label: "TV shows" },
            { value: "person", label: "People" },
          ]}
        />
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
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Badge tone="contrast">
            {filteredResults.length} of {totalResults}
          </Badge>
          <Badge>Movies {movieCount}</Badge>
          <Badge>TV {tvCount}</Badge>
          <Badge>People {peopleCount}</Badge>
          <Typography level="body-xs" sx={{ ml: 0.5 }}>
            {sortBy === "popularity"
              ? "Sorted by popularity"
              : sortBy === "rating"
                ? "Sorted by rating"
                : sortBy === "release"
                  ? "Sorted by newest release"
                  : "Sorted alphabetically"}
          </Typography>
        </Box>
      )}

      {!filteredResults.length && !isLoading && (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description={
            isDeadEndSearch
              ? `Nothing in the catalogue is called "${decodedQuery}". If you were describing it rather than naming it, see below.`
              : `Nothing matched "${decodedQuery}" with these filters. Try a different spelling or clear the filters.`
          }
        />
      )}

      {isDeadEndSearch && (
        <AISuggestions
          heading="Did you mean one of these?"
          note={rescueNote}
          strategy={rescueStrategy}
          items={rescueResults}
          loading={rescueLoading}
          error={rescueError}
          onRetry={() => void runSearchRescue(decodedQuery)}
          emptyMessage="No idea what this one is, sorry. Try describing the plot or naming an actor."
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

      </Box>

      {filteredResults.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          whereTo={`/search/${query}`}
        />
      )}
    </Box>
  );
}

export default Search;
