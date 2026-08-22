import { NotificationEventType } from "../../types/notifications";

/**
 * Presentation helpers shared by the bell and the notifications page, so the
 * two never drift into describing the same event differently.
 */

export const eventTypeLabel = (eventType: NotificationEventType): string => {
  switch (eventType) {
    case "movie_release":
      return "New movie";
    case "series_premiere":
      return "New series";
    case "episode_release":
      return "New episode";
    case "season_release":
      return "New season";
    case "returning_show":
      return "Returning";
    case "product_announcement":
      return "Announcement";
    default:
      return "Update";
  }
};

export const posterUrl = (posterPath: string): string =>
  posterPath ? `https://image.tmdb.org/t/p/w154${posterPath}` : "";

/**
 * "3h ago" rather than "22.08.2026 14:05".
 *
 * An inbox is read by recency — the question is "is this new?", not "what date
 * was it?". Rows written before `createdAtMs` existed fall back to the stored
 * `dd.MM.yyyy HH:mm` string, which is at least honest about being a timestamp.
 */
export const relativeTime = (createdAtMs: number, fallback: string): string => {
  if (!createdAtMs) return fallback;

  const seconds = Math.floor((Date.now() - createdAtMs) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(createdAtMs).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
