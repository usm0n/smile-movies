import { tmdb } from "../service/api/tmdb/tmdb.api.service";

/**
 * Turning AI-suggested titles into real catalogue entries.
 *
 * The model returns titles as text — "Blade Runner 2049" — but every surface
 * that shows them needs a TMDB id, a poster and a canonical name. This does
 * that lookup, and picks sensibly when a search returns several candidates:
 * "Dune" matches the 1984 film, the 2021 film and a mini-series.
 *
 * Shared by the assistant, the search rescue and collection filling so a fix to
 * the matching heuristics improves all three at once.
 */

export type SuggestedMediaInput = {
  title: string;
  mediaType: "movie" | "tv" | "unknown";
  year?: number | null;
  reason?: string;
};

export type ResolvedMedia = {
  id: number | string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string;
  year: number | null;
  reason?: string;
};

export type TMDBSearchResult = {
  id: number | string;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
};

const normalizeTitle = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const resultYear = (result: TMDBSearchResult): number | null => {
  const year = Number(
    String(result.release_date || result.first_air_date || "").slice(0, 4),
  );
  return Number.isFinite(year) && year > 1870 ? year : null;
};

/**
 * Picks the likeliest candidate, in order: an exact title match, then the right
 * release year, then a partial title match, then whatever TMDB ranked first.
 *
 * Year is checked after an exact match rather than before, because the model is
 * more reliable about titles than about dates.
 */
export const pickBestMediaMatch = (
  title: string,
  results: TMDBSearchResult[] = [],
  preferredMediaType?: "movie" | "tv" | "unknown",
  preferredYear?: number | null,
): TMDBSearchResult | null => {
  const candidates = results.filter(
    (result) =>
      result &&
      (result.media_type === "movie" ||
        result.media_type === "tv" ||
        preferredMediaType === "movie" ||
        preferredMediaType === "tv"),
  );
  if (!candidates.length) return null;

  const mediaFiltered =
    preferredMediaType && preferredMediaType !== "unknown"
      ? candidates.filter((result) => {
          const inferredType =
            result.media_type || ("name" in result ? "tv" : "movie");
          return inferredType === preferredMediaType;
        })
      : candidates;

  const pool = mediaFiltered.length ? mediaFiltered : candidates;
  const normalized = normalizeTitle(title);

  const exactMatch = pool.find(
    (result) => normalizeTitle(result.title || result.name || "") === normalized,
  );
  if (exactMatch) return exactMatch;

  if (preferredYear) {
    const yearMatch = pool.find((result) => resultYear(result) === preferredYear);
    if (yearMatch) return yearMatch;
  }

  const containsMatch = pool.find((result) =>
    normalizeTitle(result.title || result.name || "").includes(normalized),
  );
  return containsMatch || pool[0];
};

/** Resolves one suggested title, or null when TMDB has nothing for it. */
export const resolveSuggestedMedia = async (
  suggestion: SuggestedMediaInput,
): Promise<ResolvedMedia | null> => {
  try {
    const query = encodeURIComponent(suggestion.title);
    let response: { results?: TMDBSearchResult[] } | null = null;

    if (suggestion.mediaType === "movie") {
      response = await tmdb.searchMovie(query, 1);
    } else if (suggestion.mediaType === "tv") {
      response = await tmdb.searchTv(query, 1);
    } else {
      response = await tmdb.searchMulti(query, 1);
    }

    const results = Array.isArray(response?.results) ? response.results : [];
    const bestMatch = pickBestMediaMatch(
      suggestion.title,
      results,
      suggestion.mediaType,
      suggestion.year,
    );
    if (!bestMatch) return null;

    return {
      id: bestMatch.id,
      mediaType: (bestMatch.media_type ||
        ("name" in bestMatch ? "tv" : "movie")) as "movie" | "tv",
      title: bestMatch.title || bestMatch.name || suggestion.title,
      posterPath: bestMatch.poster_path || "",
      year: resultYear(bestMatch),
      reason: suggestion.reason,
    };
  } catch {
    // One title failing to resolve should not lose the rest of the list.
    return null;
  }
};

/**
 * Resolves a whole list, dropping anything TMDB could not find and any
 * duplicates two suggestions collapsed onto.
 */
export const resolveSuggestedMediaList = async (
  suggestions: SuggestedMediaInput[],
): Promise<ResolvedMedia[]> => {
  const resolved = await Promise.all(suggestions.map(resolveSuggestedMedia));
  const seen = new Set<string>();

  return resolved.filter((item): item is ResolvedMedia => {
    if (!item) return false;
    const key = `${item.mediaType}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
