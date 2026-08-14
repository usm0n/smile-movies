/**
 * Interface language preference.
 *
 * Kept separate from the translations themselves so the choice can be read
 * before React mounts — the first paint should already be in the right
 * language, and a locale resolved inside a component would flash English on
 * every reload.
 */

const STORAGE_KEY = "locale";

export type Locale = "en" | "ru";

export const SUPPORTED_LOCALES: Locale[] = ["en", "ru"];

export const DEFAULT_LOCALE: Locale = "en";

/** Names are written in their own language: a reader looking for Russian is not reading English yet. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

const isLocale = (value: unknown): value is Locale =>
  SUPPORTED_LOCALES.includes(String(value || "") as Locale);

export const readStoredLocale = (): Locale | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch (_error) {
    // Private-mode Safari throws on localStorage access.
    return null;
  }
};

export const writeStoredLocale = (locale: Locale) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch (_error) {
    // A locale that cannot be persisted still applies for this session.
  }
};

/**
 * An explicit choice always wins; otherwise the browser decides. `ru-RU`,
 * `ru-BY` and plain `ru` all mean the same thing here, so only the language
 * subtag is compared.
 */
export const detectInitialLocale = (): Locale => {
  const stored = readStoredLocale();
  if (stored) return stored;

  try {
    const languages = window.navigator.languages?.length
      ? window.navigator.languages
      : [window.navigator.language];

    for (const language of languages) {
      const subtag = String(language || "").toLowerCase().split("-")[0];
      if (isLocale(subtag)) return subtag;
    }
  } catch (_error) {
    // No navigator (SSR or a locked-down webview) — fall through.
  }

  return DEFAULT_LOCALE;
};

/**
 * The tag handed to TMDB, which wants a region: it returns Russian titles and
 * overviews for `ru-RU`, and falls back to the original language per field
 * when no translation exists.
 */
export const getTmdbLanguage = (locale: Locale) => (locale === "ru" ? "ru-RU" : "en-US");
