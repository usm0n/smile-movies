import { movieDetails, tvDetails } from "../tmdb-res";

/**
 * Anime detection.
 *
 * The API decides whether AnimeKai can serve a title with
 * `isLikelyAnimeFromTmdb` (see `anikai.service.ts`): the animation genre plus
 * either a Japanese original language or a Japanese origin country. The client
 * mirrors that rule exactly so the provider we pre-select is the same one the
 * server would accept — picking AnimeKai for a title it will reject only earns
 * the viewer a failed request and a spinner.
 */

const ANIMATION_GENRE_ID = 16;

const hasAnimationGenre = (genres?: { id?: number; name?: string }[]) =>
  (genres || []).some(
    (genre) =>
      genre?.id === ANIMATION_GENRE_ID ||
      String(genre?.name || "").toLowerCase() === "animation",
  );

const isJapanese = (
  originalLanguage?: string,
  originCountries: (string | undefined)[] = [],
) =>
  String(originalLanguage || "").toLowerCase() === "ja" ||
  originCountries.some((country) => String(country || "").toUpperCase() === "JP");

export const isAnimeMovie = (details?: movieDetails | null) => {
  if (!details) return false;

  return (
    hasAnimationGenre(details.genres) &&
    isJapanese(
      details.original_language,
      (details.production_countries || []).map((country) => country?.iso_3166_1),
    )
  );
};

export const isAnimeSeries = (details?: tvDetails | null) => {
  if (!details) return false;

  return (
    hasAnimationGenre(details.genres) &&
    isJapanese(details.original_language, details.origin_country || [])
  );
};

export const isAnimeTitle = (
  mediaType: string | undefined,
  details: movieDetails | tvDetails | null | undefined,
) =>
  mediaType === "tv"
    ? isAnimeSeries(details as tvDetails)
    : isAnimeMovie(details as movieDetails);
