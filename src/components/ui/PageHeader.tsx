import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small muted line above the title (breadcrumb-ish, not a coloured eyebrow). */
  overline?: ReactNode;
  /** Adds the hairline rule underneath, as on Vercel's dashboard pages. */
  divider?: boolean;
};

function PageHeader({
  title,
  description,
  actions,
  overline,
  divider = true,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "flex-end" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        pb: divider ? 3 : 0,
        // The rule reads as the separator; the parent's gap supplies the rest.
        mb: divider ? 0 : 1,
        borderBottom: divider ? "1px solid" : "none",
        borderColor: "neutral.outlinedBorder",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {overline && (
          <Typography level="body-xs" sx={{ mb: 1 }}>
            {overline}
          </Typography>
        )}
        <Typography level="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
          {title}
        </Typography>
        {description && (
          <Typography level="body-md" sx={{ mt: 1, maxWidth: 680 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, flexWrap: "wrap" }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

export default PageHeader;
