import { Box, Chip, CircularProgress, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { omdbAPI, tmdbAPI } from "../../service/api/api";
import StarIcon from "@mui/icons-material/Star";

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
        // Step 1: Get IMDb ID from TMDB external_ids
        const externalRes = await tmdbAPI.get(
          `/${mediaType}/${mediaId}/external_ids`
        );
        const imdbId = externalRes.data?.imdb_id;
        if (!imdbId) {
          setLoading(false);
          return;
        }
        // Step 2: Fetch IMDb rating from OMDB
        const omdbRes = await omdbAPI.get("/", { params: { i: imdbId } });
        if (omdbRes.data?.imdbRating && omdbRes.data.imdbRating !== "N/A") {
          setImdbRating(omdbRes.data.imdbRating);
          setImdbVotes(omdbRes.data.imdbVotes);
        }
      } catch (_) {
        // silently fail — OMDB is optional
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
