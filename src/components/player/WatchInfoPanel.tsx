import { useEffect, useState } from "react";
import { Box, Chip, Typography } from "@mui/joy";
import { AutoAwesome, FamilyRestroom, Loader, Star } from "../ui/icons";
import { aiService, PriorEpisodeInput } from "../../service/api/ai/ai.api.service";
import {
  ImdbParentsGuideEntry,
  fetchImdbParentalGuide,
} from "../../service/api/imdb/imdb.api.service";
import {
  CATEGORY_META,
  SEVERITY_CONFIG,
  dominantSeverity,
  severityChipColor,
  sortParentalGuide,
} from "../movie/parentalGuideShared";
import { ImdbWatchInfo } from "../../utilities/useImdbWatchInfo";

export type WatchInfoPanelProps = {
  mediaType?: string;
  title: string;
  /** "S2 · E4 · Episode name" for series, "2019 · 128 min" for films. */
  subtitle?: string;
  episodeName?: string;
  overview?: string;
  stillPath?: string;
  airDate?: string;
  runtime?: number;
  genres?: string[];
  imdb: ImdbWatchInfo;
  /** Opens straight onto the parental guide when the viewer asked for it. */
  focusParentalGuide?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  /** Episodes before this one, in order. Drives the catch-up recap. */
  priorEpisodes?: PriorEpisodeInput[];
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      level="body-xs"
      sx={{
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 500,
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

function Spinner() {
  return (
    <Loader
      sx={{
        fontSize: 20,
        color: "#707070",
        animation: "sm-spin 900ms linear infinite",
        "@keyframes sm-spin": { to: { transform: "rotate(360deg)" } },
      }}
    />
  );
}

/**
 * Parental guide, loaded on demand.
 *
 * It is a second round trip on top of the episode lookup, and most viewers open
 * the info tab to read the synopsis — so it only fetches once the section is
 * actually asked for.
 */
function ParentalGuideSection({
  imdbId,
  autoOpen,
}: {
  imdbId: string;
  autoOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(Boolean(autoOpen));
  const [entries, setEntries] = useState<ImdbParentsGuideEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoOpen) setIsOpen(true);
  }, [autoOpen]);

  useEffect(() => {
    if (!isOpen || !imdbId || entries || isLoading) return;

    let cancelled = false;
    setIsLoading(true);
    setError("");

    void fetchImdbParentalGuide(imdbId)
      .then((result) => {
        if (cancelled) return;
        setEntries(sortParentalGuide(result || []));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load the parental guide.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entries, imdbId, isLoading, isOpen]);

  if (!imdbId) return null;

  return (
    <Box>
      <SectionTitle>Parental guide</SectionTitle>

      {!isOpen ? (
        <Box
          component="button"
          type="button"
          onClick={() => setIsOpen(true)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 1,
            borderRadius: "8px",
            border: "1px solid #1f1f1f",
            background: "transparent",
            color: "#ededed",
            cursor: "pointer",
            fontFamily: "body",
            fontSize: "0.8125rem",
            fontWeight: 500,
            "&:hover": { backgroundColor: "#111111", borderColor: "#333333" },
          }}
        >
          <FamilyRestroom sx={{ fontSize: 16 }} />
          Show content warnings
        </Box>
      ) : null}

      {isLoading ? <Spinner /> : null}
      {error ? (
        <Typography level="body-sm" sx={{ color: "#e5484d" }}>
          {error}
        </Typography>
      ) : null}

      {entries && !isLoading ? (
        entries.length ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {entries.map((entry) => {
              const severity = dominantSeverity(entry);
              const meta = CATEGORY_META[entry.category] || {
                label: entry.category,
                emoji: "📌",
              };

              return (
                <Box
                  key={entry.category}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: "8px",
                    border: "1px solid #1f1f1f",
                  }}
                >
                  <Typography level="body-sm" sx={{ minWidth: 0 }}>
                    <Box component="span" sx={{ mr: 0.75 }}>
                      {meta.emoji}
                    </Box>
                    {meta.label}
                  </Typography>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={severityChipColor(severity)}
                    sx={{ flexShrink: 0, fontWeight: 700 }}
                  >
                    {SEVERITY_CONFIG[severity]?.label || severity}
                  </Chip>
                </Box>
              );
            })}
            <Typography level="body-xs">
              Severity is voted on by IMDb users.
            </Typography>
          </Box>
        ) : (
          <Typography level="body-sm">
            No parental guide has been submitted for this one.
          </Typography>
        )
      ) : null}
    </Box>
  );
}

/**
 * "What happened before this?" — a catch-up for picking a series back up weeks
 * later, loaded on demand.
 *
 * Only the episodes before this one are sent to the API, so the recap has no
 * way to spoil the episode about to play: the information simply is not there.
 * Like the parental guide, it stays behind a tap — most viewers open this panel
 * for the synopsis, and a recap nobody asked for would burn the AI budget on
 * every episode change.
 */
function RecapSection({
  title,
  seasonNumber,
  episodeNumber,
  priorEpisodes,
}: {
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  priorEpisodes: PriorEpisodeInput[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [recap, setRecap] = useState("");
  const [beats, setBeats] = useState<string[]>([]);
  const [unavailable, setUnavailable] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError("");

    void aiService
      .recap({ title, seasonNumber, episodeNumber, priorEpisodes })
      .then((result) => {
        if (cancelled) return;
        setRecap(result.recap || "");
        setBeats(result.beats || []);
        setUnavailable(result.unavailable || "");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not build a recap right now.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Deliberately keyed on `isOpen` alone. The caller remounts this component
    // per episode, so the other inputs cannot change during a mount — and
    // listing `priorEpisodes` would re-run the effect on every parent render,
    // whose cleanup would cancel the request that is still in flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!priorEpisodes.length) return null;

  return (
    <Box>
      <SectionTitle>Catch me up</SectionTitle>

      {!isOpen ? (
        <Box
          component="button"
          type="button"
          onClick={() => setIsOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            px: 1.5,
            py: 1.1,
            borderRadius: "8px",
            border: "1px solid #1f1f1f",
            background: "#0a0a0a",
            color: "#a1a1a1",
            font: "inherit",
            fontSize: "0.8125rem",
            textAlign: "left",
            cursor: "pointer",
            "&:hover": { borderColor: "#333333", color: "#ededed" },
          }}
        >
          <AutoAwesome sx={{ fontSize: 15, flexShrink: 0 }} />
          What happened before this episode?
        </Box>
      ) : isLoading ? (
        <Spinner />
      ) : error ? (
        <Typography level="body-sm">{error}</Typography>
      ) : unavailable ? (
        <Typography level="body-sm">{unavailable}</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {recap ? (
            <Typography level="body-sm" sx={{ color: "#a1a1a1" }}>
              {recap}
            </Typography>
          ) : null}

          {beats.length ? (
            <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.6, pl: 0 }}>
              {beats.map((beat) => (
                <Box
                  key={beat}
                  component="li"
                  sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      mt: "8px",
                      borderRadius: "50%",
                      background: "#707070",
                      flexShrink: 0,
                    }}
                  />
                  <Typography level="body-sm" sx={{ color: "#a1a1a1" }}>
                    {beat}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          <Typography level="body-xs">
            AI-generated from earlier episode synopses. Covers nothing past S
            {seasonNumber}E{episodeNumber - 1}.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * "What am I watching?" — the synopsis, the episode's own IMDb rating and its
 * content warnings, as the third tab of the player's side sheet. It lives
 * inside `<media-player>` so it survives fullscreen, which a modal could not.
 */
function WatchInfoPanel({
  title,
  subtitle,
  episodeName,
  overview,
  stillPath,
  airDate,
  runtime,
  genres,
  imdb,
  focusParentalGuide,
  seasonNumber,
  episodeNumber,
  priorEpisodes,
}: WatchInfoPanelProps) {
  const synopsis = String(overview || imdb.plot || "").trim();
  const facts = [
    airDate,
    Number(runtime) > 0 ? `${Math.round(Number(runtime))} min` : "",
    ...(genres || []),
  ].filter(Boolean);
  const parentalGuideId = imdb.episodeImdbId || imdb.titleImdbId;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {stillPath ? (
        <Box
          component="img"
          loading="lazy"
          src={`https://image.tmdb.org/t/p/w500${stillPath}`}
          alt=""
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "8px",
            border: "1px solid #1f1f1f",
          }}
        />
      ) : null}

      <Box>
        <Typography level="title-md" sx={{ color: "#ededed" }}>
          {episodeName || title}
        </Typography>
        {subtitle ? (
          <Typography level="body-xs" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mt: 1.25,
          }}
        >
          {imdb.isLoading ? <Spinner /> : null}
          {imdb.rating > 0 ? (
            <Chip
              size="sm"
              startDecorator={<Star sx={{ fontSize: 14, color: "#F5C518" }} />}
              sx={{
                backgroundColor: "#111111",
                border: "1px solid rgba(245,197,24,0.35)",
                color: "#ededed",
                fontWeight: 700,
              }}
            >
              {imdb.rating.toFixed(1)}
            </Chip>
          ) : null}
          {imdb.voteCount > 0 ? (
            <Typography level="body-xs">
              {imdb.voteCount.toLocaleString()} votes
            </Typography>
          ) : null}
          {imdb.seriesRating > 0 && imdb.episodeImdbId ? (
            <Typography level="body-xs">
              Series average {imdb.seriesRating.toFixed(1)}
            </Typography>
          ) : null}
        </Box>

        {facts.length ? (
          <Typography level="body-xs" sx={{ mt: 0.75 }}>
            {facts.join(" · ")}
          </Typography>
        ) : null}
      </Box>

      {synopsis ? (
        <Box>
          <SectionTitle>Synopsis</SectionTitle>
          <Typography level="body-sm" sx={{ color: "#a1a1a1" }}>
            {synopsis}
          </Typography>
        </Box>
      ) : null}

      {Number.isFinite(seasonNumber) && Number.isFinite(episodeNumber) && priorEpisodes?.length ? (
        <RecapSection
          // Remounting per episode resets the recap and keeps the fetch effect
          // dependent on nothing but the viewer opening it.
          key={`${seasonNumber}-${episodeNumber}`}
          title={title}
          seasonNumber={Number(seasonNumber)}
          episodeNumber={Number(episodeNumber)}
          priorEpisodes={priorEpisodes}
        />
      ) : null}

      <ParentalGuideSection
        imdbId={parentalGuideId}
        autoOpen={focusParentalGuide}
      />
    </Box>
  );
}

export default WatchInfoPanel;
