import { Box, Chip, CircularProgress, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { resolveImdbId, fetchImdbTitle } from "../../service/api/imdb/imdb.api.service";

interface IMDbRatingProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
}

function IMDbRating({ mediaId, mediaType }: IMDbRatingProps) {
  const [imdbRating, setImdbRating] = useState<string | null>(null);
  const [imdbVotes, setImdbVotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const imdbId = await resolveImdbId(mediaId, mediaType);
        if (!imdbId) return;
        const title = await fetchImdbTitle(imdbId);
        if (title?.rating?.aggregateRating) {
          setImdbRating(String(title.rating.aggregateRating.toFixed(1)));
          if (title.rating.voteCount) {
            setImdbVotes(title.rating.voteCount.toLocaleString());
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [mediaId, mediaType]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CircularProgress size="sm" sx={{ width: 16, height: 16 }} />
        <Typography level="body-sm" textColor="neutral.400">
          IMDb
        </Typography>
      </Box>
    );
  }

  if (!imdbRating) return null;

  return (
    <Tooltip title={imdbVotes ? `${imdbVotes} IMDb votes` : "IMDb rating"}>
      <Chip
        startDecorator={<StarIcon sx={{ color: "#F5C518", fontSize: 16 }} />}
        sx={{
          backgroundColor: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(245,197,24,0.4)",
          color: "white",
          fontWeight: 700,
          fontSize: 14,
          backdropFilter: "blur(8px)",
          cursor: "default",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
        }}
        size="sm"
      >
        {imdbRating}
      </Chip>
    </Tooltip>
  );
}

export default IMDbRating;
