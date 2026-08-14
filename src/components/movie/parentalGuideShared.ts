/**
 * Parental guide vocabulary shared by the detail page's modal and the player's
 * info panel — the two render very differently, but a category has to be named,
 * ordered and coloured the same way in both.
 */

import { ImdbParentsGuideEntry } from "../../service/api/imdb/imdb.api.service";

export const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  SEXUAL_CONTENT: { label: "Sex & Nudity", emoji: "🔞" },
  VIOLENCE: { label: "Violence & Gore", emoji: "🩸" },
  PROFANITY: { label: "Profanity", emoji: "🤬" },
  ALCOHOL_DRUGS: { label: "Alcohol, Drugs & Smoking", emoji: "🍷" },
  FRIGHTENING_INTENSE_SCENES: { label: "Frightening & Intense", emoji: "😱" },
};

export const CATEGORY_ORDER = [
  "SEXUAL_CONTENT",
  "VIOLENCE",
  "PROFANITY",
  "ALCOHOL_DRUGS",
  "FRIGHTENING_INTENSE_SCENES",
];

export const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  NONE: { color: "#21d07a", label: "None" },
  MILD: { color: "#d2d531", label: "Mild" },
  MODERATE: { color: "#e67e22", label: "Moderate" },
  SEVERE: { color: "#e74c3c", label: "Severe" },
};

export const SEVERITY_ORDER = ["NONE", "MILD", "MODERATE", "SEVERE"];

/**
 * The level the most voters landed on. Zero-vote levels are dropped first —
 * IMDb returns the full ladder for every category, so counting them would make
 * everything read "None".
 */
export function dominantSeverity(entry: ImdbParentsGuideEntry): string {
  const breakdowns =
    entry.severityBreakdowns?.filter((breakdown) => (breakdown.voteCount ?? 0) > 0) ?? [];
  if (!breakdowns.length) return "NONE";

  return (
    [...breakdowns].sort((a, b) => b.voteCount - a.voteCount)[0]
      ?.severityLevel?.toUpperCase() ?? "NONE"
  );
}

export function severityChipColor(
  severity: string,
): "success" | "warning" | "danger" | "neutral" {
  if (severity === "NONE") return "success";
  if (severity === "MILD" || severity === "MODERATE") return "warning";
  if (severity === "SEVERE") return "danger";
  return "neutral";
}

export const sortParentalGuide = (entries: ImdbParentsGuideEntry[]) =>
  [...entries].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
