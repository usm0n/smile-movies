export interface User {
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
}

export interface Watchlist {
  id: string;
  type: string;
  poster: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  continent: string;
  country: string;
  state: string;
  county: string;
  road: string;
  town: string;
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
  deviceLocation: Location;
}
export interface UserLogin {
  email: string;
  password: string;
  deviceName: string;
  deviceType: string;
  deviceId: string;
  deviceLocation: Location;
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

export interface ResponseType {
  isLoading: boolean;
  isError: boolean;
  data?: User | User[] | Message | TokenResponse | null;
  errorResponse: any;
  isSuccess?: boolean;
  isIncorrect?: boolean;
  isConflict?: boolean;
}
