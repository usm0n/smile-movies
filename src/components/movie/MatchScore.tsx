import { Box, CircularProgress, Chip, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { aiService, MatchScoreResult } from "../../service/api/ai/ai.api.service";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { isLoggedIn } from "../../utilities/defaults";

interface MatchScoreProps {
  movieTitle: string;
  movieYear?: string;
  overview?: string;
  genres?: string[];
  certification?: string;
}

function MatchScore({ movieTitle, movieYear, overview, genres, certification }: MatchScoreProps) {
  const [result, setResult] = useState<MatchScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !movieTitle) return;
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await aiService.matchScore({ movieTitle, movieYear, overview, genres, certification });
        if (!cancelled) setResult(data);
      } catch (_) {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    // debounce slightly to avoid hammering on page load
    const t = setTimeout(fetch, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [movieTitle]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CircularProgress size="sm" sx={{ width: 14, height: 14 }} />
        <Typography level="body-xs" textColor="neutral.400">Calculating match…</Typography>
      </Box>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.score >= 70 ? "success" :
    result.score >= 45 ? "warning" :
    "danger";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Tooltip
        title={
          <Box sx={{ maxWidth: 260 }}>
            <Typography level="body-sm">{result.reasoning}</Typography>
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
              Genre match: {result.genre_match}
            </Typography>
          </Box>
        }
        placement="bottom-start"
      >
        <Chip
          startDecorator={<AutoAwesomeIcon sx={{ fontSize: 15 }} />}
          color={scoreColor}
          variant="soft"
          size="sm"
          sx={{ cursor: "help", fontWeight: 700 }}
        >
          {result.score}% match for you
        </Chip>
      </Tooltip>
      {result.age_warning && (
        <Chip
          startDecorator={<WarningAmberIcon sx={{ fontSize: 14 }} />}
          color="warning"
          variant="soft"
          size="sm"
        >
          {result.age_warning}
        </Chip>
      )}
    </Box>
  );
}

export default MatchScore;
