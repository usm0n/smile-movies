import { useEffect, useMemo } from "react";
import { Box } from "@mui/joy";
import { MediaCommunitySkin, MediaOutlet, MediaPlayer } from "@vidstack/react";
import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";
import {
  ProviderSourceFormat,
  VixsrcPlaybackStream,
} from "../../types/providers";

function PlaybackSurface({
  playerRef,
  stream,
  sourceUrl,
  sourceFormat,
  poster,
  title,
  onLoadedMetadata,
  onTimeUpdate,
  onPause,
  onEnded,
  onPlaybackError,
  onPlaybackReady,
  reloadToken,
}: {
  playerRef: React.MutableRefObject<any>;
  stream: VixsrcPlaybackStream | null;
  sourceUrl: string;
  sourceFormat: ProviderSourceFormat;
  poster?: string;
  title: string;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPause: () => void;
  onEnded: () => void;
  onPlaybackError?: (message: string) => void;
  onPlaybackReady?: () => void;
  reloadToken?: number;
}) {
  const subtitleTracks = useMemo(() => {
    const tracks = Array.isArray(stream?.subtitleTracks) ? stream.subtitleTracks : [];
    const normalizedTracks = tracks
      .filter((track) => track?.url)
      .map((track, index) => ({
        id: track.id || `subtitle-${index}`,
        src: track.url,
        kind: "subtitles" as const,
        label: track.name || track.language || "Subtitle",
        language: track.language || "und",
        default: Boolean(track.isDefault || track.autoSelect),
      }));
    const defaultIndex = normalizedTracks.findIndex((track) => track.default);

    return normalizedTracks.map((track, index) => ({
      ...track,
      default: defaultIndex >= 0 ? index === defaultIndex : index === 0,
    }));
  }, [stream?.subtitleTracks]);

  const sourceMimeType = useMemo(() => {
    if (sourceFormat === "hls") {
      return "application/x-mpegurl";
    }
    if (sourceFormat === "mp4") {
      return "video/mp4";
    }

    const normalizedUrl = String(sourceUrl || "").toLowerCase();
    if (normalizedUrl.includes(".m3u8")) {
      return "application/x-mpegurl";
    }
    if (normalizedUrl.includes(".mp4")) {
      return "video/mp4";
    }
    return "application/x-mpegurl";
  }, [sourceFormat, sourceUrl]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !sourceUrl) {
      return;
    }

    const handleLoadedMetadataEvent = () => onLoadedMetadata();
    const handleTimeUpdateEvent = () => onTimeUpdate();
    const handlePauseEvent = () => onPause();
    const handleEndedEvent = () => onEnded();
    const handleCanPlayEvent = () => onPlaybackReady?.();
    const handlePlayEvent = () => onPlaybackReady?.();
    const handleErrorEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const detailMessage = String(customEvent?.detail?.message || "").trim();
      const eventMessage = String((event as { type?: string })?.type || "").trim();
      const fallbackMessage = detailMessage || eventMessage || "Playback failed";
      onPlaybackError?.(fallbackMessage);
    };

    player.addEventListener("loaded-metadata", handleLoadedMetadataEvent);
    player.addEventListener("time-update", handleTimeUpdateEvent);
    player.addEventListener("pause", handlePauseEvent);
    player.addEventListener("ended", handleEndedEvent);
    player.addEventListener("can-play", handleCanPlayEvent);
    player.addEventListener("play", handlePlayEvent);
    player.addEventListener("error", handleErrorEvent);
    player.addEventListener("stream-error", handleErrorEvent);

    return () => {
      player.removeEventListener("loaded-metadata", handleLoadedMetadataEvent);
      player.removeEventListener("time-update", handleTimeUpdateEvent);
      player.removeEventListener("pause", handlePauseEvent);
      player.removeEventListener("ended", handleEndedEvent);
      player.removeEventListener("can-play", handleCanPlayEvent);
      player.removeEventListener("play", handlePlayEvent);
      player.removeEventListener("error", handleErrorEvent);
      player.removeEventListener("stream-error", handleErrorEvent);
    };
  }, [
    onEnded,
    onLoadedMetadata,
    onPause,
    onPlaybackError,
    onPlaybackReady,
    onTimeUpdate,
    playerRef,
    sourceUrl,
  ]);

  if (!sourceUrl) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background: "black",
        display: "flex",
        alignItems: { xs: "center", md: "stretch" },
        justifyContent: { xs: "center", md: "stretch" },
        pt: { xs: "56px", md: 0 },
        pb: { xs: "16px", md: 0 },
        "& media-player": {
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        },
        "@media (max-width: 700px)": {
          "& media-player": {
            height: "auto",
            maxHeight: "calc(100svh - 96px)",
          },
        },
      }}
    >
      <MediaPlayer
        key={`${sourceUrl}:${reloadToken || 0}`}
        ref={playerRef}
        title={title}
        src={{
          src: sourceUrl,
          type: sourceMimeType,
        }}
        textTracks={subtitleTracks}
        poster={poster}
        load="eager"
        aspectRatio={16 / 9}
        streamType="on-demand"
        viewType="video"
        crossorigin
        playsinline
        preferNativeHLS={sourceMimeType.includes("mpegurl") ? false : undefined}
        style={{
          "--video-border-radius": "0px",
          "--video-border": "none",
          "--video-font-family":
            "\"IBM Plex Sans\", \"Segoe UI\", sans-serif",
          "--video-controls-color": "#f8fafc",
          "--video-brand": "rgb(255, 220, 92)",
        } as React.CSSProperties}
      >
        <MediaOutlet />
        <MediaCommunitySkin />
      </MediaPlayer>
    </Box>
  );
}

export default PlaybackSurface;
