/**
 * IMDb facts about the thing currently on screen.
 *
 * The detail page shows the *title's* rating, which for a series is an average
 * across hundreds of episodes and says nothing about the one playing. So the
 * player resolves the episode too: TMDB gives us the series' tt-ID, IMDb's
 * season listing gives us the episode's own tt-ID, rating and plot. Movies stop
 * after the first step.
 *
 * One request set per episode, cached for the session — the panel and the chip
 * in the title bar read the same result rather than fetching twice.
 */

import { useEffect, useState } from "react";
import {
  ImdbEpisode,
  fetchImdbEpisodesBySeason,
  fetchImdbTitle,
  resolveImdbId,
} from "../service/api/imdb/imdb.api.service";

export type ImdbWatchInfo = {
  isLoading: boolean;
  /** tt-ID of the movie, or of the series for a TV episode. */
  titleImdbId: string;
  /** tt-ID of the episode itself — the one the parental guide should use. */
  episodeImdbId: string;
  /** Rating of what is playing: the episode for TV, the movie otherwise. */
  rating: number;
  voteCount: number;
  /** Series-level rating, so an episode can be read against its show. */
  seriesRating: number;
  /** IMDb's episode plot, which is often fuller than TMDB's overview. */
  plot: string;
};

const EMPTY_INFO: ImdbWatchInfo = {
  isLoading: false,
  titleImdbId: "",
  episodeImdbId: "",
  rating: 0,
  voteCount: 0,
  seriesRating: 0,
  plot: "",
};

const cache = new Map<string, ImdbWatchInfo>();

export function useImdbWatchInfo({
  mediaType,
  mediaId,
  season,
  episode,
}: {
  mediaType?: string;
  mediaId?: string;
  season?: string | number;
  episode?: string | number;
}): ImdbWatchInfo {
  const isSeries = mediaType === "tv";
  const seasonNumber = Number(season || 0);
  const episodeNumber = Number(episode || 0);
  const cacheKey =
    mediaType && mediaId
      ? `${mediaType}:${mediaId}:${isSeries ? seasonNumber : 0}:${
        isSeries ? episodeNumber : 0
      }`
      : "";
  const [info, setInfo] = useState<ImdbWatchInfo>(
    () => (cacheKey && cache.get(cacheKey)) || EMPTY_INFO,
  );

  useEffect(() => {
    if (!cacheKey || !mediaId || !mediaType) {
      setInfo(EMPTY_INFO);
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached) {
      setInfo(cached);
      return;
    }

    let cancelled = false;
    setInfo({ ...EMPTY_INFO, isLoading: true });

    void (async () => {
      const resolved: ImdbWatchInfo = { ...EMPTY_INFO };

      try {
        const titleImdbId = await resolveImdbId(
          mediaId,
          isSeries ? "tv" : "movie",
        );
        if (!titleImdbId) return;
        resolved.titleImdbId = titleImdbId;

        const title = await fetchImdbTitle(titleImdbId);
        const titleRating = Number(title?.rating?.aggregateRating || 0);

        if (!isSeries) {
          resolved.rating = titleRating;
          resolved.voteCount = Number(title?.rating?.voteCount || 0);
          return;
        }

        resolved.seriesRating = titleRating;
        if (!seasonNumber || !episodeNumber) {
          resolved.rating = titleRating;
          resolved.voteCount = Number(title?.rating?.voteCount || 0);
          return;
        }

        const episodes = await fetchImdbEpisodesBySeason(titleImdbId, seasonNumber);
        const match = (episodes || []).find(
          (item: ImdbEpisode) => Number(item?.episodeNumber) === episodeNumber,
        );
        if (!match) return;

        resolved.episodeImdbId = String(match.id || "");
        resolved.rating = Number(match.rating?.aggregateRating || 0);
        resolved.voteCount = Number(match.rating?.voteCount || 0);
        resolved.plot = String(match.plot || "");
      } catch {
        // IMDb is a garnish here — the episode still plays without it.
      } finally {
        if (!cancelled) {
          cache.set(cacheKey, resolved);
          setInfo(resolved);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, episodeNumber, isSeries, mediaId, mediaType, seasonNumber]);

  return info;
}
