import { Box, Button, Chip, Skeleton, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tmdbAPI } from "../../service/api/api";
import { tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { useTMDB } from "../../context/TMDB";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import BarChartIcon from "@mui/icons-material/BarChart";

interface SeasonRatings {
  seasonNumber: number;
  seasonName: string;
  episodes: {
    number: number;
    name: string;
    rating: number;
    airDate: string;
    overview: string;
  }[];
  average: number;
}

function ratingColor(r: number): string {
  if (r >= 8.5) return "#21d07a";
  if (r >= 7.5) return "#5ccb87";
  if (r >= 6.5) return "#d2d531";
  if (r >= 5.5) return "#e67e22";
  return "#e74c3c";
}

function ratingBg(r: number): string {
  if (r >= 8.5) return "rgba(33,208,122,0.12)";
  if (r >= 7.5) return "rgba(92,203,135,0.1)";
  if (r >= 6.5) return "rgba(210,213,49,0.1)";
  if (r >= 5.5) return "rgba(230,126,34,0.1)";
  return "rgba(231,76,60,0.1)";
}

function TVRatings() {
  const { tvId } = useParams();
  const navigate = useNavigate();
  const { tvSeries, tvSeriesDetailsData } = useTMDB();
  const [seasons, setSeasons] = useState<SeasonRatings[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredEpisode, setHoveredEpisode] = useState<{ s: number; e: number } | null>(null);

  const tvData = tvSeriesDetailsData?.data as tvDetails;

  useEffect(() => {
    if (tvId) tvSeries(tvId);
  }, [tvId]);

  useEffect(() => {
    if (!tvData?.seasons || !tvId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const seasonNums = tvData.seasons
          .filter((s) => s.season_number > 0)
          .map((s) => s.season_number);

        const results = await Promise.all(
          seasonNums.map((n) => tmdbAPI.get(`/tv/${tvId}/season/${n}`).then((r) => r.data as tvSeasonsDetails))
        );

        const parsed: SeasonRatings[] = results
          .filter((s) => s?.episodes?.length)
          .map((s) => {
            const eps = (s.episodes || [])
              .filter((e) => e.vote_count > 0)
              .map((e) => ({
                number: e.episode_number,
                name: e.name,
                rating: Math.round(e.vote_average * 10) / 10,
                airDate: e.air_date,
                overview: e.overview,
              }));
            const avg = eps.length
              ? Math.round((eps.reduce((a, e) => a + e.rating, 0) / eps.length) * 10) / 10
              : 0;
            return { seasonNumber: s.season_number, seasonName: s.name, episodes: eps, average: avg };
          });

        setSeasons(parsed);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [tvData, tvId]);

  const allRatings = seasons.flatMap((s) => s.episodes.map((e) => e.rating)).filter((r) => r > 0);
  const globalMax = allRatings.length ? Math.max(...allRatings) : 10;
  const globalMin = allRatings.length ? Math.min(...allRatings) : 0;

  return (
    <Box sx={{ minHeight: "100vh", paddingTop: "80px", pb: 8, width: "90%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Button
          variant="plain" color="neutral" startDecorator={<ArrowBackIcon />}
          onClick={() => navigate(`/tv/${tvId}`)}
        >
          Back
        </Button>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BarChartIcon sx={{ color: "rgb(255,216,77)" }} />
            <Typography level="h2" fontWeight={700}>Episode Ratings</Typography>
          </Box>
          {tvData && (
            <Typography level="body-md" textColor="neutral.400">
              {tvData.name} · {seasons.length} seasons · {allRatings.length} rated episodes
            </Typography>
          )}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap", alignItems: "center" }}>
        <Typography level="body-xs" textColor="neutral.400">Rating scale:</Typography>
        {[
          { label: "8.5+", color: "#21d07a" },
          { label: "7.5–8.4", color: "#5ccb87" },
          { label: "6.5–7.4", color: "#d2d531" },
          { label: "5.5–6.4", color: "#e67e22" },
          { label: "< 5.5", color: "#e74c3c" },
        ].map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
            <Typography level="body-xs">{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" width={160} height={28} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Array(8).fill(null).map((_, j) => (
                  <Skeleton key={j} variant="rectangular" width={72} height={80} sx={{ borderRadius: 8 }} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {seasons.map((season) => (
            <Box key={season.seasonNumber}>
              {/* Season header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography level="h4" fontWeight={700}>{season.seasonName}</Typography>
                {season.average > 0 && (
                  <Chip
                    startDecorator={<StarIcon sx={{ fontSize: 14, color: ratingColor(season.average) }} />}
                    size="sm" variant="soft"
                    sx={{ fontWeight: 700, color: ratingColor(season.average), background: ratingBg(season.average) }}
                  >
                    avg {season.average}
                  </Chip>
                )}
                <Typography level="body-xs" textColor="neutral.400">
                  {season.episodes.length} episodes
                </Typography>
              </Box>

              {/* Bar chart row */}
              <Box
                sx={{
                  display: "flex", alignItems: "flex-end", gap: 0.75,
                  overflowX: "auto", pb: 1,
                  "&::-webkit-scrollbar": { height: 4 },
                  "&::-webkit-scrollbar-thumb": { borderRadius: 4, background: "rgba(255,255,255,0.15)" },
                }}
              >
                {season.episodes.length === 0 && (
                  <Typography level="body-sm" textColor="neutral.500">No ratings yet</Typography>
                )}
                {season.episodes.map((ep) => {
                  const isHovered = hoveredEpisode?.s === season.seasonNumber && hoveredEpisode?.e === ep.number;
                  const barHeight = ep.rating > 0
                    ? 30 + ((ep.rating - globalMin) / Math.max(globalMax - globalMin, 1)) * 70
                    : 20;
                  const color = ratingColor(ep.rating);

                  return (
                    <Tooltip
                      key={ep.number}
                      placement="top"
                      title={
                        <Box sx={{ maxWidth: 200 }}>
                          <Typography level="body-sm" fontWeight={700}>{ep.name}</Typography>
                          <Typography level="body-xs" textColor="neutral.300">
                            Episode {ep.number} · {ep.rating > 0 ? ep.rating : "N/A"}
                          </Typography>
                          {ep.overview && (
                            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
                              {ep.overview.slice(0, 80)}{ep.overview.length > 80 ? "…" : ""}
                            </Typography>
                          )}
                        </Box>
                      }
                    >
                      <Box
                        onClick={() => navigate(`/tv/${tvId}/${season.seasonNumber}/${ep.number}/watch`)}
                        onMouseEnter={() => setHoveredEpisode({ s: season.seasonNumber, e: ep.number })}
                        onMouseLeave={() => setHoveredEpisode(null)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          transition: "transform 0.1s",
                          transform: isHovered ? "translateY(-3px)" : "none",
                          minWidth: 52,
                        }}
                      >
                        {/* Rating number above bar */}
                        <Typography
                          level="body-xs"
                          sx={{
                            fontWeight: 700, color,
                            opacity: isHovered ? 1 : 0.8,
                            fontSize: 11,
                          }}
                        >
                          {ep.rating > 0 ? ep.rating : "—"}
                        </Typography>

                        {/* Bar */}
                        <Box
                          sx={{
                            width: 44,
                            height: `${barHeight}px`,
                            borderRadius: "6px 6px 3px 3px",
                            background: isHovered
                              ? color
                              : `${color}99`,
                            border: `1px solid ${color}${isHovered ? "ff" : "44"}`,
                            transition: "all 0.15s",
                            boxShadow: isHovered ? `0 0 12px ${color}55` : "none",
                          }}
                        />

                        {/* Episode number below */}
                        <Typography
                          level="body-xs"
                          sx={{ fontSize: 10, color: "neutral.400", fontWeight: isHovered ? 700 : 400 }}
                        >
                          {ep.number}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>

              {/* Season average line */}
              {season.average > 0 && (
                <Box
                  sx={{
                    mt: 0.5, height: 1,
                    background: `linear-gradient(to right, ${ratingColor(season.average)}44, transparent)`,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default TVRatings;
