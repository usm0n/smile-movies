import { Box, LinearProgress, Skeleton, Typography } from "@mui/joy";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tvDetails } from "../../tmdb-res";
import { useTMDB } from "../../context/TMDB";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import Container from "../../utilities/Container";
import Button from "../../components/ui/Button";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { toast } from "../../components/ui/toast";
import {
  ImdbEpisode,
  fetchAllSeasonsBatched,
  fetchImdbTitle,
  resolveImdbId,
} from "../../service/api/imdb/imdb.api.service";
import RatingsHero from "../../components/tv/ratings/RatingsHero";
import RatingsGrid from "../../components/tv/ratings/RatingsGrid";
import RatingsChart from "../../components/tv/ratings/RatingsChart";
import RatingsStats from "../../components/tv/ratings/RatingsStats";
import EpisodeDialog from "../../components/tv/ratings/EpisodeDialog";
import {
  CellSize,
  EpisodePoint,
  LEGEND,
  Progress,
  ProgressMode,
  SeasonData,
  TIER_COLORS,
  buildStats,
  progressState,
} from "../../components/tv/ratings/ratingsShared";
import {
  canShareImage,
  downloadBlob,
  renderRatingsImage,
  slugify,
} from "../../components/tv/ratings/ratingsImage";

type View = "grid" | "trend";

/** Can this browser put a PNG in the native share sheet? Probe once. */
const probeFileShare = () => {
  try {
    const file = new File([new Blob()], "probe.png", { type: "image/png" });
    return canShareImage(file);
  } catch {
    return false;
  }
};

function TVRatings() {
  const { tvId } = useParams();
  const navigate = useNavigate();
  const { tvSeries, tvSeriesDetailsData } = useTMDB();
  const { myselfData, upsertRecentlyWatched, upsertRecentlyWatchedData } = useUsers();

  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressCount, setProgressCount] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [imdbRating, setImdbRating] = useState<number | null>(null);

  const [view, setView] = useState<View>("grid");
  const [cellSize, setCellSize] = useState<CellSize>("normal");
  const [progressMode, setProgressMode] = useState<ProgressMode>("dim");
  const [focusedSeason, setFocusedSeason] = useState<number | null>(null);
  const [selected, setSelected] = useState<EpisodePoint | null>(null);
  const [imageBusy, setImageBusy] = useState(false);

  const tvData = tvSeriesDetailsData?.data as tvDetails | undefined;
  const canShareFiles = useMemo(probeFileShare, []);

  useEffect(() => {
    if (tvId) tvSeries(tvId);
  }, [tvId]);

  const loadRatings = useCallback(async () => {
    if (!tvData?.seasons || !tvId) return;

    setLoading(true);
    setError(null);
    setSeasons([]);

    try {
      const imdbId = await resolveImdbId(tvId, "tv");
      if (!imdbId) {
        setError("Could not find IMDb ID for this show.");
        return;
      }

      // The series' own rating is one cheap call and gives the grid something
      // to be compared against in the header.
      void fetchImdbTitle(imdbId).then((title) =>
        setImdbRating(title?.rating?.aggregateRating ?? null),
      );

      const seasonNumbers = tvData.seasons
        .filter((season) => season.season_number > 0)
        .map((season) => season.season_number);

      setProgressCount({ loaded: 0, total: seasonNumbers.length });

      const seasonMap = await fetchAllSeasonsBatched(
        imdbId,
        seasonNumbers,
        (loaded, total) => setProgressCount({ loaded, total }),
      );

      const parsed: SeasonData[] = seasonNumbers
        .map((number) => {
          const episodes = seasonMap.get(number) ?? [];
          const byNumber = new Map<number, ImdbEpisode>();
          episodes.forEach((episode) => byNumber.set(episode.episodeNumber, episode));

          const rated = episodes.filter(
            (episode) => (episode.rating?.aggregateRating ?? 0) > 0,
          );
          const average =
            rated.length > 0
              ? Math.round(
                  (rated.reduce(
                    (sum, episode) => sum + (episode.rating?.aggregateRating ?? 0),
                    0,
                  ) /
                    rated.length) *
                    10,
                ) / 10
              : 0;

          return {
            seasonNumber: number,
            episodes: byNumber,
            order: [...byNumber.keys()].sort((a, b) => a - b),
            average,
            ratedCount: rated.length,
          };
        })
        .filter((season) => season.episodes.size > 0);

      setSeasons(parsed);
    } catch {
      setError("Failed to load IMDb ratings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [tvData, tvId]);

  useEffect(() => {
    void loadRatings();
  }, [loadRatings]);

  useEffect(() => {
    if (!tvData?.name) return;
    const previous = document.title;
    document.title = `${tvData.name} · Episode ratings`;
    return () => {
      document.title = previous;
    };
  }, [tvData?.name]);

  // ── The viewer's place in the run ──────────────────────────────────────────
  const user = myselfData?.data as User | undefined;
  const recentItem = user?.recentlyWatched?.find(
    (item) => item.id === String(tvId) && item.type === "tv",
  );
  const progress: Progress = useMemo(
    () =>
      recentItem?.currentSeason && recentItem?.currentEpisode
        ? { season: recentItem.currentSeason, episode: recentItem.currentEpisode }
        : null,
    [recentItem?.currentSeason, recentItem?.currentEpisode],
  );
  const storedNext: Progress = useMemo(
    () =>
      recentItem?.nextSeason && recentItem?.nextEpisode
        ? { season: recentItem.nextSeason, episode: recentItem.nextEpisode }
        : null,
    [recentItem?.nextSeason, recentItem?.nextEpisode],
  );

  /** The episode that follows `season`/`episode` in air order, if there is one. */
  const followingEpisode = useCallback(
    (season: number, episode: number): Progress => {
      const seasonIndex = seasons.findIndex((entry) => entry.seasonNumber === season);
      if (seasonIndex < 0) return null;

      const order = seasons[seasonIndex].order;
      const position = order.indexOf(episode);
      if (position >= 0 && position < order.length - 1) {
        return { season, episode: order[position + 1] };
      }

      const nextSeason = seasons[seasonIndex + 1];
      if (!nextSeason?.order.length) return null;
      return { season: nextSeason.seasonNumber, episode: nextSeason.order[0] };
    },
    [seasons],
  );

  const nextUp: Progress =
    storedNext ||
    (progress ? followingEpisode(progress.season, progress.episode) : null);

  const currentEpisodeTitle = useMemo(() => {
    const target = progress || nextUp;
    if (!target) return undefined;
    const season = seasons.find((entry) => entry.seasonNumber === target.season);
    return season?.episodes.get(target.episode)?.title;
  }, [progress, nextUp, seasons]);

  // Nothing to dim or hide until we know where they are — and once the
  // account loads and we do, "dim ahead" is the useful default.
  const hasProgress = Boolean(progress);
  useEffect(() => {
    setProgressMode(hasProgress ? "dim" : "off");
  }, [hasProgress]);

  const stats = useMemo(() => buildStats(seasons), [seasons]);

  // ── Share and export ───────────────────────────────────────────────────────
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const share = async () => {
    const text = tvData?.name
      ? `${tvData.name} — every episode rated${
          stats.average ? ` (avg ${stats.average.toFixed(1)})` : ""
        }`
      : "Episode ratings";
    try {
      if (navigator.share) {
        await navigator.share({ title: tvData?.name, text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      // A dismissed share sheet lands here too — nothing worth reporting.
    }
  };

  const buildImage = async () => {
    const firstYear = tvData?.first_air_date?.slice(0, 4);
    const lastYear = tvData?.last_air_date?.slice(0, 4);
    const years =
      firstYear && lastYear && firstYear !== lastYear
        ? `${firstYear}–${tvData?.in_production ? "present" : lastYear}`
        : firstYear || "";

    return renderRatingsImage({
      title: tvData?.name || "Series",
      meta: [
        years,
        `${seasons.length} season${seasons.length === 1 ? "" : "s"}`,
        `${stats.totalCount} episodes`,
        tvData?.genres?.slice(0, 2).map((genre) => genre.name).join(" · "),
      ]
        .filter(Boolean)
        .join("  ·  "),
      posterUrl: tvData?.poster_path
        ? `https://image.tmdb.org/t/p/w342${tvData.poster_path}`
        : null,
      seasons,
      stats,
      imdbRating,
      progress,
      nextUp,
      progressMode,
      footer: typeof window !== "undefined" ? window.location.host : "smile movies",
    });
  };

  const fileName = `${slugify(tvData?.name || "series")}-episode-ratings.png`;

  const saveImage = async () => {
    setImageBusy(true);
    try {
      downloadBlob(await buildImage(), fileName);
      toast.success("Saved as image");
    } catch {
      toast.error("Couldn't render the image");
    } finally {
      setImageBusy(false);
    }
  };

  const shareImage = async () => {
    setImageBusy(true);
    try {
      const blob = await buildImage();
      const file = new File([blob], fileName, { type: "image/png" });
      if (canShareImage(file)) {
        await navigator.share({
          files: [file],
          title: tvData?.name,
          text: `${tvData?.name} — every episode rated`,
        });
        return;
      }
      downloadBlob(blob, fileName);
      toast.success("Saved as image");
    } catch {
      // Dismissing the sheet throws AbortError; don't shout about it.
    } finally {
      setImageBusy(false);
    }
  };

  const markCurrent = async (point: EpisodePoint) => {
    const following = followingEpisode(point.season, point.episode);
    await upsertRecentlyWatched(
      "tv",
      String(tvId),
      tvData?.poster_path || "",
      tvData?.name || "",
      0,
      0,
      point.season,
      point.episode,
      following?.season ?? 0,
      following?.episode ?? 0,
    );
    setSelected(null);
    toast.success(`Marked S${point.season}:E${point.episode} as where you are`);
  };

  const progressPct =
    progressCount.total > 0 ? (progressCount.loaded / progressCount.total) * 100 : 0;

  return (
    <Box sx={{ pt: "calc(var(--sm-nav-height) + 24px)", pb: 10 }}>
      <Container gap={3}>
        <RatingsHero
          tvId={tvId!}
          tv={tvData}
          imdbRating={imdbRating}
          stats={stats}
          seasonCount={seasons.length}
          progress={progress}
          nextUp={nextUp}
          currentEpisodeTitle={currentEpisodeTitle}
          onShare={share}
          onSaveImage={saveImage}
          onShareImage={shareImage}
          imageBusy={imageBusy}
          canShareFiles={canShareFiles}
        />

        {/* ── Controls ── */}
        {!loading && !error && seasons.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <SegmentedControl
                ariaLabel="View"
                size="sm"
                value={view}
                onChange={(value) => setView(value as View)}
                segments={[
                  { value: "grid", label: "Grid" },
                  { value: "trend", label: "Trend" },
                ]}
              />
              {view === "grid" && (
                <SegmentedControl
                  ariaLabel="Cell size"
                  size="sm"
                  value={cellSize}
                  onChange={(value) => setCellSize(value as CellSize)}
                  segments={[
                    { value: "compact", label: "S" },
                    { value: "normal", label: "M" },
                    { value: "large", label: "L" },
                  ]}
                />
              )}
              {progress && (
                <SegmentedControl
                  ariaLabel="My progress"
                  size="sm"
                  value={progressMode}
                  onChange={(value) => setProgressMode(value as ProgressMode)}
                  segments={[
                    { value: "off", label: "Show all" },
                    { value: "dim", label: "Dim ahead" },
                    { value: "spoiler", label: "Spoiler-free" },
                  ]}
                />
              )}
            </Box>

            {focusedSeason !== null && (
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setFocusedSeason(null)}
              >
                Clear season {focusedSeason} focus
              </Button>
            )}
          </Box>
        )}

        {/* ── Legend ── */}
        {!loading && !error && seasons.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
              p: 1.5,
              borderRadius: "8px",
              backgroundColor: "background.surface",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
            }}
          >
            {LEGEND.map((item) => {
              const color = TIER_COLORS[item.tier];
              return (
                <Box
                  key={item.tier}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 11,
                      height: 11,
                      borderRadius: "3px",
                      background: color.bg,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    level="body-xs"
                    sx={{ color: color.text, whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.500">
                    {item.range}
                  </Typography>
                </Box>
              );
            })}
            {progress && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: "3px",
                    border: "2px solid #fff",
                    flexShrink: 0,
                  }}
                />
                <Typography level="body-xs" textColor="neutral.300">
                  You're here
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              p: 2,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "danger.outlinedBorder",
              backgroundColor: "rgba(229,72,77,0.08)",
            }}
          >
            <Typography level="body-sm" textColor="danger.300">
              {error}
            </Typography>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => void loadRatings()}
            >
              Try again
            </Button>
          </Box>
        )}

        {/* ── Loading ── */}
        {loading && (
          <Box>
            {progressCount.total > 0 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography level="body-xs" textColor="neutral.400">
                    Loading seasons… {progressCount.loaded}/{progressCount.total}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.400">
                    {Math.round(progressPct)}%
                  </Typography>
                </Box>
                <LinearProgress
                  determinate
                  value={progressPct}
                  sx={{ mb: 2, "--LinearProgress-thickness": "3px", color: "#F5C518" }}
                />
              </>
            )}
            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ display: "inline-grid", gap: 1 }}>
                {Array(8)
                  .fill(null)
                  .map((_, row) => (
                    <Box key={row} sx={{ display: "flex", gap: 1 }}>
                      <Skeleton
                        variant="rectangular"
                        width={36}
                        height={33}
                        sx={{ borderRadius: "5px", flexShrink: 0 }}
                      />
                      {Array(5)
                        .fill(null)
                        .map((__, column) => (
                          <Skeleton
                            key={column}
                            variant="rectangular"
                            width={50}
                            height={33}
                            sx={{ borderRadius: "5px" }}
                          />
                        ))}
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── The grid or the trend line ── */}
        {!loading && !error && seasons.length > 0 && (
          <>
            {view === "grid" ? (
              <RatingsGrid
                seasons={seasons}
                cellSize={cellSize}
                progress={progress}
                nextUp={nextUp}
                progressMode={progressMode}
                focusedSeason={focusedSeason}
                onFocusSeason={setFocusedSeason}
                onSelect={setSelected}
              />
            ) : (
              <RatingsChart
                seasons={seasons}
                progress={progress}
                nextUp={nextUp}
                progressMode={progressMode}
                focusedSeason={focusedSeason}
                onSelect={setSelected}
              />
            )}

            <RatingsStats stats={stats} onSelect={setSelected} />
          </>
        )}

        {!loading && !error && seasons.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography level="body-md" textColor="neutral.500">
              No episode ratings found for this show.
            </Typography>
            <Button
              variant="outlined"
              color="neutral"
              sx={{ mt: 2 }}
              onClick={() => navigate(`/tv/${tvId}`)}
            >
              Back to the show
            </Button>
          </Box>
        )}
      </Container>

      <EpisodeDialog
        point={selected}
        state={
          selected
            ? progressState(progress, nextUp, selected.season, selected.episode)
            : "none"
        }
        tvId={tvId!}
        onClose={() => setSelected(null)}
        onMarkCurrent={user ? (point) => void markCurrent(point) : undefined}
        markBusy={Boolean(upsertRecentlyWatchedData?.isLoading)}
      />
    </Box>
  );
}

export default TVRatings;
