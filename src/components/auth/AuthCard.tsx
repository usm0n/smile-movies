import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";

/**
 * Shared frame for every auth screen: centered column, heading above a
 * bordered #0a0a0a card, optional footer line beneath it.
 */
function AuthCard({
  title,
  description,
  children,
  footer,
  width = 400,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: "calc(var(--sm-nav-height) + 32px)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: width }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: "1.75rem" }}>
            {title}
          </Typography>
          {description && (
            <Typography level="body-sm" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "lg",
            backgroundColor: "background.surface",
            p: 3,
          }}
        >
          {children}
        </Box>

        {footer && (
          <Box sx={{ textAlign: "center", mt: 2.5 }}>{footer}</Box>
        )}
      </Box>
    </Box>
  );
}

export default AuthCard;
