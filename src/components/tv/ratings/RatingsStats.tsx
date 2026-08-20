import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";
import {
  EpisodePoint,
  LEGEND,
  RatingsStats as Stats,
  SeasonData,
  TIER_COLORS,
  formatVotes,
  getTier,
} from "./ratingsShared";

/**
 * The numbers you'd otherwise have to read off the grid by eye: the peak, the
 * trough, which season held up, and how the whole run is distributed across
 * the tier scale.
 */
function Tile({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: "1 1 200px",
        minWidth: 0,
        p: 2,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        backgroundColor: "background.surface",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 120ms ease",
        "&:hover": onClick ? { borderColor: "neutral.outlinedHoverBorder" } : undefined,
      }}
    >
      <Typography
        level="body-xs"
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10 }}
      >
        {label}
      </Typography>
      <Box sx={{ mt: 0.75 }}>{children}</Box>
    </Box>
  );
}

function EpisodeTile({
  label,
  point,
  onSelect,
}: {
  label: string;
  point: EpisodePoint | null;
  onSelect?: (point: EpisodePoint) => void;
}) {
  if (!point) return null;
  const color = TIER_COLORS[getTier(point.rating)];
  return (
    <Tile label={label} onClick={onSelect ? () => onSelect(point) : undefined}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: color.text }}>
          {point.rating.toFixed(1)}
        </Typography>
        <Typography level="body-xs" textColor="neutral.500">
          S{point.season}:E{point.episode}
        </Typography>
      </Box>
      <Typography level="body-sm" noWrap sx={{ fontWeight: 500 }}>
        {point.title}
      </Typography>
      {point.votes > 0 && (
        <Typography level="body-xs" textColor="neutral.600">
          {formatVotes(point.votes)} votes
        </Typography>
      )}
    </Tile>
  );
}

function SeasonTile({ label, season }: { label: string; season: SeasonData | null }) {
  if (!season) return null;
  const color = TIER_COLORS[getTier(season.average)];
  return (
    <Tile label={label}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: color.text }}>
          {season.average.toFixed(1)}
        </Typography>
        <Typography level="body-xs" textColor="neutral.500">
          Season {season.seasonNumber}
        </Typography>
      </Box>
      <Typography level="body-sm" textColor="neutral.400">
        {season.ratedCount} of {season.order.length} episodes rated
      </Typography>
    </Tile>
  );
}

function RatingsStats({
  stats,
  onSelect,
}: {
  stats: Stats;
  onSelect?: (point: EpisodePoint) => void;
}) {
  if (!stats.ratedCount) return null;

  const spread =
    stats.best && stats.worst ? stats.best.rating - stats.worst.rating : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <EpisodeTile label="Best episode" point={stats.best} onSelect={onSelect} />
        <EpisodeTile label="Worst episode" point={stats.worst} onSelect={onSelect} />
        <SeasonTile label="Strongest season" season={stats.bestSeason} />
        <SeasonTile label="Weakest season" season={stats.worstSeason} />
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Tile label="Series shape">
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {stats.average.toFixed(1)}
              </Typography>
              <Typography level="body-xs" textColor="neutral.500">
                Episode average
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {spread.toFixed(1)}
              </Typography>
              <Typography level="body-xs" textColor="neutral.500">
                Best-to-worst spread
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color:
                    stats.trend > 0 ? "#3ecf8e" : stats.trend < 0 ? "#ff6369" : undefined,
                }}
              >
                {stats.trend > 0 ? "+" : ""}
                {stats.trend.toFixed(1)}
              </Typography>
              <Typography level="body-xs" textColor="neutral.500">
                First season → last
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {formatVotes(stats.totalVotes)}
              </Typography>
              <Typography level="body-xs" textColor="neutral.500">
                Votes counted
              </Typography>
            </Box>
          </Box>
        </Tile>
      </Box>

      {/* Tier distribution — one bar, segments proportional to episode counts. */}
      <Box
        sx={{
          p: 2,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          backgroundColor: "background.surface",
        }}
      >
        <Typography
          level="body-xs"
          sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10, mb: 1 }}
        >
          How the run breaks down
        </Typography>
        <Box
          sx={{
            display: "flex",
            height: 12,
            borderRadius: "6px",
            overflow: "hidden",
            gap: "2px",
          }}
        >
          {stats.distribution.map((item) => (
            <Box
              key={item.tier}
              title={`${LEGEND.find((entry) => entry.tier === item.tier)?.label}: ${item.count}`}
              sx={{
                flexGrow: item.count,
                backgroundColor: TIER_COLORS[item.tier].bg,
                minWidth: 4,
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.25 }}>
          {stats.distribution.map((item) => {
            const entry = LEGEND.find((legend) => legend.tier === item.tier);
            const share = Math.round((item.count / stats.ratedCount) * 100);
            return (
              <Box key={item.tier} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "2px",
                    backgroundColor: TIER_COLORS[item.tier].bg,
                  }}
                />
                <Typography level="body-xs" sx={{ color: TIER_COLORS[item.tier].text }}>
                  {entry?.label}
                </Typography>
                <Typography level="body-xs" textColor="neutral.600">
                  {item.count} · {share}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default RatingsStats;
