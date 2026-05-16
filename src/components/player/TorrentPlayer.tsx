import { Box, LinearProgress, Typography } from "@mui/joy";
import { useEffect, useMemo, useRef, useState } from "react";
import WebTorrent, { type WebTorrentFile } from "webtorrent/dist/webtorrent.min.js";

const WEBRTC_TRACKERS = [
  "wss://tracker.btorrent.xyz",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.fastcast.nz",
];

type TorrentPlayerProps = {
  infoHash: string;
};

type TorrentStatus = "idle" | "connecting" | "downloading" | "ready" | "error";

const bytesPerSecondLabel = (bytesPerSecond: number) => {
  if (bytesPerSecond >= 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  if (bytesPerSecond >= 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  }

  return `${Math.round(bytesPerSecond)} B/s`;
};

const createMagnetUri = (infoHash: string) => {
  const normalizedInfoHash = infoHash.trim();
  const trackers = WEBRTC_TRACKERS.map((tracker) => `tr=${encodeURIComponent(tracker)}`).join("&");

  return `magnet:?xt=urn:btih:${encodeURIComponent(normalizedInfoHash)}&${trackers}`;
};

function TorrentPlayer({ infoHash }: TorrentPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<TorrentStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [error, setError] = useState("");

  const magnetUri = useMemo(() => (infoHash ? createMagnetUri(infoHash) : ""), [infoHash]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !magnetUri) {
      setStatus("idle");
      return;
    }

    let isMounted = true;
    const client = new WebTorrent();

    container.replaceChildren();
    setStatus("connecting");
    setProgress(0);
    setDownloadSpeed(0);
    setError("");

    const handleError = (torrentError: Error) => {
      if (!isMounted) return;
      setError(torrentError.message || "Unable to load this torrent.");
      setStatus("error");
    };

    const handleClientError = (torrentError: unknown) => {
      handleError(torrentError instanceof Error ? torrentError : new Error(String(torrentError)));
    };

    client.on("error", handleClientError);

    const torrent = client.add(magnetUri, (addedTorrent) => {
      const videoFile = addedTorrent.files.find((file: WebTorrentFile) => /\.(mp4|webm)$/i.test(file.name));

      if (!videoFile) {
        handleError(new Error("No .mp4 or .webm file was found in this torrent."));
        return;
      }

      if (!containerRef.current || !isMounted) return;

      videoFile.appendTo(containerRef.current, { autoplay: true, controls: true }, (appendError?: Error) => {
        if (appendError) {
          handleError(appendError);
          return;
        }

        if (!isMounted) return;
        setStatus("ready");
      });
    });

    torrent.on("download", () => {
      if (!isMounted) return;
      setStatus((currentStatus) => (currentStatus === "ready" ? currentStatus : "downloading"));
      setProgress(Math.round(torrent.progress * 1000) / 10);
      setDownloadSpeed(torrent.downloadSpeed);
    });

    torrent.on("error", handleClientError);

    return () => {
      isMounted = false;
      container.replaceChildren();
      client.destroy();
    };
  }, [magnetUri]);

  const isLoading = status === "connecting" || status === "downloading";

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: { xs: "56px", md: 0 },
        pb: { xs: "16px", md: 0 },
        "& video": {
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          backgroundColor: "black",
        },
      }}
    >
      <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />

      {isLoading ? (
        <Box
          sx={{
            position: "absolute",
            width: "min(420px, calc(100% - 32px))",
            px: 2,
            py: 2,
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(8,8,8,0.74)",
            backdropFilter: "blur(14px)",
          }}
        >
          <LinearProgress determinate={status === "downloading"} value={progress} thickness={2} />
          <Typography level="h4" sx={{ mt: 2 }}>
            {status === "connecting" ? "Finding peers" : `Buffering torrent (${progress.toFixed(1)}%)`}
          </Typography>
          <Typography level="body-sm" sx={{ mt: 1, color: "neutral.400" }}>
            Download speed: {bytesPerSecondLabel(downloadSpeed)}
          </Typography>
        </Box>
      ) : null}

      {status === "error" ? (
        <Box
          sx={{
            position: "absolute",
            width: "min(520px, calc(100% - 32px))",
            px: 2,
            py: 2,
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(14px)",
            textAlign: "center",
          }}
        >
          <Typography level="h4" sx={{ mb: 1 }}>
            Torrent playback error
          </Typography>
          <Typography level="body-md" sx={{ color: "neutral.300" }}>
            {error || "Unable to play this torrent."}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

export default TorrentPlayer;
