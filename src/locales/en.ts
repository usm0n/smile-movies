/**
 * English strings, and the source of truth for the key list.
 *
 * `ru.ts` is typed against this object, so a key added here without a Russian
 * counterpart is a compile error rather than an English word surfacing in a
 * Russian UI.
 *
 * A value is either a plain string or, when it varies by count, a set of
 * CLDR plural categories. English only ever needs `one`/`other`; Russian needs
 * `one`/`few`/`many`, which is why the shape is per-language rather than a
 * single `{singular, plural}` pair.
 */

export type PluralForms = {
  one: string;
  few?: string;
  many?: string;
  other: string;
};

export type TranslationValue = string | PluralForms;

const en = {
  // Shared vocabulary — the words that repeat across the whole app.
  "common.cancel": "Cancel",
  "common.save": "Save changes",
  "common.saving": "Saving…",
  "common.back": "Back",
  "common.remove": "Remove",
  "common.delete": "Delete",
  "common.close": "Close",
  "common.confirm": "Confirm",
  "common.retry": "Try again",
  "common.loading": "Loading…",
  "common.search": "Search",
  "common.goHome": "Go home",
  "common.browseTitles": "Browse titles",
  "common.email": "Email",
  "common.password": "Password",
  "common.emailPlaceholder": "you@example.com",
  "common.optional": "Optional",
  "common.enabled": "Enabled",
  "common.disabled": "Disabled",

  // Navigation.
  "nav.home": "Home",
  "nav.movies": "Movies",
  "nav.series": "Series",
  "nav.search": "Search",
  "nav.library": "Your library",
  "nav.settings": "Settings",
  "nav.signIn": "Sign In",
  "nav.signOut": "Log out",
  "nav.profile": "Profile",
  "nav.discover": "Discover",
  // Product name — deliberately identical in every locale.
  "nav.smileAI": "SmileAI",
  "nav.watchlist": "Watchlist",
  "nav.myLists": "My Lists",
  "nav.downloads": "Downloads",
  "nav.getApp": "Get the app",
  "nav.sectionLibrary": "Library",
  "nav.sectionApp": "App",

  // Account menu.
  "account.switch": "Switch account",
  "account.verify": "Verify your account",
  "account.publicProfile": "Public profile",
  "account.admin": "Admin",

  // Settings.
  "settings.title": "Settings",
  "settings.language.title": "Language",
  "settings.language.description":
    "Sets the interface language, and the language titles and descriptions are shown in.",
  "settings.language.label": "Interface language",
  "settings.language.contentNote":
    "Titles and descriptions fall back to their original language where no translation exists.",

  // Counts — the reason plural forms exist at all.
  "library.itemCount": {
    one: "{count} title",
    other: "{count} titles",
  },
  "player.audioTrackCount": {
    one: "{count} audio track",
    other: "{count} audio tracks",
  },
  "search.resultCount": {
    one: "{count} result",
    other: "{count} results",
  },
} satisfies Record<string, TranslationValue>;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, TranslationValue>;

export default en;
