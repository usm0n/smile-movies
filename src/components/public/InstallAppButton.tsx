import { DownloadRounded } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function InstallAppButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installEvent) {
    return null;
  }

  return (
    <Button
      fullWidth={fullWidth}
      variant="solid"
      color="warning"
      startDecorator={<DownloadRounded />}
      onClick={async () => {
        await installEvent.prompt();
        setInstallEvent(null);
      }}
      sx={{
        color: "#120c00",
        fontWeight: 700,
      }}
    >
      Install PWA
    </Button>
  );
}

export default InstallAppButton;
