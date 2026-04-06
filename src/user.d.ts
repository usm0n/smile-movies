export interface FavoriteMedia {
  id: string;
  title: string;
  type: "movie" | "tv";
  poster?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  productAnnouncements: boolean;
  newMovieReleases: boolean;
  newEpisodeReleases: boolean;
  newSeasonReleases: boolean;
  returningShows: boolean;
  recommendations: boolean;
  watchlistUpdates: boolean;
  digestMode: "instant" | "daily" | "weekly";
}

export interface PrivacySettings {
  showWatchlist: boolean;
  showFavorites: boolean;
  showRecentlyWatched?: boolean;
}

export type SavedMediaStatus =
  | "planned"
  | "watching"
  | "watched"
  | "favorite";

export type SavedMediaPreference =
  | "love"
  | "like"
  | "dislike";

export interface User {
  handle?: string;
  bio?: string;
  profilePic?: string;
  id: string;
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  createdAt: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  watchlist: Watchlist[];
  favorites: Watchlist[];
  recentlyWatched: Watchlist[];
  lastLogin: string;
  devices: Device[];
  loginType: string;
  roles?: string[];
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  favoriteMovies?: FavoriteMedia[];
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
}

export interface SavedMediaItem {
  poster: string;
  type: string;
  status: SavedMediaStatus | string;
  preference?: SavedMediaPreference;
  title?: string;
  duration?: number;
  currentTime?: number;
  id: string;
  season?: number;
  episode?: number;
  addedAt?: string;
  updatedAt?: string;
}

export type Watchlist = SavedMediaItem;

export interface Location {
  latitude: number;
  longitude: number;
  continent: string;
  country: string;
  state: string;
  county: string;
  road: string;
  lastSeen?: string;
}

export interface Device {
  deviceName: string;
  deviceType: string;
  deviceId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  location: Location;
}

export interface UserRegister {
  handle?: string;
  bio?: string;
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  profilePic?: string;
  isVerified?: boolean;
  deviceName: string;
  deviceType: string;
  deviceId: string;
  loginType: string;
  roles?: string[];
  deviceLocation: Location;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  favoriteMovies?: FavoriteMedia[];
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
}

export interface UserLogin {
  email: string;
  password: string;
  deviceName: string;
  deviceType: string;
  deviceId: string;
  deviceLocation?: Location;
}

export interface Message {
  message: string;
}

export interface CatchError {
  message: string;
  error: string;
}

export interface TokenResponse {
  token: string;
}

export interface GoogleUserResponse {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface ErrorResponse {
  status: number;
  data: Message;
}

export interface ResponseType {
  isLoading: boolean;
  isError?: boolean;
  data?: User | User[] | Message | null;
  isSuccess?: boolean;
  code?: number;
}
