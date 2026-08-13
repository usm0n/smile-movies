import { Box } from "@mui/joy";

export type Segment = {
  value: string;
  label: string;
};

/**
 * Vercel's pill switcher — used for the home-row category toggles and any
 * other small "one of N" choice that shouldn't be a full tab bar.
 */
function SegmentedControl({
  segments,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const height = size === "sm" ? 28 : 32;
  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      className="no-scrollbar"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        p: "3px",
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        backgroundColor: "background.surface",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Box
            key={segment.value}
            component="button"
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(segment.value)}
            sx={{
              border: "none",
              cursor: "pointer",
              height,
              px: 1.5,
              borderRadius: "6px",
              fontFamily: "body",
              fontSize: size === "sm" ? "0.75rem" : "0.8125rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "background-color 150ms ease, color 150ms ease",
              backgroundColor: selected ? "background.level2" : "transparent",
              color: selected ? "text.primary" : "text.tertiary",
              "&:hover": { color: "text.primary" },
            }}
          >
            {segment.label}
          </Box>
        );
      })}
    </Box>
  );
}

export default SegmentedControl;
