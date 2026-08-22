import { AspectRatio, Box, Chip, Typography } from "@mui/joy";
import { Movie as MovieIcon } from "../ui/icons";
import { NotificationHistoryItem } from "../../types/notifications";
import { eventTypeLabel, posterUrl, relativeTime } from "./notificationDisplay";

/**
 * One inbox row. Used at two densities: `compact` inside the bell dropdown,
 * full size on the notifications page.
 */
function NotificationRow({
  item,
  compact = false,
  onOpen,
}: {
  item: NotificationHistoryItem;
  compact?: boolean;
  onOpen: (item: NotificationHistoryItem) => void;
}) {
  const poster = posterUrl(item.posterPath);
  const posterWidth = compact ? 40 : 56;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item);
        }
      }}
      sx={{
        display: "flex",
        gap: compact ? 1.25 : 2,
        alignItems: "flex-start",
        px: compact ? 1.5 : 2,
        py: compact ? 1.25 : 1.75,
        cursor: "pointer",
        borderRadius: compact ? "8px" : "10px",
        // The unread marker is a tinted background rather than a dot, so the
        // boundary between read and unread is legible at a glance instead of
        // needing to scan a column of markers.
        backgroundColor: item.read ? "transparent" : "primary.softBg",
        transition: "background-color 120ms ease",
        "&:hover": { backgroundColor: item.read ? "background.level1" : "primary.softHoverBg" },
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.500" },
      }}
    >
      <AspectRatio
        ratio="2/3"
        sx={{
          width: posterWidth,
          flexShrink: 0,
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {poster ? (
          <Box component="img" src={poster} alt="" loading="lazy" />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "background.level2",
            }}
          >
            <MovieIcon sx={{ opacity: 0.4 }} />
          </Box>
        )}
      </AspectRatio>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 0.25,
            flexWrap: "wrap",
          }}
        >
          <Chip size="sm" variant="soft" color="primary">
            {eventTypeLabel(item.eventType)}
          </Chip>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {relativeTime(item.createdAtMs, item.createdAt)}
          </Typography>
        </Box>

        <Typography
          level={compact ? "title-sm" : "title-md"}
          sx={{
            fontWeight: item.read ? 500 : 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>

        <Typography
          level="body-sm"
          sx={{
            color: "text.secondary",
            mt: 0.25,
            display: "-webkit-box",
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.bodyPreview}
        </Typography>
      </Box>
    </Box>
  );
}

export default NotificationRow;
