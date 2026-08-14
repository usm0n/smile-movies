import { Box, Switch, Typography } from "@mui/joy";
import Button from "../../components/ui/Button";
import Panel from "../../components/ui/Panel";
import { PrivacySettings as PrivacySettingsType, User } from "../../user";
import { LaunchRounded } from "../../components/ui/icons";
import { useNavigate } from "react-router-dom";

/**
 * Settings → Privacy.
 *
 * Every toggle here controls one thing only: what a visitor to your public
 * profile can see. Anything that changes how you sign in lives under Login
 * connections, and deletion lives under Account.
 */

const PRIVACY_TOGGLES: {
  key: keyof PrivacySettingsType;
  label: string;
  description: string;
}[] = [
  {
    key: "showWatchlist",
    label: "Watchlist",
    description: "Let anyone see the titles you have saved to watch.",
  },
  {
    key: "showRecentlyWatched",
    label: "Recently watched",
    description: "Show the last titles you played, including your progress.",
  },
  {
    key: "showRatings",
    label: "Ratings",
    description: "Show the scores you have given to movies and shows.",
  },
];

function PrivacySettings({
  userValue,
  setUserValue,
  updateMyself,
  updatedMyselfData,
}: {
  userValue: User;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
  updateMyself: (user: User) => void;
  updatedMyselfData: { isLoading: boolean } | null;
}) {
  const navigate = useNavigate();
  const privacy = (userValue?.privacy || {}) as PrivacySettingsType;
  const visibleCount = PRIVACY_TOGGLES.filter((item) => privacy[item.key]).length;

  const toggle = (key: keyof PrivacySettingsType) =>
    setUserValue((prev) => ({
      ...prev,
      privacy: {
        ...(prev.privacy as PrivacySettingsType),
        [key]: !(prev.privacy as PrivacySettingsType)?.[key],
      },
    }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel
        title="Public profile visibility"
        description={
          userValue?.handle
            ? `Controls what visitors see at /u/${userValue.handle}.`
            : "Set a handle under Account to publish a public profile."
        }
        footerHint={
          visibleCount === 0
            ? "Nothing from your library is public."
            : `${visibleCount} of ${PRIVACY_TOGGLES.length} sections are public.`
        }
        footer={
          <>
            {!!userValue?.handle && (
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<LaunchRounded sx={{ fontSize: 15 }} />}
                onClick={() => window.open(`/u/${userValue.handle}`, "_blank")}
              >
                Preview
              </Button>
            )}
            <Button
              loading={updatedMyselfData?.isLoading}
              onClick={() => updateMyself(userValue)}
            >
              Save changes
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {PRIVACY_TOGGLES.map((item, index) => (
            <Box
              key={item.key}
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
                <Typography level="title-sm">{item.label}</Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "text.tertiary", mt: 0.25 }}
                >
                  {item.description}
                </Typography>
              </Box>
              <Switch
                checked={Boolean(privacy[item.key])}
                onChange={() => toggle(item.key)}
                slotProps={{ input: { "aria-label": item.label } }}
              />
            </Box>
          ))}
        </Box>
      </Panel>

      <Panel
        title="Account details"
        description="Read-only facts about this account."
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <DetailRow label="Created" value={userValue?.createdAt || "—"} />
          <DetailRow label="Last sign-in" value={userValue?.lastLogin || "—"} />
          <DetailRow
            label="Primary email"
            value={userValue?.email || "No email on this account"}
          />
          <DetailRow
            label="Devices"
            value={`${userValue?.devices?.length || 0} registered`}
          />
        </Box>
      </Panel>

      <Panel
        title="Your data"
        description="Sign-in methods, connected emails and account deletion are handled elsewhere in Settings."
        footer={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => navigate("/user/connections")}
            >
              Login connections
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => navigate("/user/settings")}
            >
              Account &amp; deletion
            </Button>
          </>
        }
      />
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
        "&:not(:first-of-type)": {
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
        },
      }}
    >
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        {label}
      </Typography>
      <Typography level="body-sm" sx={{ fontFamily: "code", fontSize: "0.8rem" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default PrivacySettings;
