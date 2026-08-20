import { ImdbEpisode } from "../../../service/api/imdb/imdb.api.service";

/**
 * Everything the episode-ratings surfaces agree on: the tier scale, the
 * colours that encode it, and the numbers derived from a fetched run.
 *
 * The grid, the trend chart, the stats panel and the PNG exporter all read
 * from here so a "Great" episode is the same green in a tooltip, on a canvas
 * and in the legend.
 */

// ─── Tier scale ───────────────────────────────────────────────────────────────
export type Tier =
  | "absolute"
  | "awesome"
  | "great"
  | "good"
  | "regular"
  | "bad"
  | "garbage"
  | "none";

export function getTier(rating: number): Tier {
  if (rating <= 0) return "none";
  if (rating >= 9.5) return "absolute";
  if (rating >= 9.0) return "awesome";
  if (rating >= 8.0) return "great";
  if (rating >= 7.0) return "good";
  if (rating >= 6.0) return "regular";
  if (rating >= 5.0) return "bad";
  return "garbage";
}

export type TierColor = {
  /** Cell fill. */
  bg: string;
  /** Text drawn on top of `bg` — picked per tier, not by a rating threshold. */
  fg: string;
  /** Tinted label colour for use on the page's black background. */
  text: string;
  border: string;
};

export const TIER_COLORS: Record<Tier, TierColor> = {
  absolute: { bg: "rgb(29, 161, 242)", fg: "#04121f", text: "#a8d8ff", border: "#2196f3" },
  awesome: { bg: "rgb(24, 106, 59)", fg: "#eafff2", text: "#6ee6a8", border: "#21d07a" },
  great: { bg: "rgb(40, 180, 99)", fg: "#04210f", text: "#8ce68c", border: "#4caf50" },
  good: { bg: "rgb(244, 208, 63)", fg: "#231c00", text: "#f5e25a", border: "#d2d531" },
  regular: { bg: "rgb(243, 156, 18)", fg: "#231200", text: "#ffb566", border: "#e67e22" },
  bad: { bg: "rgb(231, 76, 60)", fg: "#2a0603", text: "#ff8080", border: "#e74c3c" },
  garbage: { bg: "rgb(99, 57, 116)", fg: "#f6ecff", text: "#d0a0f0", border: "#9b59b6" },
  none: { bg: "rgba(255,255,255,0.06)", fg: "#8a8a8a", text: "#707070", border: "transparent" },
};

export const LEGEND: { label: string; tier: Tier; range: string }[] = [
  { label: "Absolute Cinema", tier: "absolute", range: "≥9.5" },
  { label: "Awesome", tier: "awesome", range: "9.0–9.4" },
  { label: "Great", tier: "great", range: "8.0–8.9" },
  { label: "Good", tier: "good", range: "7.0–7.9" },
  { label: "Regular", tier: "regular", range: "6.0–6.9" },
  { label: "Bad", tier: "bad", range: "5.0–5.9" },
  { label: "Garbage", tier: "garbage", range: "<5.0" },
];

// ─── Shapes ───────────────────────────────────────────────────────────────────
export interface SeasonData {
  seasonNumber: number;
  episodes: Map<number, ImdbEpisode>;
  /** Episode numbers in ascending order — the grid's row order for this column. */
  order: number[];
  average: number;
  ratedCount: number;
}

export interface EpisodePoint {
  season: number;
  episode: number;
  rating: number;
  title: string;
  votes: number;
  episodeData: ImdbEpisode;
}

/** Where the viewer is in the run, taken from their `recentlyWatched` entry. */
export type Progress = { season: number; episode: number } | null;

/** How the grid treats episodes relative to the viewer's position. */
export type ProgressMode = "off" | "dim" | "spoiler";

export type ProgressState = "watched" | "current" | "next" | "ahead" | "none";

export const ratingOf = (episode?: ImdbEpisode | null) =>
  episode?.rating?.aggregateRating ?? 0;

export function progressState(
  progress: Progress,
  next: Progress,
  season: number,
  episode: number,
): ProgressState {
  if (!progress) return "none";
  if (progress.season === season && progress.episode === episode) return "current";
  if (next && next.season === season && next.episode === episode) return "next";
  if (season < progress.season) return "watched";
  if (season === progress.season && episode < progress.episode) return "watched";
  return "ahead";
}

export function flattenEpisodes(seasons: SeasonData[]): EpisodePoint[] {
  const points: EpisodePoint[] = [];
  seasons.forEach((season) => {
    season.order.forEach((number) => {
      const episode = season.episodes.get(number);
      if (!episode) return;
      points.push({
        season: season.seasonNumber,
        episode: number,
        rating: ratingOf(episode),
        title: episode.title || `Episode ${number}`,
        votes: episode.rating?.voteCount ?? 0,
        episodeData: episode,
      });
    });
  });
  return points;
}

// ─── Derived numbers ──────────────────────────────────────────────────────────
export interface RatingsStats {
  /** Vote-count-weighted is tempting, but IMDb's own season pages use the mean. */
  average: number;
  ratedCount: number;
  totalCount: number;
  totalVotes: number;
  best: EpisodePoint | null;
  worst: EpisodePoint | null;
  bestSeason: SeasonData | null;
  worstSeason: SeasonData | null;
  /** Last rated season's average minus the first's — the "did it decline" number. */
  trend: number;
  distribution: { tier: Tier; count: number }[];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

export function buildStats(seasons: SeasonData[]): RatingsStats {
  const points = flattenEpisodes(seasons);
  const rated = points.filter((point) => point.rating > 0);

  const average = rated.length
    ? round1(rated.reduce((sum, point) => sum + point.rating, 0) / rated.length)
    : 0;

  const best = rated.reduce<EpisodePoint | null>(
    (top, point) => (!top || point.rating > top.rating ? point : top),
    null,
  );
  const worst = rated.reduce<EpisodePoint | null>(
    (low, point) => (!low || point.rating < low.rating ? point : low),
    null,
  );

  const seasonsWithAverage = seasons.filter((season) => season.average > 0);
  const bestSeason = seasonsWithAverage.reduce<SeasonData | null>(
    (top, season) => (!top || season.average > top.average ? season : top),
    null,
  );
  const worstSeason = seasonsWithAverage.reduce<SeasonData | null>(
    (low, season) => (!low || season.average < low.average ? season : low),
    null,
  );

  const trend =
    seasonsWithAverage.length > 1
      ? round1(
          seasonsWithAverage[seasonsWithAverage.length - 1].average -
            seasonsWithAverage[0].average,
        )
      : 0;

  const counts = new Map<Tier, number>();
  rated.forEach((point) => {
    const tier = getTier(point.rating);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  });

  return {
    average,
    ratedCount: rated.length,
    totalCount: points.length,
    totalVotes: rated.reduce((sum, point) => sum + point.votes, 0),
    best,
    worst,
    bestSeason,
    worstSeason,
    trend,
    distribution: LEGEND.map((item) => ({
      tier: item.tier,
      count: counts.get(item.tier) ?? 0,
    })).filter((item) => item.count > 0),
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export type CellSize = "compact" | "normal" | "large";

export const CELL_METRICS: Record<
  CellSize,
  { width: number; height: number; font: number; gap: number; label: number }
> = {
  compact: { width: 38, height: 26, font: 11, gap: 5, label: 30 },
  normal: { width: 52, height: 34, font: 13, gap: 7, label: 36 },
  large: { width: 66, height: 44, font: 16, gap: 8, label: 42 },
};

export const formatVotes = (votes: number) => {
  if (votes >= 1_000_000) return `${round1(votes / 1_000_000)}M`;
  if (votes >= 1_000) return `${Math.round(votes / 1_000)}K`;
  return String(votes);
};

export const formatAirDate = (release?: ImdbEpisode["releaseDate"]) => {
  if (!release?.year) return "";
  if (!release.month) return String(release.year);
  const date = new Date(release.year, release.month - 1, release.day || 1);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    ...(release.day ? { day: "numeric" } : {}),
  });
};
