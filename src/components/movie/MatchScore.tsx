import { Box, CircularProgress, Chip, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { aiService, MatchScoreResult } from "../../service/api/ai/ai.api.service";
import { AutoAwesome as AutoAwesomeIcon } from "../ui/icons";
import { isLoggedIn } from "../../utilities/defaults";

interface MatchScoreProps {
  movieTitle: string;
  movieYear?: string;
  overview?: string;
  genres?: string[];
  certification?: string;
}

/**
 * One compact chip: "87% match".
 *
 * The reasoning and the age warning live in the tooltip rather than on the
 * page. They are full sentences, and a sentence rendered as a chip cannot wrap
 * — on a phone it ran straight off both edges of the hero.
 */
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
        <Typography level="body-xs" textColor="neutral.400">Match…</Typography>
      </Box>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.score >= 70 ? "success" :
    result.score >= 45 ? "warning" :
    "danger";

  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 260, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography level="body-sm">{result.reasoning}</Typography>
          {result.age_warning ? (
            <Typography level="body-xs" textColor="warning.300">
              {result.age_warning}
            </Typography>
          ) : null}
          <Typography level="body-xs" textColor="neutral.400">
            Genre match: {result.genre_match}
          </Typography>
        </Box>
      }
      placement="bottom-start"
    >
      <Chip
        startDecorator={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
        color={scoreColor}
        variant="soft"
        size="sm"
        sx={{ cursor: "help", fontWeight: 600, maxWidth: "100%" }}
      >
        {result.score}% match
      </Chip>
    </Tooltip>
  );
}

export default MatchScore;
