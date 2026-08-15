/**
 * Pure helpers for the IMDb-backed title sections.
 *
 * Kept apart from the shared components (`ImdbSectionUI.tsx`) so neither file
 * mixes components with plain exports — the same split as
 * `parentalGuideShared.ts`.
 */

import {
  ImdbBoxOffice,
  ImdbInterestScore,
  ImdbMoney,
  ImdbTechnicalSpecs,
  ImdbTitleDetails,
} from "../../../service/api/imdb/imdb.api.service";

/** Compact money, e.g. "$25M" — full precision goes in the title attribute. */
export const formatMoney = (money?: ImdbMoney): string => {
  if (!money || !Number.isFinite(money.amount)) return "";

  const { amount, currency } = money;
  const symbol = currency === "USD" ? "$" : `${currency} `;

  const units: Array<[number, string]> = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ];

  for (const [size, suffix] of units) {
    if (amount >= size) {
      const scaled = amount / size;
      // Keep a decimal only while it still carries information.
      const digits = scaled < 10 ? 1 : 0;
      return `${symbol}${scaled.toFixed(digits).replace(/\.0$/, "")}${suffix}`;
    }
  }

  return `${symbol}${amount.toLocaleString()}`;
};

export const formatMoneyFull = (money?: ImdbMoney): string =>
  money && Number.isFinite(money.amount)
    ? `${money.amount.toLocaleString()} ${money.currency}`
    : "";

/** IMDb's "N of M found this interesting" reduced to a percentage. */
export const interestShare = (interest?: ImdbInterestScore): number | null => {
  if (!interest?.usersVoted) return null;
  return Math.round((interest.usersInterested / interest.usersVoted) * 100);
};

/** Card surface used by every list item, matching the parental-guide styling. */
export const cardSx = {
  p: "10px 12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
} as const;

/** Technical specification lists, in the order the details block shows them. */
export const SPEC_LABELS: Array<[keyof ImdbTechnicalSpecs, string]> = [
  ["aspectRatios", "Aspect ratio"],
  ["soundMixes", "Sound mix"],
  ["colorations", "Color"],
  ["cameras", "Camera"],
  ["negativeFormats", "Negative format"],
  ["printedFormats", "Printed format"],
  ["filmLengths", "Film length"],
  ["laboratories", "Laboratory"],
  ["processes", "Process"],
];

export const hasBoxOffice = (boxOffice: ImdbBoxOffice) =>
  Boolean(
    boxOffice.budget ||
      boxOffice.grossWorldwide ||
      boxOffice.grossDomestic ||
      boxOffice.openingWeekendDomestic
  );

export const hasTechnicalSpecs = (specs: ImdbTechnicalSpecs) =>
  Boolean(specs.runtimeText) ||
  SPEC_LABELS.some(([key]) => (specs[key] as string[])?.length > 0);

/** Whether the details section has anything, so callers can skip its divider. */
export const hasTitleFacts = (details: ImdbTitleDetails) =>
  hasBoxOffice(details.boxOffice) ||
  hasTechnicalSpecs(details.technicalSpecs) ||
  Boolean(details.certificate) ||
  details.certificates.length > 0 ||
  details.keywords.length > 0;
