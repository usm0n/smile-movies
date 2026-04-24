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

export interface NotificationInterests {
  followedShows: string[];
  followedGenres: string[];
  followedActors: string[];
  followedDirectors: string[];
  tasteKeywords: string[];
}

export interface PrivacySettings {
  showWatchlist: boolean;
  showRecentlyWatched: boolean;
  showRatings: boolean;
}

export interface WatchlistItem {
  id: string;
  type: "movie" | "tv";
  title?: string;
  poster?: string;
  addedAt?: string;
  updatedAt?: string;
}

export interface RecentlyWatchedItem {
  id: string;
  type: "movie" | "tv";
  title?: string;
  poster?: string;
  duration?: number;
  currentTime?: number;
  lastWatchedAt?: string;
  currentSeason?: number;
  currentEpisode?: number;
  nextSeason?: number;
  nextEpisode?: number;
}

export interface RatingItem {
  id: string;
  type: "movie" | "tv";
  title?: string;
  poster?: string;
  rating: number;
  ratedAt?: string;
}

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
  watchlist: WatchlistItem[];
  recentlyWatched: RecentlyWatchedItem[];
  ratings: RatingItem[];
  lastLogin: string;
  devices: Device[];
  loginType: string;
  roles?: string[];
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  notifications?: NotificationPreferences;
  notificationInterests?: NotificationInterests;
  privacy?: PrivacySettings;
}

export type Watchlist = WatchlistItem;

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
  notifications?: NotificationPreferences;
  notificationInterests?: NotificationInterests;
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
