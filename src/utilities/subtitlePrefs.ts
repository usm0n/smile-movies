/**
 * Subtitle preferences.
 *
 * Community subtitles are timed against a specific release, and the stream a
 * provider hands us is rarely that exact release — so a track can be perfectly
 * correct and still run a second or two ahead of the audio. The player exposes
 * a delay control for that, and the value is remembered per title (per episode
 * for series) so the viewer nudges it once rather than every time they come
 * back.
 */

const OFFSET_PREFIX = "subtitle-offset:";
const APPEARANCE_KEY = "subtitle-appearance";

export const SUBTITLE_OFFSET_LIMIT_SECONDS = 30;

export type SubtitleAppearance = {
  /** Multiplier applied to the base caption font size. */
  fontScale: number;
  /** 0 = transparent cue background, 1 = solid. */
  backgroundOpacity: number;
};

export const DEFAULT_SUBTITLE_APPEARANCE: SubtitleAppearance = {
  fontScale: 1,
  backgroundOpacity: 0.5,
};

export const buildSubtitleOffsetKey = ({
  mediaType,
  mediaId,
  season,
  episode,
}: {
  mediaType?: string;
  mediaId?: string;
  season?: string | number;
  episode?: string | number;
}) => {
  if (!mediaType || !mediaId) return "";
  return `${OFFSET_PREFIX}${mediaType}:${mediaId}:${season || 0}:${episode || 0}`;
};

export const clampSubtitleOffset = (value: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(
    SUBTITLE_OFFSET_LIMIT_SECONDS,
    Math.max(-SUBTITLE_OFFSET_LIMIT_SECONDS, Math.round(parsed * 1000) / 1000),
  );
};

export const readSubtitleOffset = (key: string) => {
  if (typeof window === "undefined" || !key) return 0;
  return clampSubtitleOffset(Number(window.localStorage.getItem(key) || 0));
};

export const writeSubtitleOffset = (key: string, value: number) => {
  if (typeof window === "undefined" || !key) return;

  const offset = clampSubtitleOffset(value);
  if (!offset) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, String(offset));
};

export const formatSubtitleOffset = (value: number) => {
  const offset = clampSubtitleOffset(value);
  if (!offset) return "In sync";
  return `${offset > 0 ? "+" : "−"}${Math.abs(offset).toFixed(2)}s`;
};

export const readSubtitleAppearance = (): SubtitleAppearance => {
  if (typeof window === "undefined") return DEFAULT_SUBTITLE_APPEARANCE;

  try {
    const raw = window.localStorage.getItem(APPEARANCE_KEY);
    if (!raw) return DEFAULT_SUBTITLE_APPEARANCE;

    const parsed = JSON.parse(raw) as Partial<SubtitleAppearance>;
    return {
      fontScale: Number(parsed.fontScale) || DEFAULT_SUBTITLE_APPEARANCE.fontScale,
      backgroundOpacity: Number.isFinite(Number(parsed.backgroundOpacity))
        ? Number(parsed.backgroundOpacity)
        : DEFAULT_SUBTITLE_APPEARANCE.backgroundOpacity,
    };
  } catch {
    return DEFAULT_SUBTITLE_APPEARANCE;
  }
};

export const writeSubtitleAppearance = (appearance: SubtitleAppearance) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
};
