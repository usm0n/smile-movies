import { Watchlist } from "../user";

export interface PublicTasteSummary {
  totalSignals: number;
  loved: number;
  liked: number;
  disliked: number;
  noReaction: number;
  topFavorites: Array<{
    id: string;
    title: string;
    type: string;
    poster: string;
  }>;
}

export interface PublicProfileResponse {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  avatar: string;
  joinedAt: string;
  lastSeen: string;
  favoriteMovies: Array<{
    id: string;
    title: string;
    type: "movie" | "tv";
    poster?: string;
  }>;
  visibility: {
    favorites: boolean;
    watchlist: boolean;
    recentlyWatched: boolean;
  };
  counts: {
    favorites: number;
    watchlist: number;
    recentlyWatched: number;
  };
  tasteSummary: PublicTasteSummary;
  recentlyWatched?: Watchlist[];
}
