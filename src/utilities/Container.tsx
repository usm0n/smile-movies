import { Box } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

/**
 * Standard page width. Everything below the nav sits inside this so the app
 * has one consistent gutter and max measure, like Vercel's dashboard shell.
 */
function Container({
  children,
  sx,
  gap = 6,
}: {
  children: React.ReactNode;
  sx?: SxProps;
  gap?: number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap,
        width: "100%",
        maxWidth: "var(--sm-page-max)",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        ...(sx as object),
      }}
    >
      {children}
    </Box>
  );
}

export default Container;
