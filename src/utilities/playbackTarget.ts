import { SavedMediaItem } from "../user";

export const getDefaultPlaybackEpisode = (mediaType: "movie" | "tv") => ({
  season: mediaType === "tv" ? 1 : 0,
  episode: mediaType === "tv" ? 1 : 0,
});

export const getPlaybackTarget = ({
  mediaType,
  mediaId,
  watchlistItem,
}: {
  mediaType: "movie" | "tv";
  mediaId: string | number;
  watchlistItem?: SavedMediaItem;
}) => {
  const defaults = getDefaultPlaybackEpisode(mediaType);
  const season = watchlistItem?.season || defaults.season;
  const episode = watchlistItem?.episode || defaults.episode;
  const startAt = watchlistItem?.currentTime || 0;

  return {
    season,
    episode,
    startAt,
    route: watchlistItem
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
