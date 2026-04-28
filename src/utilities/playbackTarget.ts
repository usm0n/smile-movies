import { RecentlyWatchedItem } from "../user";

export const getDefaultPlaybackEpisode = (mediaType: "movie" | "tv") => ({
  season: mediaType === "tv" ? 1 : 0,
  episode: mediaType === "tv" ? 1 : 0,
});

export const getPlaybackTarget = ({
  mediaType,
  mediaId,
  recentItem,
}: {
  mediaType: "movie" | "tv";
  mediaId: string | number;
  recentItem?: RecentlyWatchedItem;
}) => {
  const defaults = getDefaultPlaybackEpisode(mediaType);
  const hasPartialProgress = Number(recentItem?.currentTime || 0) > 0;
  const season = mediaType === "tv"
    ? (
      hasPartialProgress
        ? recentItem?.currentSeason
        : recentItem?.nextSeason || recentItem?.currentSeason
    ) || defaults.season
    : defaults.season;
  const episode = mediaType === "tv"
    ? (
      hasPartialProgress
        ? recentItem?.currentEpisode
        : recentItem?.nextEpisode || recentItem?.currentEpisode
    ) || defaults.episode
    : defaults.episode;
  const startAt = hasPartialProgress ? Number(recentItem?.currentTime || 0) : 0;

  return {
    season,
    episode,
    startAt,
    route: recentItem
      ? `/${mediaType}/${mediaId}${mediaType === "tv" ? `/${season}/${episode}` : ""}/watch/${startAt}`
      : `/${mediaType}/${mediaId}${mediaType === "tv" ? `/${season}/${episode}` : ""}/watch`,
  };
};

export const getStartOverTarget = ({
  mediaType,
  mediaId,
  recentItem,
  mode,
}: {
  mediaType: "movie" | "tv";
  mediaId: string | number;
  recentItem?: RecentlyWatchedItem;
  mode?: "episode" | "series";
}) => {
  if (mediaType === "movie") {
    return {
      season: 0,
      episode: 0,
      startAt: 0,
      route: `/${mediaType}/${mediaId}/watch/0`,
    };
  }

  const defaults = getDefaultPlaybackEpisode("tv");
  const fallbackSeason = recentItem?.currentSeason || defaults.season;
  const fallbackEpisode = recentItem?.currentEpisode || defaults.episode;
  const isSeriesStart = mode === "series";
  const season = isSeriesStart ? defaults.season : fallbackSeason;
  const episode = isSeriesStart ? defaults.episode : fallbackEpisode;

  return {
    season,
    episode,
    startAt: 0,
    route: `/tv/${mediaId}/${season}/${episode}/watch/0`,
  };
};

export const buildPlaybackAvailabilityKey = ({
  mediaType,
  tmdbId,
  season,
  episode,
}: {
  mediaType: "movie" | "tv";
  tmdbId: string | number;
  season?: number;
  episode?: number;
}) =>
  `${mediaType}:${tmdbId}:${mediaType === "tv" ? `${season || 0}:${episode || 0}` : "0:0"}`;
