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
