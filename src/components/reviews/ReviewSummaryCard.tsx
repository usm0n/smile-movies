import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import {
  ReviewSummaryResult,
  aiService,
} from "../../service/api/ai/ai.api.service";
import { AutoAwesome, Check, Close } from "../ui/icons";
import { tokens } from "../../theme";

const CONSENSUS_COLOR: Record<string, string> = {
  Positive: tokens.green,
  Mixed: tokens.amber,
  Negative: tokens.red,
};

function PointList({
  label,
  points,
  positive,
}: {
  label: string;
  points: string[];
  positive: boolean;
}) {
  if (!points.length) return null;

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: tokens.textTertiary,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {points.map((point) => (
          <Box key={point} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            {positive ? (
              <Check sx={{ fontSize: 13, color: tokens.green, mt: "3px", flexShrink: 0 }} />
            ) : (
              <Close sx={{ fontSize: 13, color: tokens.textTertiary, mt: "3px", flexShrink: 0 }} />
            )}
            <Typography level="body-sm">{point}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * What the community thought, in three lines instead of thirty reviews.
 *
 * Loaded automatically rather than behind a tap: the API caches each summary
 * against the review count and newest edit, so only the first viewer after a
 * new review costs anything, and the summary is most useful the moment someone
 * arrives at the reviews rather than after another click.
 *
 * The review bodies are read server-side from the same records rendered below,
 * so this cannot be fed invented reviews by a client.
 */
function ReviewSummaryCard({
  mediaType,
  mediaId,
  reviewCount,
}: {
  mediaType: "movie" | "tv";
  mediaId: string;
  /** Drives a refresh when someone posts or edits a review. */
  reviewCount: number;
}) {
  const [summary, setSummary] = useState<ReviewSummaryResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setFailed(false);

    void aiService
      .reviewSummary({ mediaType, mediaId })
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaId, mediaType, reviewCount]);

  // A missing summary is not worth an error state — the reviews themselves are
  // right underneath, and this only ever added convenience.
  if (failed || !summary || summary.unavailable || !summary.summary) return null;

  const consensus = summary.consensus || "Mixed";

  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "12px",
        background: tokens.surface,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "6px",
            border: `1px solid ${tokens.border}`,
            background: tokens.level1,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <AutoAwesome sx={{ fontSize: 13, color: tokens.textSecondary }} />
        </Box>
        <Typography level="title-sm">What reviewers said</Typography>

        <Box
          sx={{
            px: 0.75,
            py: "1px",
            borderRadius: "4px",
            border: `1px solid ${CONSENSUS_COLOR[consensus]}40`,
            color: CONSENSUS_COLOR[consensus],
            fontSize: "0.6875rem",
            fontWeight: 500,
          }}
        >
          {consensus}
        </Box>

        <Typography level="body-xs" sx={{ ml: "auto" }}>
          {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}
          {summary.averageRating ? ` · ${summary.averageRating}/10 average` : ""}
        </Typography>
      </Box>

      <Typography level="body-sm" sx={{ color: tokens.textPrimary, lineHeight: 1.65 }}>
        {summary.summary}
      </Typography>

      {summary.liked?.length || summary.disliked?.length ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <PointList label="Praised" points={summary.liked || []} positive />
          <PointList label="Criticised" points={summary.disliked || []} positive={false} />
        </Box>
      ) : null}

      <Typography level="body-xs" sx={{ mt: 2, fontSize: "0.6875rem" }}>
        AI summary of the reviews below. It reports what reviewers said, not a verdict of its own.
      </Typography>
    </Box>
  );
}

export default ReviewSummaryCard;
