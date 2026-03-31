import {
  Box, Button, Chip, CircularProgress, Divider,
  Modal, ModalClose, ModalDialog, Typography,
} from "@mui/joy";
import { useState } from "react";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  resolveImdbId,
  fetchImdbParentalGuide,
  ImdbParentsGuideEntry,
} from "../../service/api/imdb/imdb.api.service";

// ── Category display config ───────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  SEXUAL_CONTENT:           { label: "Sex & Nudity",              emoji: "🔞" },
  VIOLENCE:                 { label: "Violence & Gore",            emoji: "🩸" },
  PROFANITY:                { label: "Profanity",                  emoji: "🤬" },
  ALCOHOL_DRUGS:            { label: "Alcohol, Drugs & Smoking",   emoji: "🍷" },
  FRIGHTENING_INTENSE_SCENES: { label: "Frightening & Intense",   emoji: "😱" },
};

// Ordered display
const CATEGORY_ORDER = [
  "SEXUAL_CONTENT",
  "VIOLENCE",
  "PROFANITY",
  "ALCOHOL_DRUGS",
  "FRIGHTENING_INTENSE_SCENES",
];

// Severity levels in order + their colours
const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  NONE:   { color: "#21d07a", label: "None"   },
  MILD:   { color: "#d2d531", label: "Mild"   },
  MODERATE: { color: "#e67e22", label: "Moderate" },
  SEVERE: { color: "#e74c3c", label: "Severe" },
};
const SEVERITY_ORDER = ["NONE", "MILD", "MODERATE", "SEVERE"];

/** Pick the "dominant" severity for a category based on highest vote count */
function dominantSeverity(entry: ImdbParentsGuideEntry): string {
  if (!entry.severityBreakdowns?.length) return "NONE";
  const sorted = [...entry.severityBreakdowns].sort((a, b) => b.voteCount - a.voteCount);
  return sorted[0].severityLevel?.toUpperCase() ?? "NONE";
}

function severityChipColor(sev: string): "success" | "warning" | "danger" | "neutral" {
  if (sev === "NONE") return "success";
  if (sev === "MILD") return "warning";
  if (sev === "MODERATE") return "warning";
  if (sev === "SEVERE") return "danger";
  return "neutral";
}

// ── Severity bar ──────────────────────────────────────────────────────────────
function SeverityBar({ entry }: { entry: ImdbParentsGuideEntry }) {
  const total = entry.severityBreakdowns?.reduce((a, b) => a + (b.voteCount ?? 0), 0) ?? 0;
  if (total === 0) return null;

  const byLevel: Record<string, number> = {};
  entry.severityBreakdowns?.forEach((s) => {
    byLevel[s.severityLevel?.toUpperCase()] = s.voteCount ?? 0;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mt: 0.5 }}>
      {SEVERITY_ORDER.map((sev) => {
        const count = byLevel[sev] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const cfg = SEVERITY_CONFIG[sev] ?? { color: "#888", label: sev };
        return (
          <Box key={sev} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 10, color: "neutral.400", width: 54, flexShrink: 0 }}>
              {cfg.label}
            </Typography>
            <Box sx={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%", borderRadius: 3,
                  width: `${pct}%`,
                  background: cfg.color,
                  transition: "width 0.4s ease",
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 10, color: "neutral.500", width: 22, textAlign: "right", flexShrink: 0 }}>
              {count}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Single category block ─────────────────────────────────────────────────────
function CategoryBlock({ entry }: { entry: ImdbParentsGuideEntry }) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

  const meta = CATEGORY_META[entry.category] ?? { label: entry.category, emoji: "📌" };
  const dom = dominantSeverity(entry);
  const reviews = entry.reviews ?? [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const toggleSpoiler = (idx: number) => {
    setRevealedSpoilers((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <Box>
      {/* Category header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography level="title-sm" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>{meta.emoji}</span> {meta.label}
        </Typography>
        <Chip size="sm" color={severityChipColor(dom)} variant="soft" sx={{ fontWeight: 700 }}>
          {SEVERITY_CONFIG[dom]?.label ?? dom}
        </Chip>
      </Box>

      {/* Severity breakdown bars */}
      <SeverityBar entry={entry} />

      {/* Reviews */}
      {reviews.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {visibleReviews.map((review, idx) => {
            const revealed = revealedSpoilers.has(idx);
            return (
              <Box
                key={idx}
                sx={{
                  p: "8px 10px",
                  borderRadius: "7px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {review.isSpoiler && !revealed ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        filter: "blur(4px)",
                        userSelect: "none",
                        pointerEvents: "none",
                        color: "neutral.300",
                        fontSize: 12,
                      }}
                    >
                      <Typography level="body-xs">{review.text}</Typography>
                    </Box>
                    <Button
                      size="sm"
                      variant="soft"
                      color="warning"
                      startDecorator={<VisibilityIcon sx={{ fontSize: 13 }} />}
                      onClick={() => toggleSpoiler(idx)}
                      sx={{ flexShrink: 0, fontSize: 11, py: 0.3, px: 1, borderRadius: 20 }}
                    >
                      Spoiler
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography level="body-xs" textColor="neutral.300">{review.text}</Typography>
                    {review.isSpoiler && (
                      <Button
                        size="sm"
                        variant="plain"
                        color="neutral"
                        startDecorator={<VisibilityOffIcon sx={{ fontSize: 12 }} />}
                        onClick={() => toggleSpoiler(idx)}
                        sx={{ mt: 0.5, fontSize: 10, py: 0, px: 0.5, minHeight: 0 }}
                      >
                        Hide spoiler
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}

          {reviews.length > 3 && (
            <Button
              variant="plain"
              color="neutral"
              size="sm"
              onClick={() => setShowAllReviews((v) => !v)}
              sx={{ alignSelf: "flex-start", fontSize: 11, py: 0.2 }}
            >
              {showAllReviews ? "Show less" : `Show ${reviews.length - 3} more reviews`}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ParentalGuideProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  title?: string;
  year?: string;
}

function ParentalGuide({ mediaId, mediaType, title, year }: ParentalGuideProps) {
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState<ImdbParentsGuideEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuide = async () => {
    setOpen(true);
    if (guide) return; // already loaded
    setLoading(true);
    setError(null);
    try {
      const imdbId = await resolveImdbId(mediaId, mediaType);
      if (!imdbId) { setError("IMDb ID not found for this title."); return; }
      const entries = await fetchImdbParentalGuide(imdbId);
      // Sort by our preferred order
      const sorted = [...entries].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      );
      setGuide(sorted);
    } catch {
      setError("Could not load parental guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={fetchGuide}
        variant="soft"
        color="danger"
        startDecorator={<FamilyRestroomIcon />}
        size="sm"
        sx={{ borderRadius: 20 }}
      >
        Parental Guide
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 520, width: "95vw",
            maxHeight: "85vh", overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { borderRadius: 4, background: "rgba(255,255,255,0.15)" },
          }}
        >
          <ModalClose />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FamilyRestroomIcon />
            <Typography level="title-lg">Parental Guide</Typography>
          </Box>
          {title && (
            <Typography level="body-sm" textColor="neutral.400">
              {title}{year ? ` (${year})` : ""}
            </Typography>
          )}
          <Divider />

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography textColor="danger.400" level="body-sm">{error}</Typography>
          )}

          {guide && !loading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {guide.map((entry) => (
                <Box key={entry.category}>
                  <CategoryBlock entry={entry} />
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
              <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.5 }}>
                Source: IMDb Parental Guide · Ratings based on user votes
              </Typography>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </>
  );
}

export default ParentalGuide;
