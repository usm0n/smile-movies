/**
 * IMDb's view of a title, for the detail page.
 *
 * TMDB stays the catalog — ids, artwork, discovery — while IMDb supplies the
 * things it is actually authoritative on: keywords, per-country certificates,
 * box office, awards, chart position and technical specs. One request per
 * title resolves all of it, plus the item counts that tell the page which
 * optional sections have anything to show.
 *
 * Cached for the session so the header badge and the sections below it read
 * one result instead of racing each other for the same data.
 */

import { useEffect, useState } from "react";
import {
  ImdbTitleDetails,
  fetchImdbDetails,
  resolveImdbId,
} from "../service/api/imdb/imdb.api.service";

export type ImdbTitleDetailsState = {
  isLoading: boolean;
  /** tt-ID of the title, once resolved from its TMDB id. */
  imdbId: string;
  details: ImdbTitleDetails | null;
};

const EMPTY_STATE: ImdbTitleDetailsState = {
  isLoading: false,
  imdbId: "",
  details: null,
};

const cache = new Map<string, ImdbTitleDetailsState>();

/**
 * The header badge and the sections below it mount in the same commit, so
 * without this they would each start their own resolve + details round trip.
 * Concurrent callers for one title share a single request.
 */
const inFlight = new Map<string, Promise<ImdbTitleDetailsState>>();

function loadDetails(
  cacheKey: string,
  mediaId: string | number,
  mediaType: "movie" | "tv",
): Promise<ImdbTitleDetailsState> {
  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    const resolved: ImdbTitleDetailsState = { ...EMPTY_STATE };

    try {
      const imdbId = await resolveImdbId(mediaId, mediaType);
      if (!imdbId) return resolved;
      resolved.imdbId = imdbId;
      resolved.details = await fetchImdbDetails(imdbId);
    } catch {
      // Every section below is optional; the page renders without them.
    }

    cache.set(cacheKey, resolved);
    return resolved;
  })().finally(() => {
    inFlight.delete(cacheKey);
  });

  inFlight.set(cacheKey, request);
  return request;
}

export function useImdbTitleDetails({
  mediaType,
  mediaId,
}: {
  mediaType?: "movie" | "tv";
  mediaId?: string | number;
}): ImdbTitleDetailsState {
  const cacheKey = mediaType && mediaId ? `${mediaType}:${mediaId}` : "";
  const [state, setState] = useState<ImdbTitleDetailsState>(
    () => (cacheKey && cache.get(cacheKey)) || EMPTY_STATE,
  );

  useEffect(() => {
    if (!cacheKey || !mediaId || !mediaType) {
      setState(EMPTY_STATE);
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached) {
      setState(cached);
      return;
    }

    let cancelled = false;
    setState({ ...EMPTY_STATE, isLoading: true });

    void loadDetails(cacheKey, mediaId, mediaType).then((resolved) => {
      if (!cancelled) setState(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, mediaId, mediaType]);

  return state;
}
