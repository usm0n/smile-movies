import { Box, Typography } from "@mui/joy";
import { useMemo } from "react";
import {
  EpisodePoint,
  Progress,
  ProgressMode,
  SeasonData,
  TIER_COLORS,
  flattenEpisodes,
  getTier,
  progressState,
} from "./ratingsShared";

/**
 * The same data as the grid, read along the time axis instead: every episode
 * in air order, so a mid-season slump or a final-season collapse shows up as
 * a shape rather than as a patch of colour.
 *
 * Drawn as inline SVG — no chart library, and the season bands are what make
 * it legible, so they're part of the plot rather than a legend.
 */
const HEIGHT = 260;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_LEFT = 34;
const MIN_STEP = 9;

function RatingsChart({
  seasons,
  progress,
  nextUp,
  progressMode,
  focusedSeason,
  onSelect,
}: {
  seasons: SeasonData[];
  progress: Progress;
  nextUp: Progress;
  progressMode: ProgressMode;
  focusedSeason: number | null;
  onSelect: (point: EpisodePoint) => void;
}) {
  const points = useMemo(
    () => flattenEpisodes(seasons).filter((point) => point.rating > 0),
    [seasons],
  );

  if (points.length < 2) {
    return (
      <Box
        sx={{
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          borderRadius: "12px",
          backgroundColor: "background.surface",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography level="body-sm" textColor="neutral.500">
          Not enough rated episodes to plot a trend yet.
        </Typography>
      </Box>
    );
  }

  const lowest = Math.min(...points.map((point) => point.rating));
  const highest = Math.max(...points.map((point) => point.rating));
  // A little headroom either side, clamped to the 1–10 scale IMDb actually uses.
  const floor = Math.max(1, Math.floor(lowest) - 0.5);
  const ceiling = Math.min(10, Math.ceil(highest) + 0.5);

  const step = Math.max(MIN_STEP, Math.min(26, 900 / points.length));
  const plotWidth = points.length * step;
  const width = PAD_LEFT + plotWidth + 16;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (index: number) => PAD_LEFT + index * step + step / 2;
  const y = (rating: number) =>
    PAD_TOP + plotHeight - ((rating - floor) / (ceiling - floor)) * plotHeight;

  const average =
    points.reduce((sum, point) => sum + point.rating, 0) / points.length;

  // Season bands: where each season starts and ends along the x axis.
  const bands: { season: number; from: number; to: number }[] = [];
  points.forEach((point, index) => {
    const last = bands[bands.length - 1];
    if (last && last.season === point.season) {
      last.to = index;
      return;
    }
    bands.push({ season: point.season, from: index, to: index });
  });

  const gridLines = [] as number[];
  for (let value = Math.ceil(floor); value <= Math.floor(ceiling); value += 1) {
    gridLines.push(value);
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "12px",
        backgroundColor: "background.surface",
        p: { xs: 1.5, sm: 2 },
        overflowX: "auto",
      }}
    >
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label="Episode ratings over time"
        style={{ display: "block", minWidth: "100%" }}
      >
        {/* Alternating season bands */}
        {bands.map((band, index) => (
          <g key={`${band.season}-${band.from}`}>
            <rect
              x={PAD_LEFT + band.from * step}
              y={PAD_TOP - 8}
              width={(band.to - band.from + 1) * step}
              height={plotHeight + 8}
              fill={index % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent"}
              opacity={
                focusedSeason !== null && focusedSeason !== band.season ? 0.3 : 1
              }
            />
            <text
              x={PAD_LEFT + band.from * step + ((band.to - band.from + 1) * step) / 2}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={
                focusedSeason === band.season
                  ? "#ffffff"
                  : "rgba(255,255,255,0.4)"
              }
            >
              S{band.season}
            </text>
          </g>
        ))}

        {/* Rating gridlines */}
        {gridLines.map((value) => (
          <g key={value}>
            <line
              x1={PAD_LEFT}
              x2={width - 8}
              y1={y(value)}
              y2={y(value)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={y(value) + 3}
              textAnchor="end"
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
            >
              {value}
            </text>
          </g>
        ))}

        {/* Series average */}
        <line
          x1={PAD_LEFT}
          x2={width - 8}
          y1={y(average)}
          y2={y(average)}
          stroke="rgba(245,197,24,0.5)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* One polyline per season so the gap between seasons isn't drawn as a jump */}
        {bands.map((band) => (
          <polyline
            key={`line-${band.season}-${band.from}`}
            points={points
              .slice(band.from, band.to + 1)
              .map((point, index) => `${x(band.from + index)},${y(point.rating)}`)
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1.5}
            opacity={focusedSeason !== null && focusedSeason !== band.season ? 0.25 : 1}
          />
        ))}

        {/* Episodes */}
        {points.map((point, index) => {
          const color = TIER_COLORS[getTier(point.rating)];
          const state = progressState(progress, nextUp, point.season, point.episode);
          const ahead = state === "ahead" || state === "next";
          const hidden = progressMode === "spoiler" && ahead;
          const faded =
            (progressMode === "dim" && ahead) ||
            (focusedSeason !== null && focusedSeason !== point.season);

          if (hidden) {
            return (
              <circle
                key={`${point.season}-${point.episode}`}
                cx={x(index)}
                cy={PAD_TOP + plotHeight - 4}
                r={2}
                fill="rgba(255,255,255,0.2)"
              />
            );
          }

          return (
            <g key={`${point.season}-${point.episode}`} opacity={faded ? 0.35 : 1}>
              <circle
                cx={x(index)}
                cy={y(point.rating)}
                r={state === "current" ? 5 : 3.2}
                fill={color.bg}
                stroke={state === "current" ? "#ffffff" : "rgba(0,0,0,0.35)"}
                strokeWidth={state === "current" ? 2 : 0.5}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(point)}
              >
                <title>
                  {`S${point.season}:E${point.episode} · ${point.title} · ${point.rating.toFixed(1)}`}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>

      <Typography level="body-xs" textColor="neutral.600" sx={{ mt: 1 }}>
        Dashed line is the series average ({average.toFixed(1)}). Click any point for the
        episode.
      </Typography>
    </Box>
  );
}

export default RatingsChart;
