import { ReleaseResponse } from "./public";
import { ReviewRecord } from "./reviews";

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
    lastRunAt?: string;
    deliveryMode: "smtp" | "log";
    readiness: {
      tmdbConfigured: boolean;
      mailConfigured: boolean;
      schedulerConfigured: boolean;
      clientUrlConfigured: boolean;
    };
    schedules: {
      tmdbSync: string;
      instantDelivery: string;
      digestDelivery: string;
      scheduledCycle: string;
      endpointEnabled: boolean;
      systemEndpoint: string;
    };
  };
  jobRuns: Array<{
    id?: string;
    jobType: "tmdb_sync" | "instant_delivery" | "digest_delivery" | "scheduled_cycle";
    status: "running" | "completed" | "failed";
    trigger: "admin" | "worker" | "system";
    startedAt: string;
    finishedAt?: string;
    error?: string;
    summary?: Record<string, unknown>;
  }>;
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

export type AdminModerationItem = ReviewRecord;
