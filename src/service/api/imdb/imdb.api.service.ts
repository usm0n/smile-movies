import { imdbAPI, tmdbAPI } from "../api";

export interface ImdbRating {
  aggregateRating: number;
  voteCount: number;
}

export interface ImdbEpisode {
  id: string;
  title: string;
  season: string;
  episodeNumber: number;
  rating?: ImdbRating;
  plot?: string;
  releaseDate?: { year?: number; month?: number; day?: number };
}

export interface ImdbTitle {
  id: string;
  primaryTitle: string;
  rating?: ImdbRating;
}

// Resolve TMDB ID → IMDb tt ID using TMDB external_ids endpoint
export async function resolveImdbId(
  tmdbId: string | number,
  mediaType: "movie" | "tv"
): Promise<string | null> {
  try {
    const res = await tmdbAPI.get(`/${mediaType}/${tmdbId}/external_ids`);
    return res.data?.imdb_id ?? null;
  } catch {
    return null;
  }
}

// Fetch IMDb title details (includes aggregate rating)
export async function fetchImdbTitle(imdbId: string): Promise<ImdbTitle | null> {
  try {
    const res = await imdbAPI.get(`/titles/${imdbId}`);
    return res.data as ImdbTitle;
  } catch {
    return null;
  }
}

// Fetch all episodes for a given season, handling pagination (max 50/page)
export async function fetchImdbEpisodesBySeason(
  imdbId: string,
  season: number
): Promise<ImdbEpisode[]> {
  const episodes: ImdbEpisode[] = [];
  let pageToken: string | undefined;

  do {
    try {
      const params: Record<string, string | number> = {
        season: String(season),
        pageSize: 50,
      };
      if (pageToken) params.pageToken = pageToken;
      const res = await imdbAPI.get(`/titles/${imdbId}/episodes`, { params });
      const data = res.data;
      if (data?.episodes?.length) episodes.push(...data.episodes);
      pageToken = data?.nextPageToken;
    } catch {
      break;
    }
  } while (pageToken);

  return episodes;
}
