import { Box, Skeleton, Tooltip, Typography, Button, Chip, LinearProgress } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tvDetails } from "../../tmdb-res";
import { useTMDB } from "../../context/TMDB";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import {
  resolveImdbId,
  fetchAllSeasonsBatched,
  ImdbEpisode,
} from "../../service/api/imdb/imdb.api.service";

// ─── Colour system ────────────────────────────────────────────────────────────
type Tier = "absolute" | "awesome" | "great" | "good" | "regular" | "bad" | "garbage" | "none";

function getTier(r: number): Tier {
  if (r <= 0) return "none";
  if (r >= 9.5) return "absolute";
  if (r >= 9.0) return "awesome";
  if (r >= 8.0) return "great";
  if (r >= 7.0) return "good";
  if (r >= 6.0) return "regular";
  if (r >= 5.0) return "bad";
  return "garbage";
}

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  absolute: { bg: "rgb(29, 161, 242)",  text: "#a8d8ff", border: "#2196f3" },
  awesome:  { bg: "rgb(24, 106, 59)",   text: "#6ee6a8", border: "#21d07a" },
  great:    { bg: "rgb(40, 180, 99)",   text: "#8ce68c", border: "#4caf50" },
  good:     { bg: "rgb(244, 208, 63)",  text: "#f5e25a", border: "#d2d531" },
  regular:  { bg: "rgb(243, 156, 18)",  text: "#ffb566", border: "#e67e22" },
  bad:      { bg: "rgb(231, 76, 60)",   text: "#ff8080", border: "#e74c3c" },
  garbage:  { bg: "rgb(99, 57, 116)",   text: "#d0a0f0", border: "#9b59b6" },
  none:     { bg: "rgba(255,255,255,0.06)", text: "#555577", border: "transparent" },
};

const LEGEND: { label: string; tier: Tier; range: string }[] = [
  { label: "Absolute Cinema", tier: "absolute", range: "≥9.5" },
  { label: "Awesome",         tier: "awesome",  range: "9.0–9.4" },
  { label: "Great",           tier: "great",    range: "8.0–8.9" },
  { label: "Good",            tier: "good",     range: "7.0–7.9" },
  { label: "Regular",         tier: "regular",  range: "6.0–6.9" },
  { label: "Bad",             tier: "bad",      range: "5.0–5.9" },
  { label: "Garbage",         tier: "garbage",  range: "<5.0" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface SeasonData {
  seasonNumber: number;
  episodes: Map<number, ImdbEpisode>;
  average: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
function TVRatings() {
  const { tvId } = useParams();
  const navigate = useNavigate();
  const { tvSeries, tvSeriesDetailsData } = useTMDB();

  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ s: number; e: number } | null>(null);

  const tvData = tvSeriesDetailsData?.data as tvDetails;

  useEffect(() => {
    if (tvId) tvSeries(tvId);
  }, [tvId]);

  useEffect(() => {
    if (!tvData?.seasons || !tvId) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      setSeasons([]);

      try {
        const imdbId = await resolveImdbId(tvId, "tv");
        if (!imdbId) {
          setError("Could not find IMDb ID for this show.");
          return;
        }

        const seasonNums = tvData.seasons
          .filter((s) => s.season_number > 0)
          .map((s) => s.season_number);

        setProgress({ loaded: 0, total: seasonNums.length });

        const seasonMap = await fetchAllSeasonsBatched(
          imdbId,
          seasonNums,
          (loaded, total) => setProgress({ loaded, total })
        );

        const parsed: SeasonData[] = seasonNums
          .map((n) => {
            const eps = seasonMap.get(n) ?? [];
            const epMap = new Map<number, ImdbEpisode>();
            eps.forEach((e) => epMap.set(e.episodeNumber, e));

            const rated = eps.filter((e) => (e.rating?.aggregateRating ?? 0) > 0);
            const avg =
              rated.length > 0
                ? Math.round(
                    (rated.reduce((a, e) => a + (e.rating?.aggregateRating ?? 0), 0) /
                      rated.length) * 10
                  ) / 10
                : 0;

            return { seasonNumber: n, episodes: epMap, average: avg };
          })
          .filter((s) => s.episodes.size > 0);

        setSeasons(parsed);
      } catch {
        setError("Failed to load IMDb ratings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tvData, tvId]);

  const maxEpisodes = seasons.reduce((m, s) => Math.max(m, s.episodes.size), 0);
  const progressPct = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;

  return (
    <Box sx={{ minHeight: "100vh", paddingTop: "80px", pb: 8, width: "95%", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button variant="plain" color="neutral" startDecorator={<ArrowBackIcon />} onClick={() => navigate(`/tv/${tvId}`)}>
          Back
        </Button>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StarIcon sx={{ color: "#F5C518" }} />
            <Typography level="h2" fontWeight={700}>IMDb Episode Ratings</Typography>
          </Box>
          {tvData && (
            <Typography level="body-md" textColor="neutral.400">
              {tvData.name} · {seasons.length > 0 ? `${seasons.length} seasons` : loading ? "Loading…" : "0 seasons"}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Legend ── */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap", alignItems: "center", p: 1.5, borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {LEGEND.map((item) => {
          const c = TIER_COLORS[item.tier];
          return (
            <Box key={item.tier} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 11, height: 11, borderRadius: "3px", background: c.bg, flexShrink: 0 }} />
              <Typography level="body-xs" sx={{ color: c.text, whiteSpace: "nowrap" }}>{item.label}</Typography>
              <Typography level="body-xs" textColor="neutral.500">{item.range}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Error ── */}
      {error && (
        <Typography level="body-md" textColor="danger.400" sx={{ mb: 3 }}>{error}</Typography>
      )}

      {/* ── Loading with progress ── */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          {progress.total > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography level="body-xs" textColor="neutral.400">
                  Loading seasons… {progress.loaded}/{progress.total}
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
              {Array(8).fill(null).map((_, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1 }}>
                  <Skeleton variant="rectangular" width={36} height={33} sx={{ borderRadius: "5px", flexShrink: 0 }} />
                  {Array(5).fill(null).map((_, j) => (
                    <Skeleton key={j} variant="rectangular" width={50} height={33} sx={{ borderRadius: "5px" }} />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Grid ── */}
      {!loading && !error && seasons.length > 0 && (
        <Box sx={{ overflowX: "auto", pb: 2 }}>
          <Box sx={{ display: "inline-block", minWidth: "100%" }}>

            {/* Season header row */}
            <Box sx={{ display: "flex", gap: "8px", mb: "4px", pl: "48px" }}>
              {seasons.map((s) => (
                <Box key={s.seasonNumber} sx={{ width: 50, flexShrink: 0, textAlign: "center" }}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                    S{s.seasonNumber}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Episode rows */}
            {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((epNum) => (
              <Box key={epNum} sx={{ display: "flex", gap: "8px", mb: "4px", alignItems: "center" }}>
                <Box sx={{ width: 40, flexShrink: 0, textAlign: "right", pr: "4px" }}>
                  <Typography level="body-xs" sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                    E{epNum}
                  </Typography>
                </Box>

                {seasons.map((s) => {
                  const ep = s.episodes.get(epNum);
                  const rating = ep?.rating?.aggregateRating ?? 0;
                  const tier = getTier(rating);
                  const c = TIER_COLORS[tier];
                  const isHovered = hoveredCell?.s === s.seasonNumber && hoveredCell?.e === epNum;

                  return (
                    <Tooltip
                      key={s.seasonNumber}
                      placement="top"
                      disableInteractive
                      title={
                        ep ? (
                          <Box sx={{ maxWidth: 220 }}>
                            <Typography level="body-sm" fontWeight={700}>{ep.title || `Episode ${epNum}`}</Typography>
                            <Typography level="body-xs" textColor="neutral.300">
                              S{s.seasonNumber}:E{epNum}{rating > 0 ? ` · ⭐ ${rating.toFixed(1)}` : " · No rating"}
                            </Typography>
                            {ep.rating?.voteCount ? (
                              <Typography level="body-xs" textColor="neutral.400">
                                {ep.rating.voteCount.toLocaleString()} votes
                              </Typography>
                            ) : null}
                            {ep.plot && (
                              <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
                                {ep.plot.slice(0, 90)}{ep.plot.length > 90 ? "…" : ""}
                              </Typography>
                            )}
                          </Box>
                        ) : null
                      }
                    >
                      <Box
                        onClick={() => ep ? navigate(`/tv/${tvId}/${s.seasonNumber}/${epNum}/watch`) : undefined}
                        onMouseEnter={() => ep && setHoveredCell({ s: s.seasonNumber, e: epNum })}
                        onMouseLeave={() => setHoveredCell(null)}
                        sx={{
                          width: 50, height: 33, flexShrink: 0, borderRadius: "5px",
                          background: ep ? c.bg : "rgba(255,255,255,0.03)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: ep ? "pointer" : "default",
                          transition: "all 0.12s",
                          transform: isHovered ? "scale(1.08)" : "scale(1)",
                          boxShadow: isHovered ? `0 0 10px ${c.border}66` : "none",
                          zIndex: isHovered ? 2 : 1,
                          position: "relative",
                        }}
                      >
                        {ep && rating > 0 ? (
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: rating >= 9.0 ? "#fff" : "#000", lineHeight: 1, letterSpacing: "-0.3px" }}>
                            {rating.toFixed(1)}
                          </Typography>
                        ) : ep ? (
                          <Typography sx={{ fontSize: 13, color: "#888" }}>?</Typography>
                        ) : null}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            ))}

            {/* Season averages row */}
            <Box sx={{ display: "flex", gap: "8px", mt: "8px", pl: "48px", alignItems: "center" }}>
              {seasons.map((s) => {
                const tier = getTier(s.average);
                const c = TIER_COLORS[tier];
                return (
                  <Box key={s.seasonNumber} sx={{ width: 50, flexShrink: 0, textAlign: "center" }}>
                    <Chip
                      size="sm"
                      sx={{
                        fontSize: 11, fontWeight: 800,
                        color: s.average >= 9.0 ? "#fff" : "#000",
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        minWidth: "100%", borderRadius: "6px",
                        "--Chip-paddingInline": "4px",
                      }}
                    >
                      {s.average > 0 ? s.average.toFixed(1) : "—"}
                    </Chip>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ pl: "48px", mt: "2px" }}>
              <Typography level="body-xs" textColor="neutral.500" sx={{ fontSize: 10 }}>AVG.</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {!loading && !error && seasons.length === 0 && (
        <Typography level="body-md" textColor="neutral.500">No episode ratings found for this show.</Typography>
      )}
    </Box>
  );
}

export default TVRatings;
