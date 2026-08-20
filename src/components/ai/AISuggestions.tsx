import { Box, Button, Typography } from "@mui/joy";
import { ReactNode } from "react";
import EventMC from "../cards/EventMC";
import { AutoAwesome, ReplayRounded } from "../ui/icons";
import { TextSkeleton } from "../ui/Skeleton";
import { monoStack, tokens } from "../../theme";
import type { ResolvedMedia } from "../../utilities/resolveSuggestedMedia";

export type AISuggestionsProps = {
  heading: string;
  /** The model's own read on the request, shown above the results. */
  note?: string;
  /** What was actually searched for — themes, genres, people. Kept visible so
   *  the user can see why these came back and correct course if it misread. */
  strategy?: string;
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
  strategy,
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
        <Typography level="body-sm" sx={{ mb: strategy ? 1 : 2.5 }}>
          {note}
        </Typography>
      ) : null}

      {strategy ? (
        <Typography
          level="body-xs"
          sx={{
            mb: 2.5,
            fontSize: "0.6875rem",
            fontFamily: monoStack,
            color: tokens.textTertiary,
          }}
        >
          {strategy}
        </Typography>
      ) : null}

      {loading ? (
        <Box
          sx={{
            display: "grid",
            columnGap: { xs: 2, sm: 3 },
            rowGap: { xs: 3, sm: 4 },
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(140px, 1fr))",
              sm: "repeat(auto-fill, minmax(170px, 1fr))",
            },
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index}>
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
            // Posters need room to breathe — at the old 150px/16px the cards
            // read as one solid block with no gutter between them.
            columnGap: { xs: 2, sm: 3 },
            rowGap: { xs: 3, sm: 4 },
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(140px, 1fr))",
              sm: "repeat(auto-fill, minmax(170px, 1fr))",
            },
          }}
        >
          {items.map((media) => (
            <Box
              key={`${media.mediaType}-${media.id}`}
              sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
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
