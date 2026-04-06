import { CircularProgress, Link, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicPageShell from "../../components/public/PublicPageShell";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";

function UnsubscribePage() {
  const { token = "" } = useParams();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your unsubscribe request...");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await notificationsAPI.unsubscribe(token);
        setMessage(response.data?.message || "Email notifications disabled.");
        setState("success");
      } catch (error) {
        console.error(error);
        setMessage("We could not process that unsubscribe link.");
        setState("error");
      }
    };

    if (token) {
      void run();
    } else {
      setState("error");
      setMessage("This unsubscribe link is missing a token.");
    }
  }, [token]);

  return (
    <PublicPageShell
      eyebrow="Notifications"
      title="Email preferences updated."
      description="You can always come back later and re-enable alerts from your Smile Movies notification settings."
    >
      <Stack spacing={2}>
        {state === "loading" && <CircularProgress size="sm" />}
        <Typography level="body-lg">{message}</Typography>
        <Typography level="body-sm" textColor="neutral.400">
          Return to{" "}
          <Link href="/user/notifications">
            notification settings
          </Link>{" "}
          if you want to manage release alerts and digest cadence directly.
        </Typography>
      </Stack>
    </PublicPageShell>
  );
}

export default UnsubscribePage;
