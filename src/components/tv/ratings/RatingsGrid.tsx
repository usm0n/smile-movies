import { Box, Tooltip, Typography } from "@mui/joy";
import { useState } from "react";
import {
  CELL_METRICS,
  CellSize,
  EpisodePoint,
  Progress,
  ProgressMode,
  SeasonData,
  TIER_COLORS,
  formatAirDate,
  formatVotes,
  getTier,
  progressState,
  ratingOf,
} from "./ratingsShared";

const SURFACE = "#0a0a0a";

/**
 * The heatmap: one column per season, one row per episode number.
 *
 * Three things layer on top of the colour: the viewer's position in the run
 * (ring on the current episode, dashed ring on the next), a spoiler mode that
 * blanks everything they haven't reached, and a column focus that dims the
 * other seasons so a long run can be read one season at a time.
 */
function RatingsGrid({
  seasons,
  cellSize,
  progress,
  nextUp,
  progressMode,
  focusedSeason,
  onFocusSeason,
  onSelect,
}: {
  seasons: SeasonData[];
  cellSize: CellSize;
  progress: Progress;
  nextUp: Progress;
  progressMode: ProgressMode;
  focusedSeason: number | null;
  onFocusSeason: (season: number | null) => void;
  onSelect: (point: EpisodePoint) => void;
}) {
  const [hovered, setHovered] = useState<{ season: number; row: number } | null>(null);
  const metric = CELL_METRICS[cellSize];
  const maxEpisodes = seasons.reduce(
    (highest, season) => Math.max(highest, season.order.length),
    0,
  );

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "12px",
        backgroundColor: SURFACE,
        p: { xs: 1.5, sm: 2 },
        overflowX: "auto",
      }}
    >
      <Box sx={{ display: "inline-block", minWidth: "100%" }}>
        {/* Season header row */}
        <Box sx={{ display: "flex", gap: `${metric.gap}px`, mb: `${metric.gap}px` }}>
          <Box
            sx={{
              width: metric.label,
              flexShrink: 0,
              position: "sticky",
              left: 0,
              zIndex: 3,
              backgroundColor: SURFACE,
            }}
          />
          {seasons.map((season) => {
            const dimmed = focusedSeason !== null && focusedSeason !== season.seasonNumber;
            const active =
              focusedSeason === season.seasonNumber || hovered?.season === season.seasonNumber;
            return (
              <Box
                key={season.seasonNumber}
                component="button"
                type="button"
                onClick={() =>
                  onFocusSeason(
                    focusedSeason === season.seasonNumber ? null : season.seasonNumber,
                  )
                }
                title={`${season.order.length} episodes · avg ${
                  season.average > 0 ? season.average.toFixed(1) : "—"
                }`}
                sx={{
                  width: metric.width,
                  flexShrink: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  p: 0,
                  opacity: dimmed ? 0.35 : 1,
                  transition: "opacity 120ms ease, color 120ms ease",
                  fontFamily: "body",
                  fontSize: 11,
                  fontWeight: 700,
                  color: active ? "#ffffff" : "rgba(255,255,255,0.65)",
                }}
              >
                S{season.seasonNumber}
              </Box>
            );
          })}
        </Box>

        {/* Episode rows */}
        {Array.from({ length: maxEpisodes }, (_, index) => index).map((row) => (
          <Box
            key={row}
            sx={{
              display: "flex",
              gap: `${metric.gap}px`,
              mb: `${metric.gap}px`,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: metric.label,
                flexShrink: 0,
                textAlign: "right",
                pr: "6px",
                position: "sticky",
                left: 0,
                zIndex: 3,
                backgroundColor: SURFACE,
              }}
            >
              <Typography
                level="body-xs"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  color:
                    hovered?.row === row ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                  transition: "color 120ms ease",
                }}
              >
                E{row + 1}
              </Typography>
            </Box>

            {seasons.map((season) => {
              const number = season.order[row];
              const episode = number ? season.episodes.get(number) : undefined;
              const rating = ratingOf(episode);
              const color = TIER_COLORS[getTier(rating)];
              const state = episode
                ? progressState(progress, nextUp, season.seasonNumber, number)
                : "none";
              const ahead = state === "ahead" || state === "next";
              const hidden = progressMode === "spoiler" && ahead;
              const dimmed =
                (progressMode === "dim" && ahead) ||
                (focusedSeason !== null && focusedSeason !== season.seasonNumber);
              const isHovered =
                hovered?.season === season.seasonNumber && hovered?.row === row;

              const cell = (
                <Box
                  onClick={() =>
                    episode &&
                    onSelect({
                      season: season.seasonNumber,
                      episode: number,
                      rating,
                      title: episode.title || `Episode ${number}`,
                      votes: episode.rating?.voteCount ?? 0,
                      episodeData: episode,
                    })
                  }
                  onMouseEnter={() =>
                    episode && setHovered({ season: season.seasonNumber, row })
                  }
                  onMouseLeave={() => setHovered(null)}
                  sx={{
                    width: metric.width,
                    height: metric.height,
                    flexShrink: 0,
                    borderRadius: "5px",
                    background: episode
                      ? hidden
                        ? "rgba(255,255,255,0.07)"
                        : color.bg
                      : "rgba(255,255,255,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: episode ? "pointer" : "default",
                    opacity: dimmed ? 0.4 : 1,
                    transition: "transform 0.12s, box-shadow 0.12s, opacity 0.12s",
                    transform: isHovered ? "scale(1.09)" : "scale(1)",
                    boxShadow: isHovered ? `0 0 12px ${color.border}66` : "none",
                    outline:
                      state === "current"
                        ? "2px solid #ffffff"
                        : state === "next"
                          ? "1px dashed rgba(255,255,255,0.55)"
                          : "none",
                    outlineOffset: state === "current" ? "1px" : "0px",
                    zIndex: isHovered ? 2 : 1,
                    position: "relative",
                  }}
                >
                  {episode ? (
                    <Typography
                      sx={{
                        fontSize: metric.font,
                        fontWeight: 600,
                        color: hidden ? "rgba(255,255,255,0.45)" : color.fg,
                        lineHeight: 1,
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {hidden ? "•" : rating > 0 ? rating.toFixed(1) : "?"}
                    </Typography>
                  ) : null}
                </Box>
              );

              if (!episode) {
                return <Box key={season.seasonNumber}>{cell}</Box>;
              }

              return (
                <Tooltip
                  key={season.seasonNumber}
                  placement="top"
                  disableInteractive
                  variant="outlined"
                  title={
                    <Box sx={{ maxWidth: 240 }}>
                      <Typography level="body-sm" fontWeight={700}>
                        {hidden
                          ? "Hidden — you haven't got here yet"
                          : episode.title || `Episode ${number}`}
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.300">
                        S{season.seasonNumber}:E{number}
                        {hidden
                          ? ""
                          : rating > 0
                            ? ` · ⭐ ${rating.toFixed(1)}`
                            : " · No rating"}
                        {!hidden && episode.rating?.voteCount
                          ? ` · ${formatVotes(episode.rating.voteCount)} votes`
                          : ""}
                      </Typography>
                      {!hidden && formatAirDate(episode.releaseDate) && (
                        <Typography level="body-xs" textColor="neutral.500">
                          {formatAirDate(episode.releaseDate)}
                        </Typography>
                      )}
                      {!hidden && episode.plot && (
                        <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
                          {episode.plot.slice(0, 110)}
                          {episode.plot.length > 110 ? "…" : ""}
                        </Typography>
                      )}
                      {state === "current" && (
                        <Typography level="body-xs" sx={{ mt: 0.5, color: "#ffffff" }}>
                          ● You're here
                        </Typography>
                      )}
                    </Box>
                  }
                >
                  {cell}
                </Tooltip>
              );
            })}
          </Box>
        ))}

        {/* Season averages */}
        <Box
          sx={{
            display: "flex",
            gap: `${metric.gap}px`,
            mt: "10px",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: metric.label,
              flexShrink: 0,
              textAlign: "right",
              pr: "6px",
              position: "sticky",
              left: 0,
              zIndex: 3,
              backgroundColor: SURFACE,
            }}
          >
            <Typography
              level="body-xs"
              sx={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}
            >
              AVG
            </Typography>
          </Box>
          {seasons.map((season) => {
            const color = TIER_COLORS[getTier(season.average)];
            const dimmed = focusedSeason !== null && focusedSeason !== season.seasonNumber;
            return (
              <Tooltip
                key={season.seasonNumber}
                placement="bottom"
                variant="outlined"
                title={`Season ${season.seasonNumber} · ${season.ratedCount}/${season.order.length} rated`}
              >
                <Box
                  sx={{
                    width: metric.width,
                    height: metric.height,
                    flexShrink: 0,
                    borderRadius: "6px",
                    background: color.bg,
                    border: `1px solid ${color.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: dimmed ? 0.4 : 1,
                    transition: "opacity 120ms ease",
                  }}
                >
                  <Typography
                    sx={{ fontSize: metric.font - 1, fontWeight: 800, color: color.fg }}
                  >
                    {season.average > 0 ? season.average.toFixed(1) : "—"}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default RatingsGrid;
