import { smbV1API, tmdbAPI } from "../api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ImdbRating {
  aggregateRating: number;
  voteCount: number;
}

export interface ImdbEpisode {
  id: string;
  title: string;
  season: string;
  episodeNumber: number;
  rating?: ImdbRating;
  plot?: string;
  releaseDate?: { year?: number; month?: number; day?: number };
}

export interface ImdbTitle {
  id: string;
  primaryTitle: string;
  originalTitle?: string;
  startYear?: number;
  type?: string;
  rating?: ImdbRating;
}

export interface ImdbParentsGuideReview {
  text: string;
  isSpoiler: boolean;
}

export interface ImdbParentsGuideSeverity {
  severityLevel: string; // "NONE" | "MILD" | "MODERATE" | "SEVERE"
  voteCount: number;
}

export interface ImdbParentsGuideEntry {
  category: string; // "SEXUAL_CONTENT" | "VIOLENCE" | "PROFANITY" | "ALCOHOL_DRUGS" | "FRIGHTENING_INTENSE_SCENES"
  severity?: string;
  totalVoteCount?: number;
  severityBreakdowns: ImdbParentsGuideSeverity[];
  reviews: ImdbParentsGuideReview[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sleep for ms milliseconds */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Run an async function up to `retries` times with exponential backoff */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 400
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) await sleep(baseDelay * Math.pow(2, i));
    }
  }
  throw lastErr;
}

/** Run tasks in batches of `batchSize` sequentially to avoid rate-limiting */
async function batchedAll<T>(
  tasks: (() => Promise<T>)[],
  batchSize = 3,
  delayBetweenBatches = 150
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((t) => t()));
    results.push(...batchResults);
    if (i + batchSize < tasks.length) await sleep(delayBetweenBatches);
  }
  return results;
}

// ── API calls ────────────────────────────────────────────────────────────────
//
// IMDb data is served by our own backend (`/api/v1/imdb/*`), which reads it
// from IMDb upstream. The previous third-party host (api.imdbapi.dev) was shut
// down, and IMDb's own endpoint cannot be called directly from the browser.

/** Resolve a TMDB ID to an IMDb tt-ID via TMDB's external_ids endpoint */
export async function resolveImdbId(
  tmdbId: string | number,
  mediaType: "movie" | "tv"
): Promise<string | null> {
  try {
    const res = await tmdbAPI.get(`/${mediaType}/${tmdbId}/external_ids`);
    return res.data?.imdb_id ?? null;
  } catch {
    return null;
  }
}

/** Fetch IMDb title details (includes aggregate rating) */
export async function fetchImdbTitle(imdbId: string): Promise<ImdbTitle | null> {
  try {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}`);
    return res.data as ImdbTitle;
  } catch {
    return null;
  }
}

/**
 * Fetch all episodes for a given season.
 * Pagination is handled server-side; retries cover transient API errors.
 */
export async function fetchImdbEpisodesBySeason(
  imdbId: string,
  season: number
): Promise<ImdbEpisode[]> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/episodes`, {
      params: { season },
    });
    return (res.data?.episodes ?? []) as ImdbEpisode[];
  });
}

/**
 * Fetch all seasons in batches (max 3 at a time) to avoid rate-limiting.
 * Calls onProgress after each batch so callers can show incremental progress.
 */
export async function fetchAllSeasonsBatched(
  imdbId: string,
  seasonNumbers: number[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<number, ImdbEpisode[]>> {
  const result = new Map<number, ImdbEpisode[]>();
  const total = seasonNumbers.length;
  let loaded = 0;

  const tasks = seasonNumbers.map((n) => async () => {
    try {
      const eps = await fetchImdbEpisodesBySeason(imdbId, n);
      result.set(n, eps);
    } catch {
      result.set(n, []); // still mark as loaded so count is correct
    }
    loaded++;
    onProgress?.(loaded, total);
  });

  await batchedAll(tasks, 3, 200);
  return result;
}

/** Fetch parental guide entries for a title */
export async function fetchImdbParentalGuide(
  imdbId: string
): Promise<ImdbParentsGuideEntry[]> {
  const res = await smbV1API.get(`/imdb/titles/${imdbId}/parentsGuide`);
  return (res.data?.parentsGuide ?? []) as ImdbParentsGuideEntry[];
}
