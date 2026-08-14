/**
 * Anime audio preference (subbed / dubbed).
 *
 * Anime is the one thing on the site that ships in two audio versions, and the
 * control for switching lives behind the sources sheet — far enough away that
 * viewers who land on the wrong one assume the site simply has no dub. So the
 * first anime a viewer opens asks the question outright, and the answer is
 * remembered from then on: a global default they picked once, plus a per-title
 * override for the shows they watch the other way round.
 */

import { AnimeMode } from "../types/providers";

const DEFAULT_KEY = "anime-audio-preference";
const TITLE_PREFIX = "anime-audio-preference:";

const normalize = (value: unknown): AnimeMode | null => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "sub" || normalized === "dub") return normalized;
  return null;
};

export const buildAnimePrefKey = (
  mediaType?: string,
  mediaId?: string,
): string => {
  if (!mediaType || !mediaId) return "";
  return `${TITLE_PREFIX}${mediaType}:${mediaId}`;
};

/** The viewer's answer for this specific title, if they gave one. */
export const readAnimeVersionForTitle = (
  mediaType?: string,
  mediaId?: string,
): AnimeMode | null => {
  if (typeof window === "undefined") return null;
  const key = buildAnimePrefKey(mediaType, mediaId);
  if (!key) return null;
  return normalize(window.localStorage.getItem(key));
};

/** The answer they gave the first time they were asked, for any title. */
export const readAnimeVersionDefault = (): AnimeMode | null => {
  if (typeof window === "undefined") return null;
  return normalize(window.localStorage.getItem(DEFAULT_KEY));
};

/**
 * What this title should play as, or null when we have never been told and
 * should ask instead of guessing.
 */
export const readAnimeVersion = (
  mediaType?: string,
  mediaId?: string,
): AnimeMode | null =>
  readAnimeVersionForTitle(mediaType, mediaId) || readAnimeVersionDefault();

export const writeAnimeVersion = (
  version: AnimeMode,
  mediaType?: string,
  mediaId?: string,
  options?: { setDefault?: boolean },
) => {
  if (typeof window === "undefined") return;
  const normalized = normalize(version);
  if (!normalized) return;

  const key = buildAnimePrefKey(mediaType, mediaId);
  if (key) {
    window.localStorage.setItem(key, normalized);
  }

  // The global default is only seeded by the first answer — later per-title
  // switches are about that title, not a change of habit.
  if (options?.setDefault !== false && !readAnimeVersionDefault()) {
    window.localStorage.setItem(DEFAULT_KEY, normalized);
  }
};

/** Used by settings-style surfaces that mean "change my default everywhere". */
export const writeAnimeVersionDefault = (version: AnimeMode) => {
  if (typeof window === "undefined") return;
  const normalized = normalize(version);
  if (!normalized) return;
  window.localStorage.setItem(DEFAULT_KEY, normalized);
};
