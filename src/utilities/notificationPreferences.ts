import { NotificationPreferences } from "../user";

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  productAnnouncements: true,
  newMovieReleases: true,
  newEpisodeReleases: true,
  newSeasonReleases: true,
  returningShows: true,
  recommendations: true,
  watchlistUpdates: true,
  digestMode: "instant",
};

export const notificationToggleOptions: Array<{
  key: keyof Omit<NotificationPreferences, "digestMode">;
  label: string;
  description: string;
}> = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Allow Smile Movies to send account and release emails.",
  },
  {
    key: "productAnnouncements",
    label: "Product announcements",
    description: "Get release notes, major launches, and manual campaigns.",
  },
  {
    key: "newMovieReleases",
    label: "New movie releases",
    description: "Alert me when tracked movies release.",
  },
  {
    key: "newEpisodeReleases",
    label: "New episodes",
    description: "Alert me when followed or tracked shows drop new episodes.",
  },
  {
    key: "newSeasonReleases",
    label: "New seasons",
    description: "Alert me when a show starts a new season.",
  },
  {
    key: "returningShows",
    label: "Returning shows",
    description: "Alert me when dormant series return with new activity.",
  },
  {
    key: "recommendations",
    label: "Recommendations",
    description: "Get personalized picks based on your taste profile.",
  },
  {
    key: "watchlistUpdates",
    label: "Watchlist updates",
    description: "Alert me when saved titles change status or become relevant.",
  },
];

export const notificationDigestOptions: Array<{
  value: NotificationPreferences["digestMode"];
  label: string;
  description: string;
}> = [
  {
    value: "instant",
    label: "Instant",
    description: "Send important updates as they happen.",
  },
  {
    value: "daily",
    label: "Daily digest",
    description: "Bundle updates into a once-a-day summary.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "Bundle updates into a once-a-week summary.",
  },
];
