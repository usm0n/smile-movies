import { Box, Chip, Input, Option, Select, Switch, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import { Shimmer } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { Inbox } from "../../components/ui/icons";
import { NotificationInterests, NotificationPreferences, User } from "../../user";
import {
  defaultNotificationInterests,
  defaultNotificationPreferences,
  notificationDigestOptions,
  notificationToggleOptions,
} from "../../utilities/notificationPreferences";
import { useCallback, useEffect, useState } from "react";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";
import { NotificationHistoryItem } from "../../types/notifications";
import { toast } from "../../components/ui/toast";

/**
 * Settings → Notifications.
 *
 * Preferences and interests are saved together by one button, because they are
 * two halves of the same question ("what should we email you about"). Delivery
 * history sits below, read-only, so a user can check whether something actually
 * went out before changing anything.
 */

const INTEREST_FIELDS = [
  ["followedShows", "Shows", "Game of Thrones, Severance"],
  ["followedGenres", "Genres", "Sci-Fi, Thriller, Animation"],
  ["followedActors", "Actors", "Cillian Murphy, Zendaya"],
  ["followedDirectors", "Directors", "Denis Villeneuve, Greta Gerwig"],
  ["tasteKeywords", "Keywords", "time travel, courtroom, heist"],
] as const;

const parseList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

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
  const [interestDraft, setInterestDraft] = useState({
    followedShows: "",
    followedGenres: "",
    followedActors: "",
    followedDirectors: "",
    tasteKeywords: "",
  });

  useEffect(() => {
    notificationsAPI
      .getHistory()
      .then((response) => setHistory(response.data))
      .catch(() => undefined)
      .finally(() => setHistoryLoading(false));
  }, []);

  // Seed the comma-separated inputs once from the saved interests. Keying off
  // the user id rather than the arrays avoids clobbering what the user is
  // typing every time the parent re-renders with a new array identity.
  useEffect(() => {
    const interests = {
      ...defaultNotificationInterests,
      ...(userValue?.notificationInterests || {}),
    };
    setInterestDraft({
      followedShows: interests.followedShows.join(", "),
      followedGenres: interests.followedGenres.join(", "),
      followedActors: interests.followedActors.join(", "),
      followedDirectors: interests.followedDirectors.join(", "),
      tasteKeywords: interests.tasteKeywords.join(", "),
    });
  }, [userValue?.id]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsAPI.updatePreferences(preferences);
      const nextInterests: NotificationInterests = {
        followedShows: parseList(interestDraft.followedShows),
        followedGenres: parseList(interestDraft.followedGenres),
        followedActors: parseList(interestDraft.followedActors),
        followedDirectors: parseList(interestDraft.followedDirectors),
        tasteKeywords: parseList(interestDraft.tasteKeywords),
      };
      await notificationsAPI.updateInterests(nextInterests);
      setUserValue((prev) => ({ ...prev, notificationInterests: nextInterests }));
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
        title="What we send you"
        description="Turn off anything you don't want to hear about. Everything is delivered by email."
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
        footerHint="Applies to every notification type above."
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

      <Panel
        title="Release interests"
        description="Follow shows, people and themes so we alert you about new releases even when they aren't on your watchlist."
        footerHint="Comma-separated. Saved together with your preferences."
        footer={
          <Button loading={saving} onClick={handleSave}>
            Save changes
          </Button>
        }
      >
        <Box sx={{ display: "grid", gap: 2 }}>
          {INTEREST_FIELDS.map(([key, label, placeholder]) => (
            <Field key={key} label={label}>
              <Input
                value={interestDraft[key]}
                placeholder={placeholder}
                onChange={(event) =>
                  setInterestDraft((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
              />
            </Field>
          ))}
        </Box>
      </Panel>

      <Panel
        title="Delivery history"
        description="The last notifications we attempted to send to you."
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
