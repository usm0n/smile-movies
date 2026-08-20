import { Box, Typography } from "@mui/joy";
import { AutoAwesome, Loader, ReplayRounded } from "../ui/icons";
import { tokens } from "../../theme";
import { useEpisodeRecap } from "../../utilities/useEpisodeRecap";
import type { PriorEpisodeInput } from "../../service/api/ai/ai.api.service";

export type EpisodeRecapProps = {
  tmdbId: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  /** The current season's episodes, when the caller already has them. */
  seedEpisodes?: PriorEpisodeInput[];
  /** "panel" sits in the player's side sheet; "hero" sits on the details page. */
  variant?: "panel" | "hero";
};

/**
 * Spoiler-free catch-up on a series, up to the episode you are about to watch.
 *
 * Stays behind a tap in both places it appears. Most of the time people know
 * where they are, and generating a recap nobody asked for on every episode
 * change would spend the AI budget on nothing.
 */
function EpisodeRecap({
  tmdbId,
  title,
  seasonNumber,
  episodeNumber,
  seedEpisodes,
  variant = "panel",
}: EpisodeRecapProps) {
  const enabled =
    Boolean(tmdbId) &&
    Number.isFinite(seasonNumber) &&
    Number.isFinite(episodeNumber) &&
    // Nothing precedes the first episode of the first season.
    !(seasonNumber <= 1 && episodeNumber <= 1);

  const { isOpen, open, retry, recap, beats, unavailable, isLoading, error, coversThrough } =
    useEpisodeRecap({ tmdbId, title, seasonNumber, episodeNumber, seedEpisodes, enabled });

  if (!enabled) return null;

  const isHero = variant === "hero";

  if (!isOpen) {
    return (
      <Box
        component="button"
        type="button"
        onClick={open}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          width: isHero ? "auto" : "100%",
          borderRadius: "8px",
          border: `1px solid ${tokens.border}`,
          background: isHero ? "rgba(10,10,10,0.6)" : tokens.surface,
          backdropFilter: isHero ? "blur(8px)" : "none",
          color: tokens.textSecondary,
          font: "inherit",
          fontSize: "0.8125rem",
          textAlign: "left",
          cursor: "pointer",
          transition: "border-color 150ms ease, color 150ms ease",
          "&:hover": { borderColor: tokens.borderHover, color: tokens.textPrimary },
          "&:focus-visible": { outline: "none", boxShadow: tokens.focusRing },
        }}
      >
        <AutoAwesome sx={{ fontSize: 15, flexShrink: 0 }} />
        Catch me up on S{seasonNumber}E{episodeNumber}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "12px",
        background: isHero ? "rgba(10,10,10,0.75)" : tokens.surface,
        backdropFilter: isHero ? "blur(12px)" : "none",
        p: 2,
        maxWidth: isHero ? 560 : "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <AutoAwesome sx={{ fontSize: 14, color: tokens.textSecondary, flexShrink: 0 }} />
        <Typography level="title-sm">The story so far</Typography>
        {isLoading ? (
          <Loader
            sx={{
              ml: "auto",
              fontSize: 15,
              color: tokens.textTertiary,
              animation: "sm-spin 900ms linear infinite",
              "@keyframes sm-spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
        ) : null}
      </Box>

      {error ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography level="body-sm">{error}</Typography>
          <Box
            component="button"
            type="button"
            onClick={() => void retry()}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1,
              py: 0.5,
              border: `1px solid ${tokens.border}`,
              borderRadius: "6px",
              background: "transparent",
              color: tokens.textSecondary,
              font: "inherit",
              fontSize: "0.75rem",
              cursor: "pointer",
              "&:hover": { borderColor: tokens.borderHover, color: tokens.textPrimary },
            }}
          >
            <ReplayRounded sx={{ fontSize: 13 }} />
            Try again
          </Box>
        </Box>
      ) : unavailable ? (
        <Typography level="body-sm">{unavailable}</Typography>
      ) : isLoading ? (
        <Typography level="body-sm">Reading the earlier episodes…</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {recap ? (
            <Typography level="body-sm" sx={{ color: tokens.textPrimary, lineHeight: 1.7 }}>
              {recap}
            </Typography>
          ) : null}

          {beats.length ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {beats.map((beat) => (
                <Box key={beat} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      mt: "8px",
                      borderRadius: "50%",
                      background: tokens.textTertiary,
                      flexShrink: 0,
                    }}
                  />
                  <Typography level="body-sm">{beat}</Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          {coversThrough ? (
            <Typography level="body-xs" sx={{ fontSize: "0.6875rem" }}>
              AI-written from earlier episode synopses. Covers nothing past S
              {coversThrough.seasonNumber}E{coversThrough.episodeNumber}.
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  );
}

export default EpisodeRecap;
