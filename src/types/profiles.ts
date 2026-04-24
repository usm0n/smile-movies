import { RatingItem, RecentlyWatchedItem, Watchlist } from "../user";

export interface PublicProfileResponse {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  avatar: string;
  joinedAt: string;
  lastSeen: string;
  visibility: {
    watchlist: boolean;
    recentlyWatched: boolean;
    ratings: boolean;
  };
  counts: {
    watchlist: number;
    recentlyWatched: number;
    ratings: number;
  };
  watchlist?: Watchlist[];
  recentlyWatched?: RecentlyWatchedItem[];
  ratings?: RatingItem[];
}
