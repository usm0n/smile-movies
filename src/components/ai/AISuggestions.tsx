import { Box, Button, Typography } from "@mui/joy";
import { ReactNode } from "react";
import EventMC from "../cards/EventMC";
import { AutoAwesome, ReplayRounded } from "../ui/icons";
import { TextSkeleton } from "../ui/Skeleton";
import { tokens } from "../../theme";
import type { ResolvedMedia } from "../../utilities/resolveSuggestedMedia";

export type AISuggestionsProps = {
  heading: string;
  /** The model's own read on the request, shown above the results. */
  note?: string;
  items: ResolvedMedia[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Renders next to each card — used by lists to offer an "Add" button. */
  renderItemAction?: (media: ResolvedMedia) => ReactNode;
  /** Shown when the request succeeded but produced nothing usable. */
  emptyMessage?: string;
};

/**
 * A labelled strip of AI-suggested titles.
 *
 * Always visibly marked as AI output — these are guesses, and presenting them
 * with the same authority as catalogue results would be misleading when the
 * model gets one wrong. Shared by the search rescue and collection filling.
 */
function AISuggestions({
  heading,
  note,
  items,
  loading,
  error,
  onRetry,
  renderItemAction,
  emptyMessage = "Nothing came back for this one.",
}: AISuggestionsProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "12px",
        background: tokens.surface,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: note ? 0.75 : 2 }}>
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
        <Typography level="title-sm">{heading}</Typography>
        <Typography
          sx={{
            ml: "auto",
            fontSize: "0.625rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: tokens.textTertiary,
            border: `1px solid ${tokens.border}`,
            borderRadius: "4px",
            px: 0.6,
            py: "1px",
          }}
        >
          AI
        </Typography>
      </Box>

      {note ? (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          {note}
        </Typography>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} sx={{ width: 150 }}>
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "2 / 3",
                  borderRadius: "8px",
                  border: `1px solid ${tokens.border}`,
                  background: tokens.level1,
                }}
              />
              <Box sx={{ mt: 1 }}>
                <TextSkeleton lines={1} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : error ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography level="body-sm">{error}</Typography>
          {onRetry ? (
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<ReplayRounded sx={{ fontSize: 14 }} />}
              onClick={onRetry}
            >
              Try again
            </Button>
          ) : null}
        </Box>
      ) : !items.length ? (
        <Typography level="body-sm">{emptyMessage}</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {items.map((media) => (
            <Box
              key={`${media.mediaType}-${media.id}`}
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <EventMC
                eventId={media.id}
                eventPoster={media.posterPath}
                eventTitle={media.title}
                eventType={media.mediaType}
              />
              {media.reason ? (
                <Typography level="body-xs" sx={{ lineHeight: 1.5 }}>
                  {media.reason}
                </Typography>
              ) : null}
              {renderItemAction ? <Box sx={{ mt: "auto" }}>{renderItemAction(media)}</Box> : null}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AISuggestions;
