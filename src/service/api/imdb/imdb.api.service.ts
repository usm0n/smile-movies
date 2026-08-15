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

/**
 * The reverse of `resolveImdbId`: turn a tt-ID back into a TMDB id so IMDb
 * cross-references (sequels, remakes) can link into this app rather than out
 * to imdb.com. Returns null for titles TMDB has never indexed.
 */
export async function findByImdbId(
  imdbId: string
): Promise<{ id: number; mediaType: "movie" | "tv" } | null> {
  try {
    const res = await tmdbAPI.get(`/find/${imdbId}`, {
      params: { external_source: "imdb_id" },
    });
    const movie = res.data?.movie_results?.[0];
    if (movie?.id) return { id: movie.id, mediaType: "movie" };

    const tv = res.data?.tv_results?.[0];
    if (tv?.id) return { id: tv.id, mediaType: "tv" };

    return null;
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

// ── Title details ────────────────────────────────────────────────────────────

export interface ImdbMoney {
  amount: number;
  currency: string;
}

export interface ImdbCertificate {
  rating: string;
  ratingReason?: string;
  ratingsBody?: string;
  country?: { id: string; text: string };
}

export interface ImdbBoxOffice {
  budget?: ImdbMoney;
  grossWorldwide?: ImdbMoney;
  grossDomestic?: ImdbMoney;
  openingWeekendDomestic?: ImdbMoney;
  openingWeekendEndDate?: string;
}

export interface ImdbAwardsSummary {
  topAward?: { name: string; event?: string; year?: number };
  topAwardWins: number;
  topAwardNominations: number;
  totalWins: number;
  totalNominations: number;
}

export interface ImdbRanking {
  /** Only ranks <= 250 are the "Top 250"; the chart continues past that. */
  topRank?: number;
  meterRank?: number;
  meterDirection?: "UP" | "DOWN" | "FLAT";
  meterDifference?: number;
}

export interface ImdbTechnicalSpecs {
  runtimeSeconds?: number;
  runtimeText?: string;
  aspectRatios: string[];
  soundMixes: string[];
  colorations: string[];
  cameras: string[];
  negativeFormats: string[];
  printedFormats: string[];
  filmLengths: string[];
  laboratories: string[];
  processes: string[];
}

export interface ImdbSectionCounts {
  trivia: number;
  goofs: number;
  quotes: number;
  crazyCredits: number;
  alternateVersions: number;
  filmingLocations: number;
  connections: number;
  reviews: number;
  keywords: number;
}

export interface ImdbTitleDetails {
  id: string;
  keywords: string[];
  genres: string[];
  countriesOfOrigin: Array<{ id: string; text: string }>;
  spokenLanguages: Array<{ id: string; text: string }>;
  certificate?: ImdbCertificate;
  certificates: ImdbCertificate[];
  boxOffice: ImdbBoxOffice;
  awards: ImdbAwardsSummary;
  ranking: ImdbRanking;
  technicalSpecs: ImdbTechnicalSpecs;
  counts: ImdbSectionCounts;
}

// ── Paginated sections ───────────────────────────────────────────────────────

export interface ImdbPage<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ImdbInterestScore {
  usersInterested: number;
  usersVoted: number;
}

export interface ImdbFactItem {
  id: string;
  text: string;
  isSpoiler: boolean;
  category?: { id: string; text: string };
  interest?: ImdbInterestScore;
}

export interface ImdbQuoteLine {
  text: string;
  character?: string;
  stageDirection?: string;
}

export interface ImdbQuote {
  id: string;
  isSpoiler: boolean;
  lines: ImdbQuoteLine[];
  interest?: ImdbInterestScore;
}

export interface ImdbAward {
  id: string;
  isWinner: boolean;
  category?: string;
  name: string;
  event?: string;
  year?: number;
  notes?: string;
  names: Array<{ id: string; name: string }>;
}

export interface ImdbFilmingLocation {
  id: string;
  location: string;
  note?: string;
  interest?: ImdbInterestScore;
}

export interface ImdbConnection {
  id: string;
  category: { id: string; text: string };
  title: {
    id: string;
    name: string;
    year?: number;
    type?: string;
    imageUrl?: string;
  };
}

export interface ImdbUserReview {
  id: string;
  summary: string;
  text: string;
  isSpoiler: boolean;
  authorRating?: number;
  authorName?: string;
  submissionDate?: string;
  upVotes: number;
  downVotes: number;
}

export type ImdbFactKind =
  | "trivia"
  | "goofs"
  | "crazyCredits"
  | "alternateVersions";

export type ImdbReviewSort = "helpfulness" | "newest" | "rating" | "votes";

/**
 * Sections are decoration, never the point of the page — a failed one renders
 * as absent rather than taking the title page down with it.
 */
const emptyPage = <T,>(): ImdbPage<T> => ({
  items: [],
  total: 0,
  hasMore: false,
});

/**
 * Keywords, certificates, box office, awards, ranking and technical specs in
 * one request, plus the counts that decide which sections are worth rendering.
 */
export async function fetchImdbDetails(
  imdbId: string
): Promise<ImdbTitleDetails | null> {
  try {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/details`);
    return res.data as ImdbTitleDetails;
  } catch {
    return null;
  }
}

/** Trivia, goofs, crazy credits or alternate versions. */
export async function fetchImdbFacts(
  imdbId: string,
  kind: ImdbFactKind,
  options: {
    limit?: number;
    after?: string;
    spoilers?: "include" | "exclude" | "only";
  } = {}
): Promise<ImdbPage<ImdbFactItem>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/facts`, {
      params: { kind, ...options },
    });
    return res.data as ImdbPage<ImdbFactItem>;
  }).catch(() => emptyPage<ImdbFactItem>());
}

/** Memorable quotes, each a run of character lines. */
export async function fetchImdbQuotes(
  imdbId: string,
  options: { limit?: number; after?: string } = {}
): Promise<ImdbPage<ImdbQuote>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/quotes`, {
      params: options,
    });
    return res.data as ImdbPage<ImdbQuote>;
  }).catch(() => emptyPage<ImdbQuote>());
}

/** Award nominations and wins, most prestigious first. */
export async function fetchImdbAwards(
  imdbId: string,
  options: { limit?: number; after?: string } = {}
): Promise<ImdbPage<ImdbAward>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/awards`, {
      params: options,
    });
    return res.data as ImdbPage<ImdbAward>;
  }).catch(() => emptyPage<ImdbAward>());
}

/** Where the title was shot. */
export async function fetchImdbFilmingLocations(
  imdbId: string,
  options: { limit?: number; after?: string } = {}
): Promise<ImdbPage<ImdbFilmingLocation>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/locations`, {
      params: options,
    });
    return res.data as ImdbPage<ImdbFilmingLocation>;
  }).catch(() => emptyPage<ImdbFilmingLocation>());
}

/** Sequels, remakes, references and other title-to-title links. */
export async function fetchImdbConnections(
  imdbId: string,
  options: { limit?: number; after?: string; category?: string } = {}
): Promise<ImdbPage<ImdbConnection>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/connections`, {
      params: options,
    });
    return res.data as ImdbPage<ImdbConnection>;
  }).catch(() => emptyPage<ImdbConnection>());
}

/** IMDb user reviews, most helpful first by default. */
export async function fetchImdbUserReviews(
  imdbId: string,
  options: { limit?: number; after?: string; sort?: ImdbReviewSort } = {}
): Promise<ImdbPage<ImdbUserReview>> {
  return withRetry(async () => {
    const res = await smbV1API.get(`/imdb/titles/${imdbId}/reviews`, {
      params: options,
    });
    return res.data as ImdbPage<ImdbUserReview>;
  }).catch(() => emptyPage<ImdbUserReview>());
}
