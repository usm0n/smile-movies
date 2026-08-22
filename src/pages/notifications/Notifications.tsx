import { Box, Chip, Typography } from "@mui/joy";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { Shimmer } from "../../components/ui/Skeleton";
import NotLoggedIn from "../../components/utils/NotLoggedIn";
import { NotificationsNone, Settings } from "../../components/ui/icons";
import { useNotifications } from "../../context/Notifications";
import { NotificationHistoryItem } from "../../types/notifications";
import NotificationRow from "../../components/notifications/NotificationRow";
import { isLoggedIn } from "../../utilities/defaults";

const CONTAINER_SX = {
  width: "100%",
  maxWidth: "var(--sm-page-max)",
  mx: "auto",
  px: { xs: 2, sm: 3, md: 4 },
  pt: "calc(var(--sm-nav-height) + 48px)",
  pb: 8,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minHeight: "100vh",
} as const;

type Filter = "all" | "unread";

/**
 * Groups by day rather than listing a flat run of timestamps.
 *
 * An inbox is read in passes — "what happened today, what did I miss this
 * week" — and date headers are what make that possible without reading every
 * row. The buckets are relative because "Today" answers the question a date
 * string only lets you work out.
 */
const dayBucket = (createdAtMs: number, fallback: string): string => {
  if (!createdAtMs) return fallback;

  const date = new Date(createdAtMs);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAgo = Math.floor((startOfToday.getTime() - date.getTime()) / 86_400_000);

  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return "Earlier this week";
  if (daysAgo < 30) return "Earlier this month";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

function Notifications() {
  const navigate = useNavigate();
  const { items, unreadCount, initialLoading, markAllRead, markRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((item) => !item.read) : items),
    [items, filter],
  );

  const groups = useMemo(() => {
    const buckets: Array<{ label: string; items: NotificationHistoryItem[] }> = [];

    for (const item of visible) {
      const label = dayBucket(item.createdAtMs, item.createdAt);
      const last = buckets[buckets.length - 1];
      if (last?.label === label) last.items.push(item);
      else buckets.push({ label, items: [item] });
    }

    return buckets;
  }, [visible]);

  const openItem = (item: NotificationHistoryItem) => {
    void markRead(item.id);
    navigate(item.path || "/");
  };

  if (!isLoggedIn) {
    return (
      <Box sx={CONTAINER_SX}>
        <NotLoggedIn type="page" />
      </Box>
    );
  }

  return (
    <Box sx={CONTAINER_SX}>
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} from the shows, films and people you follow.`
            : "Updates from the shows, films and people you follow."
        }
        actions={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {unreadCount > 0 && (
              <Button variant="outlined" size="sm" onClick={() => void markAllRead()}>
                Mark all read
              </Button>
            )}
            <Button
              variant="outlined"
              size="sm"
              startDecorator={<Settings sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/user/notifications")}
            >
              Settings
            </Button>
          </Box>
        }
      />

      <Box sx={{ display: "flex", gap: 1 }}>
        {(["all", "unread"] as const).map((value) => (
          <Chip
            key={value}
            variant={filter === value ? "solid" : "outlined"}
            color={filter === value ? "primary" : "neutral"}
            onClick={() => setFilter(value)}
            sx={{ cursor: "pointer", textTransform: "capitalize" }}
          >
            {value === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : value}
          </Chip>
        ))}
      </Box>

      {initialLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Shimmer height={96} radius={10} />
          <Shimmer height={96} radius={10} />
          <Shimmer height={96} radius={10} />
        </Box>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={NotificationsNone}
          title={filter === "unread" ? "Nothing unread" : "No notifications yet"}
          description={
            filter === "unread"
              ? "You're all caught up."
              : "Follow a show, film or person and we'll tell you when there's a new release, episode or season."
          }
          action={
            filter === "unread" ? (
              <Button variant="outlined" onClick={() => setFilter("all")}>
                Show all
              </Button>
            ) : (
              <Button onClick={() => navigate("/discover")}>
                Find something to follow
              </Button>
            )
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {groups.map((group) => (
            <Box key={group.label}>
              <Typography
                level="body-xs"
                sx={{
                  color: "text.tertiary",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 1,
                }}
              >
                {group.label}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {group.items.map((item) => (
                  <NotificationRow key={item.id} item={item} onOpen={openItem} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Notifications;
