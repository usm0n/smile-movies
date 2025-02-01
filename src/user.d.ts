export interface User {
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
}

export interface UserRegister {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
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

export interface ResponseType {
  isLoading: boolean;
  isError: boolean;
  data?: User | User[] | Message | TokenResponse | null;
  errorResponse: any;
}
