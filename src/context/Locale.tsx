import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en, { type Dictionary, type PluralForms, type TranslationKey } from "../locales/en";
import ru from "../locales/ru";
import {
  detectInitialLocale,
  getTmdbLanguage,
  writeStoredLocale,
  type Locale,
} from "../utilities/localePrefs";
import { setTmdbLanguage } from "../service/api/api";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ru };

type TranslateVars = Record<string, string | number> & { count?: number };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Language tag for TMDB requests, e.g. `ru-RU`. */
  tmdbLanguage: string;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const isPluralForms = (value: unknown): value is PluralForms =>
  Boolean(value) && typeof value === "object" && "other" in (value as object);

/**
 * Picks the right plural form via the platform's own CLDR rules rather than a
 * hand-rolled `count === 1` check, which is correct for English and wrong for
 * Russian from the number two upwards.
 */
const selectPluralForm = (forms: PluralForms, locale: Locale, count: number) => {
  const category = new Intl.PluralRules(locale).select(count);
  if (category === "one") return forms.one;
  if (category === "few") return forms.few ?? forms.other;
  if (category === "many") return forms.many ?? forms.other;
  return forms.other;
};

const interpolate = (template: string, vars?: TranslateVars) => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in vars ? String(vars[token]) : match,
  );
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const initial = detectInitialLocale();
    // Applied during this render, not in an effect: effects run after the
    // children have mounted and already fired their first TMDB requests, which
    // would fetch English and only correct itself on the next fetch.
    setTmdbLanguage(getTmdbLanguage(initial));
    return initial;
  });

  // Screen readers and the browser's own hyphenation rely on this, and it is
  // the one piece of locale state that lives outside React.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Keeps the axios instance in step on every later change.
  useEffect(() => {
    setTmdbLanguage(getTmdbLanguage(locale));
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslateVars) => {
      const dictionary = DICTIONARIES[locale] || en;
      // Fall back to English for a key the active dictionary somehow lacks:
      // showing the English word beats showing a raw key to a viewer.
      const value = dictionary[key] ?? en[key];

      if (isPluralForms(value)) {
        const count = Number(vars?.count ?? 0);
        return interpolate(selectPluralForm(value, locale, count), vars);
      }

      return interpolate(String(value ?? key), vars);
    },
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, tmdbLanguage: getTmdbLanguage(locale), t }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslation must be used inside a LocaleProvider");
  }
  return context;
};
