import { getTmdbImageLanguage } from "../service/api/api";

/**
 * Picks the title logo shown over hero artwork.
 *
 * The order is the viewer's language, then English, then a textless logo — the
 * same preference the artwork request itself is made with. Every hero used to
 * hardcode English, so a Russian interface still showed English title art;
 * this is the one place that decision now lives.
 */
type LogoLike = { iso_639_1?: string | null; file_path?: string | null };

export const pickPreferredLogoPath = (logos?: LogoLike[] | null) => {
  if (!logos?.length) return null;

  const language = getTmdbImageLanguage();

  return (
    logos.find((logo) => logo?.iso_639_1 === language)?.file_path ||
    logos.find((logo) => logo?.iso_639_1 === "en")?.file_path ||
    logos.find((logo) => !logo?.iso_639_1)?.file_path ||
    logos[0]?.file_path ||
    null
  );
};
