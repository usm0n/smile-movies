import { Box, Button, Card, Chip, CircularProgress, Divider, Option, Select, Stack, Typography } from "@mui/joy";
import { NotificationPreferences, User } from "../../user";
import {
  defaultNotificationPreferences,
  notificationDigestOptions,
  notificationToggleOptions,
} from "../../utilities/notificationPreferences";
import { useEffect, useState } from "react";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";
import { NotificationHistoryItem } from "../../types/notifications";
import toast from "react-hot-toast";

function NotificationSettings({
  userValue,
  setUserValue,
}: {
  userValue: User;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
}) {
  const currentPreferences = {
    ...defaultNotificationPreferences,
    ...(userValue?.notifications || {}),
  };
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await notificationsAPI.getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setHistoryLoading(false);
      }
    };

    void loadHistory();
  }, []);

  return (
    <Card
      sx={{
        width: "700px",
        margin: "0 auto",
        gap: 2,
        "@media (max-width: 800px)": { width: "90%" },
      }}
    >
      <Typography level="h4">Notification Preferences</Typography>
      <Typography level="body-sm" textColor="neutral.400">
        Control release alerts, recommendation emails, and how often Smile Movies sends updates.
      </Typography>

      <Divider />

      {notificationToggleOptions.map(({ key, label, description }) => (
        <Box
          key={key}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography level="title-sm">{label}</Typography>
            <Typography level="body-xs" textColor="neutral.400">
              {description}
            </Typography>
          </Box>
          <Button
            size="sm"
            variant={currentPreferences[key] ? "solid" : "outlined"}
            color={currentPreferences[key] ? "success" : "neutral"}
            onClick={() =>
              setUserValue((prev) => ({
                ...prev,
                notifications: {
                  ...defaultNotificationPreferences,
                  ...(prev.notifications as NotificationPreferences),
                  [key]: !currentPreferences[key],
                },
              }))
            }
            sx={{ minWidth: 68 }}
          >
            {currentPreferences[key] ? "On" : "Off"}
          </Button>
        </Box>
      ))}

      <Divider />

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
        <Box>
          <Typography level="title-sm">Delivery cadence</Typography>
          <Typography level="body-xs" textColor="neutral.400">
            Choose whether to receive immediate alerts or grouped digests.
          </Typography>
        </Box>
        <Select
          value={currentPreferences.digestMode}
          onChange={(_, value) =>
            setUserValue((prev) => ({
              ...prev,
              notifications: {
                ...defaultNotificationPreferences,
                ...(prev.notifications as NotificationPreferences),
                digestMode: (value || "instant") as NotificationPreferences["digestMode"],
              },
            }))
          }
          sx={{ minWidth: 170 }}
        >
          {notificationDigestOptions.map((option) => (
            <Option key={option.value} value={option?.value}>
              {option?.label}
            </Option>
          ))}
        </Select>
      </Box>

      <Typography level="body-xs" textColor="neutral.500">
        Delivery is email-first in the current release, with queueing and unsubscribe groundwork now live on the backend.
      </Typography>

      <Button
        onClick={async () => {
          setSaving(true);
          try {
            await notificationsAPI.updatePreferences(currentPreferences);
            toast.success("Notification settings saved.");
          } catch (error) {
            console.error(error);
            toast.error("Failed to save notification settings.");
          } finally {
            setSaving(false);
          }
        }}
        loading={saving}
      >
        Save Notification Settings
      </Button>

      <Divider />

      <Box>
        <Typography level="title-md" sx={{ mb: 1 }}>
          Notification History
        </Typography>
        <Typography level="body-xs" textColor="neutral.400" sx={{ mb: 2 }}>
          Recent email delivery attempts and unsubscribe-safe events will appear here.
        </Typography>

        {historyLoading ? (
          <CircularProgress size="sm" />
        ) : history.length === 0 ? (
          <Typography level="body-sm" textColor="neutral.500">
            No notification deliveries yet. Once release events are queued, you will see history here.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {history.map((item) => (
              <Card key={item.id} sx={{ p: 1.5, borderRadius: 18, background: "rgba(255,255,255,0.02)" }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                  <Typography level="title-sm">{item.subject}</Typography>
                  <Chip
                    size="sm"
                    color={
                      item.status === "sent"
                        ? "success"
                        : item.status === "failed"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {item.status}
                  </Chip>
                </Stack>
                <Typography level="body-sm" textColor="neutral.300">
                  {item.title} · {item.bodyPreview}
                </Typography>
                <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.75 }}>
                  {item.createdAt} · {item.eventType}
                </Typography>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );
}

export default NotificationSettings;
