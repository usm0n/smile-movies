import { NotificationInterests, NotificationPreferences } from "../user";

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  // Mirrors the API default: push stays off until a device grants permission.
  pushNotifications: false,
  productAnnouncements: true,
  newMovieReleases: true,
  newSeriesPremieres: true,
  newEpisodeReleases: true,
  newSeasonReleases: true,
  returningShows: true,
  recommendations: true,
  watchlistUpdates: true,
  digestMode: "instant",
};

export const defaultNotificationInterests: NotificationInterests = {
  followedShows: [],
  followedMovies: [],
  followedPeople: [],
  followedGenres: [],
  followedActors: [],
  followedDirectors: [],
  tasteKeywords: [],
};

/**
 * The "what" of a notification, as opposed to the "where".
 *
 * Channels (email, push) live in their own section because they compose with
 * these rather than sitting alongside them: every type below can arrive on
 * either channel, and turning both channels off silences all of them.
 */
export const notificationToggleOptions: Array<{
  key: keyof Omit<
    NotificationPreferences,
    "digestMode" | "emailNotifications" | "pushNotifications"
  >;
  label: string;
  description: string;
}> = [
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
    key: "newSeriesPremieres",
    label: "New series",
    description: "Alert me when a brand-new show premieres.",
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
    description:
      "Include matches on followed genres, keywords and your taste profile — not just titles you follow directly.",
  },
  {
    key: "watchlistUpdates",
    label: "Watchlist and history",
    description:
      "Include releases for titles on your watchlist or that you've recently watched.",
  },
];

export const notificationChannelOptions: Array<{
  key: "emailNotifications" | "pushNotifications";
  label: string;
  description: string;
}> = [
  {
    key: "emailNotifications",
    label: "Email",
    description: "Send alerts to your account email address.",
  },
  {
    key: "pushNotifications",
    label: "Push notifications",
    description:
      "Send alerts to this browser or installed app. Push always arrives instantly, even on a digest schedule.",
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
