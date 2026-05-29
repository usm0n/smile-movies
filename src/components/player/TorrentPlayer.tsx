import { Box, LinearProgress, Typography } from "@mui/joy";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import WebTorrent, { type WebTorrentFile } from "webtorrent/dist/webtorrent.min.js";
import type { TorrentioStreamMetadata } from "../../hooks/useTorrentio";

const WEBRTC_TRACKERS = [
  "wss://tracker.btorrent.xyz",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.fastcast.nz",
];

const NO_WEBRTC_PEERS_TIMEOUT_MS = 20_000;
const NO_WEBRTC_PEERS_MESSAGE =
  "No WebRTC peers were found for this torrent. Try another stream or check back later.";

type TorrentPlayerProps = {
  stream?: TorrentioStreamMetadata | null;
  torrentIdentifier?: string;
  infoHash?: string;
  playerRef?: MutableRefObject<HTMLVideoElement | null>;
  poster?: string;
  title?: string;
  reloadToken?: number;
  onLoadedMetadata?: () => void;
  onTimeUpdate?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onPlaybackError?: (message: string) => void;
  onPlaybackReady?: () => void;
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

const normalizeInfoHash = (value: string) => value.trim().replace(/^urn:btih:/i, "").replace(/^btih:/i, "");

const BARE_INFO_HASH_PATTERN = /^(?:urn:btih:|btih:)?[a-z0-9]{32,40}$/i;

const PLAYABLE_VIDEO_PATTERN = /\.(mp4|webm)$/i;

const isMagnetUri = (value: string) => value.trim().toLowerCase().startsWith("magnet:?");

const isBareInfoHash = (value: string) => BARE_INFO_HASH_PATTERN.test(value.trim());

const ensureWebRtcTrackers = (magnetUri: string) => {
  const normalizedMagnetUri = magnetUri.trim();
  const queryStartIndex = normalizedMagnetUri.indexOf("?");

  if (queryStartIndex < 0) {
    return normalizedMagnetUri;
  }

  const prefix = normalizedMagnetUri.slice(0, queryStartIndex);
  const query = normalizedMagnetUri.slice(queryStartIndex + 1);
  const params = new URLSearchParams(query);
  const existingTrackers = new Set(params.getAll("tr").map((tracker) => tracker.trim().toLowerCase()));

  WEBRTC_TRACKERS.forEach((tracker) => {
    if (!existingTrackers.has(tracker.toLowerCase())) {
      params.append("tr", tracker);
    }
  });

  return `${prefix}?${params.toString()}`;
};

const createMagnetUri = (infoHash: string) => {
  const normalizedInfoHash = normalizeInfoHash(infoHash);
  const trackers = WEBRTC_TRACKERS.map((tracker) => `tr=${encodeURIComponent(tracker)}`).join("&");

  return `magnet:?xt=urn:btih:${encodeURIComponent(normalizedInfoHash)}&${trackers}`;
};

const resolveTorrentIdentifier = ({ stream, torrentIdentifier, infoHash }: TorrentPlayerProps) => {
  const preferredIdentifier = String(stream?.url || torrentIdentifier || stream?.infoHash || infoHash || "").trim();

  if (!preferredIdentifier) {
    return "";
  }

  if (isMagnetUri(preferredIdentifier)) {
    return ensureWebRtcTrackers(preferredIdentifier);
  }

  return isBareInfoHash(preferredIdentifier) ? createMagnetUri(preferredIdentifier) : preferredIdentifier;
};

const selectPlayableVideoFile = (files: WebTorrentFile[]) => {
  const playableFiles = files.filter((file) => PLAYABLE_VIDEO_PATTERN.test(file.name));

  return playableFiles.sort((a, b) => Number(b.length || 0) - Number(a.length || 0))[0] || null;
};

function TorrentPlayer({
  stream = null,
  torrentIdentifier = "",
  infoHash = "",
  playerRef,
  poster = "",
  title = "",
  reloadToken = 0,
  onLoadedMetadata,
  onTimeUpdate,
  onPause,
  onEnded,
  onPlaybackError,
  onPlaybackReady,
}: TorrentPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<TorrentStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [error, setError] = useState("");

  const torrentId = useMemo(
    () => resolveTorrentIdentifier({ stream, torrentIdentifier, infoHash }),
    [infoHash, stream, torrentIdentifier],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !torrentId) {
      setStatus("idle");
      if (playerRef) playerRef.current = null;
      return;
    }

    let isMounted = true;
    let hasUsefulTorrentActivity = false;
    let noPeersTimeout: ReturnType<typeof window.setTimeout> | null = null;
    let latestTrackerWarning = "";
    let activeVideoElement: HTMLVideoElement | null = null;
    let cleanupVideoListeners = () => {};
    const client = new WebTorrent();

    container.replaceChildren();
    if (playerRef) playerRef.current = null;
    setStatus("connecting");
    setProgress(0);
    setDownloadSpeed(0);
    setError("");

    const clearNoPeersTimeout = () => {
      if (noPeersTimeout) {
        window.clearTimeout(noPeersTimeout);
        noPeersTimeout = null;
      }
    };

    const handleError = (torrentError: Error) => {
      if (!isMounted) return;
      clearNoPeersTimeout();
      const errorMessage = torrentError.message || "Unable to load this torrent.";
      setError(errorMessage);
      setStatus("error");
      onPlaybackError?.(errorMessage);
    };

    const handleNoWebRtcPeers = () => {
      if (!isMounted || hasUsefulTorrentActivity) return;

      const trackerWarningContext = latestTrackerWarning ? " Tracker connection warnings were reported." : "";
      handleError(new Error(`${NO_WEBRTC_PEERS_MESSAGE}${trackerWarningContext}`));
    };

    const markUsefulTorrentActivity = () => {
      hasUsefulTorrentActivity = true;
      clearNoPeersTimeout();
    };

    const handleClientError = (torrentError: unknown) => {
      handleError(torrentError instanceof Error ? torrentError : new Error(String(torrentError)));
    };

    client.on("error", handleClientError);

    const attachVideoElement = () => {
      const videoElement = containerRef.current?.querySelector("video") as HTMLVideoElement | null;
      if (!videoElement || !isMounted) return;

      activeVideoElement = videoElement;
      activeVideoElement.controls = true;
      activeVideoElement.autoplay = true;
      activeVideoElement.playsInline = true;
      if (poster) activeVideoElement.poster = poster;
      if (title) activeVideoElement.title = title;
      if (playerRef) playerRef.current = activeVideoElement;

      const handleLoadedMetadata = () => onLoadedMetadata?.();
      const handleTimeUpdate = () => onTimeUpdate?.();
      const handlePause = () => onPause?.();
      const handleEnded = () => onEnded?.();
      const handleReady = () => {
        clearNoPeersTimeout();
        onPlaybackReady?.();
      };
      const handleVideoError = () => {
        const videoErrorMessage = activeVideoElement?.error?.message || "Unable to play this torrent video.";
        handleError(new Error(videoErrorMessage));
      };

      activeVideoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      activeVideoElement.addEventListener("timeupdate", handleTimeUpdate);
      activeVideoElement.addEventListener("pause", handlePause);
      activeVideoElement.addEventListener("ended", handleEnded);
      activeVideoElement.addEventListener("canplay", handleReady);
      activeVideoElement.addEventListener("play", handleReady);
      activeVideoElement.addEventListener("error", handleVideoError);

      cleanupVideoListeners = () => {
        activeVideoElement?.removeEventListener("loadedmetadata", handleLoadedMetadata);
        activeVideoElement?.removeEventListener("timeupdate", handleTimeUpdate);
        activeVideoElement?.removeEventListener("pause", handlePause);
        activeVideoElement?.removeEventListener("ended", handleEnded);
        activeVideoElement?.removeEventListener("canplay", handleReady);
        activeVideoElement?.removeEventListener("play", handleReady);
        activeVideoElement?.removeEventListener("error", handleVideoError);
      };
    };

    const torrent = client.add(torrentId, (addedTorrent) => {
      markUsefulTorrentActivity();

      const videoFile = selectPlayableVideoFile(addedTorrent.files);

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
        attachVideoElement();
        clearNoPeersTimeout();
        setStatus("ready");
        onPlaybackReady?.();
      });
    });

    noPeersTimeout = window.setTimeout(handleNoWebRtcPeers, NO_WEBRTC_PEERS_TIMEOUT_MS);

    torrent.once("metadata", markUsefulTorrentActivity);
    torrent.once("wire", markUsefulTorrentActivity);

    torrent.on("download", () => {
      if (!isMounted) return;
      markUsefulTorrentActivity();
      setStatus((currentStatus) => (currentStatus === "ready" ? currentStatus : "downloading"));
      setProgress(Math.round(torrent.progress * 1000) / 10);
      setDownloadSpeed(torrent.downloadSpeed);
    });

    torrent.on("noPeers", handleNoWebRtcPeers);
    torrent.on("warning", (torrentWarning: unknown) => {
      latestTrackerWarning = torrentWarning instanceof Error ? torrentWarning.message : String(torrentWarning);
    });
    torrent.on("error", handleClientError);

    return () => {
      isMounted = false;
      clearNoPeersTimeout();
      cleanupVideoListeners();
      if (playerRef && playerRef.current === activeVideoElement) {
        playerRef.current = null;
      }
      container.replaceChildren();
      client.destroy();
    };
  }, [onEnded, onLoadedMetadata, onPause, onPlaybackError, onPlaybackReady, onTimeUpdate, playerRef, poster, reloadToken, title, torrentId]);

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
