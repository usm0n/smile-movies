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
  watchlist: { id: string; type: string }[];
  favorites: {
    id: string;
    type: string;
  }[];
}

export interface UserRegister {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  profilePic?: string;
  isVerified?: boolean;
}
export interface UserLogin {
  email: string;
  password: string;
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
