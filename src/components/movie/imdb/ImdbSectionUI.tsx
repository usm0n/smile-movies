/**
 * Shared components for the IMDb-backed title sections.
 *
 * Every section is optional data on a page that must render without it, so
 * these pieces all degrade quietly: nothing renders an empty shell, and
 * spoilers stay hidden until asked for.
 */

import { Box, Button, Chip, CircularProgress, Typography } from "@mui/joy";
import { ReactNode, useState } from "react";
import { Visibility, VisibilityOff } from "../../ui/icons";

/** Section shell: heading, optional count chip, optional action on the right. */
export function ImdbSection({
  title,
  icon,
  count,
  action,
  children,
}: {
  title: string;
  icon?: ReactNode;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          level="h3"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {icon}
          {title}
          {count ? (
            <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 600 }}>
              {count.toLocaleString()}
            </Chip>
          ) : null}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  );
}

/**
 * Body text that stays blurred until the reader opts in. Used for anything
 * IMDb flags as a spoiler — trivia, goofs, quotes and reviews all can be.
 */
export function SpoilerText({
  text,
  isSpoiler,
  children,
}: {
  text?: string;
  isSpoiler: boolean;
  children?: ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);
  const body = children ?? (
    <Typography level="body-sm" textColor="neutral.300">
      {text}
    </Typography>
  );

  if (!isSpoiler) return <>{body}</>;

  if (!revealed) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            filter: "blur(4px)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {body}
        </Box>
        <Button
          size="sm"
          variant="soft"
          color="warning"
          startDecorator={<Visibility sx={{ fontSize: 13 }} />}
          onClick={() => setRevealed(true)}
          sx={{ flexShrink: 0, fontSize: 11, py: 0.3, px: 1, borderRadius: "8px" }}
        >
          Spoiler
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {body}
      <Button
        size="sm"
        variant="plain"
        color="neutral"
        startDecorator={<VisibilityOff sx={{ fontSize: 12 }} />}
        onClick={() => setRevealed(false)}
        sx={{ mt: 0.5, fontSize: 10, py: 0, px: 0.5, minHeight: 0 }}
      >
        Hide spoiler
      </Button>
    </Box>
  );
}

/** "Show more" row shared by the paginated sections. */
export function LoadMore({
  loading,
  remaining,
  onClick,
}: {
  loading: boolean;
  remaining: number;
  onClick: () => void;
}) {
  if (remaining <= 0) return null;

  return (
    <Button
      variant="soft"
      color="neutral"
      size="sm"
      loading={loading}
      onClick={onClick}
      sx={{ alignSelf: "flex-start", borderRadius: "8px" }}
    >
      Show more ({remaining.toLocaleString()} left)
    </Button>
  );
}

export function SectionSpinner() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
      <CircularProgress size="sm" />
    </Box>
  );
}

/** Credit line IMDb's terms expect wherever their data is surfaced. */
export function ImdbCredit({ note }: { note?: string }) {
  return (
    <Typography level="body-xs" textColor="neutral.500">
      {note ? `${note} · ` : ""}Source: IMDb
    </Typography>
  );
}
