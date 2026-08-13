import { Box, Typography } from "@mui/joy";
import { ComponentType, ReactNode } from "react";
import type { IconProps } from "./icons";

export type EmptyStateProps = {
  icon?: ComponentType<IconProps>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Renders without the surrounding dashed panel. */
  bare?: boolean;
};

/**
 * Centered icon, one line of copy, one action — the shape Vercel uses for
 * every empty list, missing page and signed-out state.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bare = false,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
        px: 3,
        py: bare ? 4 : 8,
        ...(bare
          ? {}
          : {
              border: "1px dashed",
              borderColor: "neutral.outlinedBorder",
              borderRadius: "lg",
              backgroundColor: "background.surface",
            }),
      }}
    >
      {Icon && (
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 44,
            height: 44,
            borderRadius: "md",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.level1",
            color: "text.tertiary",
            mb: 1,
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
      )}
      <Typography level="title-md" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography level="body-sm" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2, display: "flex", gap: 1 }}>{action}</Box>}
    </Box>
  );
}

export default EmptyState;
