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
}

export interface Message {
  message: string;
}

export interface CatchError {
  message: string;
  error: string;
}

export interface TokenResponse {
  token: string
}