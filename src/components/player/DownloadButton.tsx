import { Button, CircularProgress, Tooltip } from "@mui/joy";
import { Download, DownloadDone, DeleteOutline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CACHE_NAME = "smile-offline-v1";

interface Props {
  streamUrl: string;
  title: string;
  cacheKey: string; // e.g. "movie-123" or "tv-456-s1e2"
}

function DownloadButton({ streamUrl, title, cacheKey }: Props) {
  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!cacheKey) return;
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.match(cacheKey))
      .then((r) => {
        if (r) setStatus("done");
      })
      .catch(() => {});
  }, [cacheKey]);

  const download = async () => {
    if (!streamUrl) {
      toast.error("No download source available.");
      return;
    }
    if (!streamUrl.toLowerCase().includes(".mp4")) {
      toast.error(
        "Offline download requires MP4 source. Switch to Vixsrc provider and try again.",
      );
      return;
    }

    setStatus("downloading");
    setProgress(0);

    try {
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error("Fetch failed");

      const reader = response.body!.getReader();
      const contentLength = Number(
        response.headers.get("Content-Length") || 0,
      );
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength) {
          setProgress(Math.round((received / contentLength) * 100));
        }
      }

      const blob = new Blob(chunks, { type: "video/mp4" });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        cacheKey,
        new Response(blob, {
          headers: {
            "Content-Type": "video/mp4",
            "X-Title": title,
            "X-Cache-Key": cacheKey,
          },
        }),
      );
      setStatus("done");
      toast.success("Downloaded! Available in My Downloads.");
    } catch {
      setStatus("idle");
      setProgress(0);
      toast.error("Download failed. Check your connection and try again.");
    }
  };

  const remove = async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(cacheKey);
      setStatus("idle");
      toast.success("Removed from downloads.");
    } catch {
      toast.error("Could not remove download.");
    }
  };

  if (status === "done") {
    return (
      <Tooltip title="Downloaded — click to remove">
        <Button
          startDecorator={<DownloadDone />}
          color="success"
          variant="soft"
          onClick={remove}
          endDecorator={<DeleteOutline sx={{ fontSize: 16, opacity: 0.6 }} />}
        >
          Downloaded
        </Button>
      </Tooltip>
    );
  }

  if (status === "downloading") {
    return (
      <Button
        disabled
        startDecorator={<CircularProgress size="sm" />}
        variant="soft"
      >
        {progress > 0 ? `${progress}%` : "Downloading..."}
      </Button>
    );
  }

  return (
    <Tooltip title="Download for offline viewing (MP4 only)">
      <Button
        startDecorator={<Download />}
        variant="outlined"
        color="neutral"
        onClick={download}
      >
        Download
      </Button>
    </Tooltip>
  );
}

export default DownloadButton;
