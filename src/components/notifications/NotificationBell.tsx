import { Badge, Box, Divider, Dropdown, Menu, MenuButton, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../ui/Button";
import { Shimmer } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { Notifications, NotificationsNone } from "../ui/icons";
import { useNotifications } from "../../context/Notifications";
import { NotificationHistoryItem } from "../../types/notifications";
import NotificationRow from "./NotificationRow";

const PREVIEW_COUNT = 6;

/**
 * The notification bell.
 *
 * Opening the panel marks everything read. That is the convention people
 * already expect from every other inbox — the badge is "things you have not
 * looked at", not "things you have not clicked", and leaving it lit after the
 * user has plainly read the list reads as broken.
 */
function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, initialLoading, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const preview = items.slice(0, PREVIEW_COUNT);

  const handleOpenChange = (_event: unknown, isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) void markAllRead();
  };

  const openItem = (item: NotificationHistoryItem) => {
    void markRead(item.id);
    setOpen(false);
    navigate(item.path || "/");
  };

  return (
    <Dropdown open={open} onOpenChange={handleOpenChange}>
      <MenuButton
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        slotProps={{
          root: {
            sx: {
              p: 0,
              minHeight: 0,
              minWidth: 0,
              width: 36,
              height: 36,
              border: "none",
              borderRadius: "999px",
              background: "transparent",
              color: "text.secondary",
              "&:hover": { background: "background.level1", color: "text.primary" },
            },
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          max={9}
          color="danger"
          size="sm"
          invisible={unreadCount === 0}
          sx={{ "--Badge-minHeight": "16px", "--Badge-paddingX": "4px" }}
        >
          {unreadCount > 0 ? (
            <Notifications sx={{ fontSize: 20 }} />
          ) : (
            <NotificationsNone sx={{ fontSize: 20 }} />
          )}
        </Badge>
      </MenuButton>

      <Menu
        placement="bottom-end"
        sx={{
          width: 380,
          maxWidth: "calc(100vw - 24px)",
          p: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography level="title-sm">Notifications</Typography>
          <Button
            variant="plain"
            size="sm"
            onClick={() => {
              setOpen(false);
              navigate("/user/notifications");
            }}
          >
            Settings
          </Button>
        </Box>
        <Divider />

        <Box sx={{ maxHeight: 420, overflowY: "auto", p: 0.75 }}>
          {initialLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, p: 0.75 }}>
              <Shimmer height={72} radius={8} />
              <Shimmer height={72} radius={8} />
              <Shimmer height={72} radius={8} />
            </Box>
          ) : preview.length === 0 ? (
            <Box sx={{ px: 2, py: 3 }}>
              <EmptyState
                bare
                icon={NotificationsNone}
                title="Nothing yet"
                description="Follow a show, film or person and we'll tell you when there's something new."
              />
            </Box>
          ) : (
            preview.map((item) => (
              <NotificationRow key={item.id} item={item} compact onOpen={openItem} />
            ))
          )}
        </Box>

        {items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                variant="plain"
                fullWidth
                size="sm"
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
              >
                See all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </Dropdown>
  );
}

export default NotificationBell;
