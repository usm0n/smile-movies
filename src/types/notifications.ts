export type NotificationChannel = "email" | "push" | "in_app";

export type NotificationEventType =
  | "movie_release"
  | "series_premiere"
  | "episode_release"
  | "season_release"
  | "returning_show"
  | "product_announcement";

export interface NotificationHistoryItem {
  id: string;
  channel: NotificationChannel;
  status: "sent" | "failed" | "unsubscribed";
  subject: string;
  bodyPreview: string;
  createdAt: string;
  createdAtMs: number;
  eventType: NotificationEventType;
  title: string;
  /** In-app path for the title this is about, e.g. `/tv/1399`. */
  path: string;
  posterPath: string;
  read: boolean;
}

export interface NotificationInbox {
  items: NotificationHistoryItem[];
  unreadCount: number;
}

export interface PushDevice {
  id: string;
  deviceId: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface PushDevicesResponse {
  configured: boolean;
  devices: PushDevice[];
}
