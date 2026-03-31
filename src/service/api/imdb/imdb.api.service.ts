import { imdbAPI, tmdbAPI } from "../api";

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
  rating?: ImdbRating;
}

export interface ImdbParentsGuideReview {
  text: string;
  isSpoiler: boolean;
}

export interface ImdbParentsGuideSeverity {
  severityLevel: string;
  voteCount: number;
}

export interface ImdbParentsGuideEntry {
  category: string; // "SEXUAL_CONTENT" | "VIOLENCE" | "PROFANITY" | "ALCOHOL_DRUGS" | "FRIGHTENING_INTENSE_SCENES"
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
    const res = await imdbAPI.get(`/titles/${imdbId}`);
    return res.data as ImdbTitle;
  } catch {
    return null;
  }
}

/**
 * Fetch all episodes for a given season, handling pagination.
 * Uses retry logic to handle transient API errors.
 */
export async function fetchImdbEpisodesBySeason(
  imdbId: string,
  season: number
): Promise<ImdbEpisode[]> {
  return withRetry(async () => {
    const episodes: ImdbEpisode[] = [];
    let pageToken: string | undefined;

    do {
      const params: Record<string, string | number> = {
        season: String(season),
        pageSize: 50,
      };
      if (pageToken) params.pageToken = pageToken;

      const res = await imdbAPI.get(`/titles/${imdbId}/episodes`, { params });
      const data = res.data;
      if (data?.episodes?.length) episodes.push(...data.episodes);
      pageToken = data?.nextPageToken;
    } while (pageToken);

    return episodes;
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
  const res = await imdbAPI.get(`/titles/${imdbId}/parentsGuide`);
  return (res.data?.parentsGuide ?? []) as ImdbParentsGuideEntry[];
}
