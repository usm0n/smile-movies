const hasAnimationGenreName = (genres?: Array<{ name?: string }>) =>
  Array.isArray(genres) &&
  genres.some((genre) => String(genre?.name || "").toLowerCase() === "animation");

const hasAnimationGenreId = (genreIds?: number[]) =>
  Array.isArray(genreIds) && genreIds.some((genreId) => Number(genreId) === 16);

const hasJapaneseSignal = ({
  originalLanguage,
  countries,
}: {
  originalLanguage?: string;
  countries?: string[];
}) => {
  const normalizedLanguage = String(originalLanguage || "").toLowerCase();
  const hasJaLanguage = normalizedLanguage === "ja";
  const hasJapanCountry = (countries || []).some(
    (country) => String(country).toUpperCase() === "JP",
  );

  return hasJaLanguage || hasJapanCountry;
};

export const isLikelyAnimeFromDetails = (details: {
  genres?: Array<{ name?: string }>;
  original_language?: string;
  origin_country?: string[];
}) =>
  hasAnimationGenreName(details?.genres) &&
  hasJapaneseSignal({
    originalLanguage: details?.original_language,
    countries: details?.origin_country,
  });

export const isLikelyAnimeFromSummary = (item: {
  genre_ids?: number[];
  original_language?: string;
  origin_country?: string[];
}) =>
  hasAnimationGenreId(item?.genre_ids) &&
  hasJapaneseSignal({
    originalLanguage: item?.original_language,
    countries: item?.origin_country,
  });
