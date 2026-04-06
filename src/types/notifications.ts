export interface NotificationHistoryItem {
  id: string;
  status: "sent" | "failed" | "unsubscribed";
  subject: string;
  bodyPreview: string;
  createdAt: string;
  eventType: "movie_release" | "episode_release" | "season_release" | "returning_show";
  title: string;
}
