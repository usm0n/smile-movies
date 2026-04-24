export type LibrarySort = "recent" | "added" | "title";

type DatedItem = {
  title?: string;
  addedAt?: string;
  updatedAt?: string;
  lastWatchedAt?: string;
  ratedAt?: string;
};

export const parseSavedDate = (value?: string) => {
  if (!value) return 0;
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/);
  if (!match) return 0;
  return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`).getTime();
};

export const getLibraryTimestamp = (item: DatedItem) =>
  parseSavedDate(
    item.lastWatchedAt ||
    item.ratedAt ||
    item.updatedAt ||
    item.addedAt,
  );

export const sortLibraryItems = <T extends DatedItem>(
  items: T[],
  sortBy: LibrarySort = "recent",
) => {
  const sorted = [...items];

  if (sortBy === "title") {
    return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  if (sortBy === "added") {
    return sorted.sort((a, b) => parseSavedDate(b.addedAt) - parseSavedDate(a.addedAt));
  }

  return sorted.sort((a, b) => getLibraryTimestamp(b) - getLibraryTimestamp(a));
};
