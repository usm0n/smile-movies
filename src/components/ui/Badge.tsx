import { Box } from "@mui/joy";
import { ReactNode } from "react";
import type { SxProps } from "@mui/joy/styles/types";

const palettes = {
  neutral: { bg: "#111111", border: "#1f1f1f", color: "#a1a1a1" },
  contrast: { bg: "#ffffff", border: "#ffffff", color: "#000000" },
  blue: { bg: "rgba(0,112,243,0.12)", border: "rgba(0,112,243,0.35)", color: "#3291ff" },
  amber: { bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.35)", color: "#f5a623" },
  red: { bg: "rgba(229,72,77,0.12)", border: "rgba(229,72,77,0.35)", color: "#ff6369" },
  green: { bg: "rgba(62,207,142,0.12)", border: "rgba(62,207,142,0.35)", color: "#3ecf8e" },
} as const;

export type BadgeTone = keyof typeof palettes;

/** Small bordered pill — release status, quality tags, counts, ratings. */
function Badge({
  children,
  tone = "neutral",
  startDecorator,
  mono = false,
  sx,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  startDecorator?: ReactNode;
  mono?: boolean;
  sx?: SxProps;
}) {
  const palette = palettes[tone];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.875,
        height: 22,
        borderRadius: "4px",
        border: "1px solid",
        borderColor: palette.border,
        backgroundColor: palette.bg,
        color: palette.color,
        fontSize: "0.6875rem",
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: mono ? "0.02em" : "-0.005em",
        fontFamily: mono ? "code" : "body",
        whiteSpace: "nowrap",
        ...(sx as object),
      }}
    >
      {startDecorator}
      {children}
    </Box>
  );
}

export default Badge;
