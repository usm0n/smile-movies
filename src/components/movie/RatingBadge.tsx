import { Box, Typography } from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";

interface RatingBadgeProps {
  rating: number; // TMDB vote_average 0–10
  size?: "sm" | "md";
  showIcon?: boolean;
}

function ratingToColor(r: number): string {
  if (r >= 8) return "#21d07a";   // green
  if (r >= 6) return "#d2d531";   // yellow
  if (r >= 4) return "#e67e22";   // orange
  return "#e74c3c";               // red
}

function RatingBadge({ rating, size = "sm", showIcon = true }: RatingBadgeProps) {
  if (!rating || rating === 0) return null;
  const rounded = Math.round(rating * 10) / 10;
  const color = ratingToColor(rating);
  const fontSize = size === "sm" ? 11 : 13;
  const iconSize = size === "sm" ? 11 : 14;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.3,
        px: size === "sm" ? 0.7 : 1,
        py: 0.3,
        borderRadius: 4,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        border: `1px solid ${color}55`,
        userSelect: "none",
      }}
    >
      {showIcon && <StarIcon sx={{ fontSize: iconSize, color }} />}
      <Typography
        sx={{
          fontSize,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {rounded}
      </Typography>
    </Box>
  );
}

export default RatingBadge;
