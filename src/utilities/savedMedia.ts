import { SavedMediaItem } from "../user";

export type SavedMediaSort = "recent" | "added" | "title" | "status";
export type SavedMediaStatusFilter = "all" | "watching" | "planned" | "watched";
export type SavedMediaTypeFilter = "all" | "movie" | "tv";
export type SavedMediaPreferenceFilter =
  | "all"
  | "love"
  | "like"
  | "dislike"
  | "none";

export const normalizeSavedStatus = (status?: string) => {
  if (!status || status === "new" || status === "will_watch") return "planned";
  return status;
};

export const parseSavedDate = (value?: string) => {
  if (!value) return 0;
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/);
  if (!match) return 0;
  return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`).getTime();
};

export const sortSavedItems = (
  items: SavedMediaItem[],
  sortBy: SavedMediaSort = "recent",
) => {
  const sorted = [...items];

  if (sortBy === "title") {
    return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  if (sortBy === "status") {
    return sorted.sort((a, b) =>
      normalizeSavedStatus(a.status).localeCompare(normalizeSavedStatus(b.status)),
    );
  }

  if (sortBy === "added") {
    return sorted.sort(
      (a, b) => parseSavedDate(b.addedAt) - parseSavedDate(a.addedAt),
    );
  }

  return sorted.sort(
    (a, b) =>
      parseSavedDate(b.updatedAt || b.addedAt) -
      parseSavedDate(a.updatedAt || a.addedAt),
  );
};

export const filterSavedItems = (
  items: SavedMediaItem[],
  statusFilter: SavedMediaStatusFilter,
  mediaFilter: SavedMediaTypeFilter,
  preferenceFilter: SavedMediaPreferenceFilter = "all",
) =>
  items.filter((item) => {
    const statusMatch =
      statusFilter === "all" || normalizeSavedStatus(item.status) === statusFilter;
    const mediaMatch = mediaFilter === "all" || item.type === mediaFilter;
    const preferenceMatch =
      preferenceFilter === "all" ||
      (preferenceFilter === "none"
        ? !item.preference
        : item.preference === preferenceFilter);
    return statusMatch && mediaMatch && preferenceMatch;
  });
