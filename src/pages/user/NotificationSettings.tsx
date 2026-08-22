import { Box, Chip, Option, Select, Switch, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import { Shimmer } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { Inbox } from "../../components/ui/icons";
import { NotificationPreferences, User } from "../../user";
import {
  defaultNotificationPreferences,
  notificationChannelOptions,
  notificationDigestOptions,
  notificationToggleOptions,
} from "../../utilities/notificationPreferences";
import {
  disablePushOnThisDevice,
  enablePushOnThisDevice,
  getPermissionState,
  getPushSupport,
} from "../../pwa/push";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";
import FollowManager from "../../components/notifications/FollowManager";
import { NotificationHistoryItem } from "../../types/notifications";
import { toast } from "../../components/ui/toast";

/**
 * Settings → Notifications.
 *
 * Reads top to bottom as one question answered in order: where should we reach
 * you, what should we tell you about, how often, and what are you following.
 *
 * The preference toggles are saved by the button that sits with them. Follows
 * are not — `FollowManager` saves each one as it is pressed, because a Follow
 * button that needs a separate Save afterwards does not behave like a Follow
 * button anywhere else.
 *
 * Delivery history sits at the bottom, read-only, so a user can check whether
 * something actually went out before changing anything.
 */

function NotificationSettings({
  userValue,
  setUserValue,
}: {
  userValue: User;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
}) {
  const preferences: NotificationPreferences = {
    ...defaultNotificationPreferences,
    ...(userValue?.notifications || {}),
  };

  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  // Support is a property of the browser, not the account, so it is read once
  // per mount rather than stored.
  const pushSupport = getPushSupport();
  const pushBlocked = getPermissionState() === "denied";
  const navigate = useNavigate();

  useEffect(() => {
    notificationsAPI
      .getHistory()
      .then((response) => setHistory(response.data))
      .catch(() => undefined)
      .finally(() => setHistoryLoading(false));
  }, []);

  const setPreference = useCallback(
    (key: keyof NotificationPreferences, value: unknown) =>
      setUserValue((prev) => ({
        ...prev,
        notifications: {
          ...defaultNotificationPreferences,
          ...(prev.notifications as NotificationPreferences),
          [key]: value,
        },
      })),
    [setUserValue],
  );

  /**
   * The push switch is not a plain preference: turning it on has to go through
   * the browser's permission prompt and mint a device token, and either can
   * fail. So it saves immediately rather than waiting for the Save button —
   * leaving the switch on while the token never registered would be a lie.
   */
  const handlePushToggle = async () => {
    if (pushBusy) return;
    setPushBusy(true);

    try {
      if (preferences.pushNotifications) {
        await disablePushOnThisDevice();
        setPreference("pushNotifications", false);
        toast.success("Push notifications turned off.");
        return;
      }

      const result = await enablePushOnThisDevice();
      if (result.ok) {
        setPreference("pushNotifications", true);
        toast.success("Push notifications enabled on this device.");
      } else {
        setPreference("pushNotifications", false);
        toast.error(result.reason);
      }
    } finally {
      setPushBusy(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsAPI.updatePreferences(preferences);
      toast.success("Notification settings saved.");
    } catch {
      toast.error("Failed to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = notificationToggleOptions.filter(
    ({ key }) => preferences[key],
  ).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel
        title="How we reach you"
        description="Updates always appear in the bell in the top bar. These are the extra ways we can reach you when you're not in the app."
        footerHint={
          pushSupport.supported
            ? "Push is per-device — enable it again on each browser or phone you use."
            : pushSupport.reason
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {notificationChannelOptions.map(({ key, label, description }, index) => {
            const isPush = key === "pushNotifications";
            const disabled = isPush && (!pushSupport.supported || pushBusy);

            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 2,
                  borderTop: index === 0 ? "none" : "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography level="title-sm">{label}</Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "text.tertiary", mt: 0.25 }}
                  >
                    {isPush && pushBlocked
                      ? "Blocked in your browser settings. Allow notifications for this site, then try again."
                      : isPush && !pushSupport.supported
                        ? pushSupport.reason
                        : description}
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(preferences[key])}
                  disabled={disabled}
                  onChange={() =>
                    isPush
                      ? void handlePushToggle()
                      : setPreference(key, !preferences[key])
                  }
                  slotProps={{ input: { "aria-label": label } }}
                />
              </Box>
            );
          })}
        </Box>
      </Panel>

      <Panel
        title="What we send you"
        description="Turn off anything you don't want to hear about. This applies to every channel, including the bell."
        footerHint={`${enabledCount} of ${notificationToggleOptions.length} enabled.`}
        footer={
          <Button loading={saving} onClick={handleSave}>
            Save changes
          </Button>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {notificationToggleOptions.map(({ key, label, description }, index) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 2,
                borderTop: index === 0 ? "none" : "1px solid",
                borderColor: "neutral.outlinedBorder",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography level="title-sm">{label}</Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "text.tertiary", mt: 0.25 }}
                >
                  {description}
                </Typography>
              </Box>
              <Switch
                checked={Boolean(preferences[key])}
                onChange={() => setPreference(key, !preferences[key])}
                slotProps={{ input: { "aria-label": label } }}
              />
            </Box>
          ))}
        </Box>
      </Panel>

      <Panel
        title="Delivery cadence"
        description="Send each alert as it happens, or batch them into one digest."
        footerHint="Applies to email only — push notifications always arrive instantly."
        footer={
          <Button loading={saving} onClick={handleSave}>
            Save changes
          </Button>
        }
      >
        <Field label="Frequency">
          <Select
            value={preferences.digestMode}
            onChange={(_, value) =>
              setPreference("digestMode", value || "instant")
            }
            sx={{ maxWidth: 260 }}
          >
            {notificationDigestOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Field>
      </Panel>

      <FollowManager userValue={userValue} setUserValue={setUserValue} />

      <Panel
        title="Delivery history"
        description="The last emails and push notifications we tried to send you. Everything you've been notified about lives in the bell."
        footer={
          <Button variant="outlined" onClick={() => navigate("/notifications")}>
            Open notifications
          </Button>
        }
      >
        {historyLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Shimmer height={56} radius={8} />
            <Shimmer height={56} radius={8} />
          </Box>
        ) : history.length === 0 ? (
          <EmptyState
            bare
            icon={Inbox}
            title="Nothing sent yet"
            description="Once a release matches your interests, the delivery shows up here."
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {history.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  py: 2,
                  borderTop: index === 0 ? "none" : "1px solid",
                  borderColor: "neutral.outlinedBorder",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 0.5,
                  }}
                >
                  <Typography level="title-sm" sx={{ minWidth: 0 }}>
                    {item.subject}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                    <Chip size="sm" variant="outlined" color="neutral">
                      {item.channel === "push" ? "push" : "email"}
                    </Chip>
                    <Chip
                      size="sm"
                      variant="soft"
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
                  </Box>
                </Box>
                <Typography level="body-sm">
                  {item.title} · {item.bodyPreview}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "text.tertiary", mt: 0.5, fontFamily: "code" }}
                >
                  {item.createdAt} · {item.eventType}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
}

export default NotificationSettings;
