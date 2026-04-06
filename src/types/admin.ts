import { ReleaseResponse } from "./public";

export type AdminRole = "user" | "admin" | "moderator" | "support" | "content_manager";

export interface AdminUserSummary {
  id: string;
  firstname: string;
  lastname?: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  roles: AdminRole[];
  deviceCount: number;
  watchlistCount: number;
  favoritesCount: number;
}

export interface AdminNotificationOverview {
  totalUsers: number;
  emailEnabled: number;
  productAnnouncements: number;
  newMovieReleases: number;
  newEpisodeReleases: number;
  newSeasonReleases: number;
  returningShows: number;
  recommendations: number;
  watchlistUpdates: number;
  digestCounts: {
    instant: number;
    daily: number;
    weekly: number;
  };
  queue: {
    status: string;
    queuedCandidates: number;
    pendingDigests: number;
    deliveryFailures: number;
    sentDeliveries: number;
    releaseEvents: number;
  };
}

export interface AdminBootstrapStatus {
  canBootstrap: boolean;
  reason: string;
  adminCount: number;
  matchedByEmail: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  actorUid: string;
  targetUid: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export type AdminReleaseList = ReleaseResponse[];
