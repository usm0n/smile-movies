/** Mirrors the connector shapes returned by the API. */

export type IdentityProvider =
  | "password"
  | "google.com"
  | "apple.com"
  | "phone";

export interface Identity {
  provider: IdentityProvider;
  subject: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  linkedAt: string;
  lastUsedAt?: string;
}

export interface AccountEmail {
  email: string;
  isPrimary: boolean;
  isVerified: boolean;
  addedAt: string;
}

export interface TelegramLink {
  chatId: string;
  username?: string;
  firstName?: string;
  linkedAt: string;
}

export interface ConnectorsResponse {
  identities: Identity[];
  emails: AccountEmail[];
  phone: string;
  isPhoneVerified: boolean;
  telegram: TelegramLink | null;
  hasPassword: boolean;
  /** False when only one sign-in method remains — nothing may be removed. */
  canUnlink: boolean;
  updatedAt: string;
}

export const providerLabel = (provider: IdentityProvider): string => {
  switch (provider) {
    case "google.com":
      return "Google";
    case "apple.com":
      return "Apple";
    case "phone":
      return "Phone";
    default:
      return "Email & password";
  }
};
