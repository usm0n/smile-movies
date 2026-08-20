import { useCallback, useEffect, useState } from "react";
import { tmdb } from "../service/api/tmdb/tmdb.api.service";
import { aiService, PriorEpisodeInput } from "../service/api/ai/ai.api.service";
import type { tvSeasonsDetails } from "../tmdb-res";

/**
 * "What happened before this episode?" — the data half.
 *
 * Two surfaces need this: the player's info panel and the details hero, where
 * the episode comes from the viewer's saved progress. They differ only in
 * whether the season's episodes are already loaded, so that is the one thing
 * this takes as an option.
 *
 * Crossing a season boundary is handled here rather than at either call site.
 * Opening episode 1 of season 3 should recap the end of season 2 — that is
 * exactly the moment someone needs reminding — and neither caller had the
 * previous season's episodes to hand.
 */

/** Enough of the previous season to close out its arcs without drowning the recap. */
const PREVIOUS_SEASON_TAIL = 4;

export type EpisodeRecapState = {
  recap: string;
  beats: string[];
  /** Set when there is genuinely nothing before this episode. */
  unavailable: string;
  isLoading: boolean;
  error: string;
  /** The last episode the recap covers, for the "covers nothing past…" note. */
  coversThrough: { seasonNumber: number; episodeNumber: number } | null;
};

const EMPTY: EpisodeRecapState = {
  recap: "",
  beats: [],
  unavailable: "",
  isLoading: false,
  error: "",
  coversThrough: null,
};

const toPriorEpisodes = (
  season: tvSeasonsDetails | null,
  seasonNumber: number,
  upToEpisode: number | null,
): PriorEpisodeInput[] =>
  (season?.episodes || [])
    .filter((episode) => {
      const number = Number(episode?.episode_number);
      if (!Number.isFinite(number) || number <= 0) return false;
      return upToEpisode === null || number < upToEpisode;
    })
    .sort((a, b) => Number(a?.episode_number) - Number(b?.episode_number))
    .map((episode) => ({
      seasonNumber,
      episodeNumber: Number(episode?.episode_number) || 0,
      name: String(episode?.name || ""),
      overview: String(episode?.overview || ""),
    }));

const fetchSeason = async (
  tmdbId: string,
  seasonNumber: number,
): Promise<tvSeasonsDetails | null> => {
  try {
    const response = await tmdb.tvSeasonsDetails(tmdbId, seasonNumber);
    if (!response || "response" in response) return null;
    return response as tvSeasonsDetails;
  } catch {
    return null;
  }
};

export function useEpisodeRecap({
  tmdbId,
  title,
  seasonNumber,
  episodeNumber,
  seedEpisodes,
  enabled,
}: {
  tmdbId: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  /** The current season's episodes, when the caller already has them. */
  seedEpisodes?: PriorEpisodeInput[];
  enabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<EpisodeRecapState>(EMPTY);

  // A new episode invalidates whatever was showing.
  useEffect(() => {
    setIsOpen(false);
    setState(EMPTY);
  }, [tmdbId, seasonNumber, episodeNumber]);

  const load = useCallback(async () => {
    setState({ ...EMPTY, isLoading: true });

    try {
      let priorEpisodes: PriorEpisodeInput[] = seedEpisodes?.length
        ? seedEpisodes.filter((episode) => episode.episodeNumber < episodeNumber)
        : toPriorEpisodes(await fetchSeason(tmdbId, seasonNumber), seasonNumber, episodeNumber);

      /**
       * At the start of a season the story so far lives in the previous one.
       * This is the case the recap is most useful for, so it is worth the
       * extra request rather than saying "nothing to recap".
       */
      if (!priorEpisodes.length && seasonNumber > 1) {
        const previous = await fetchSeason(tmdbId, seasonNumber - 1);
        priorEpisodes = toPriorEpisodes(previous, seasonNumber - 1, null).slice(
          -PREVIOUS_SEASON_TAIL,
        );
      }

      if (!priorEpisodes.length) {
        setState({
          ...EMPTY,
          unavailable: "This is the very start — there's nothing to recap yet.",
        });
        return;
      }

      const last = priorEpisodes[priorEpisodes.length - 1];
      const result = await aiService.recap({
        title,
        seasonNumber,
        episodeNumber,
        priorEpisodes,
      });

      setState({
        recap: result.recap || "",
        beats: result.beats || [],
        unavailable: result.unavailable || "",
        isLoading: false,
        error: "",
        coversThrough: {
          seasonNumber: last.seasonNumber,
          episodeNumber: last.episodeNumber,
        },
      });
    } catch {
      setState({ ...EMPTY, error: "Could not build a recap right now." });
    }
  }, [episodeNumber, seasonNumber, seedEpisodes, title, tmdbId]);

  const open = useCallback(() => {
    if (!enabled || isOpen) return;
    setIsOpen(true);
    void load();
  }, [enabled, isOpen, load]);

  return { isOpen, open, retry: load, ...state };
}
