import { Box, Button, Card, Divider, Option, Select, Typography } from "@mui/joy";
import { NotificationPreferences, User } from "../../user";
import {
  defaultNotificationPreferences,
  notificationDigestOptions,
  notificationToggleOptions,
} from "../../utilities/notificationPreferences";

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
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Box>

      <Typography level="body-xs" textColor="neutral.500">
        Digest mode is groundwork for the upcoming notification engine. Delivery remains email-first in the current release.
      </Typography>
    </Card>
  );
}

export default NotificationSettings;
