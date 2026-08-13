import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";

export type PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Bottom bar with a muted hint on the left and actions on the right. */
  footer?: ReactNode;
  footerHint?: ReactNode;
  headerAction?: ReactNode;
  padding?: number;
};

/**
 * The Vercel settings card: bordered panel with a title, a body, and a
 * separated footer bar holding the save action.
 */
function Panel({
  title,
  description,
  children,
  footer,
  footerHint,
  headerAction,
  padding = 3,
}: PanelProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "lg",
        backgroundColor: "background.surface",
        overflow: "hidden",
      }}
    >
      {(title || headerAction) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            px: padding,
            pt: padding,
            pb: children ? 2 : padding,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography level="title-md" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography level="body-sm" sx={{ mt: 0.5, maxWidth: 620 }}>
                {description}
              </Typography>
            )}
          </Box>
          {headerAction}
        </Box>
      )}

      {children && (
        <Box sx={{ px: padding, pb: padding, pt: title ? 0 : padding }}>{children}</Box>
      )}

      {(footer || footerHint) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            px: padding,
            py: 2,
            borderTop: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.level1",
          }}
        >
          <Typography level="body-xs">{footerHint}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>{footer}</Box>
        </Box>
      )}
    </Box>
  );
}

export default Panel;
