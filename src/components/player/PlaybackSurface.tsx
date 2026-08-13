import { useEffect, useMemo, useRef } from "react";
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
  const playbackReadyRef = useRef(false);

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

  const onLoadedMetadataRef = useRef(onLoadedMetadata);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onPlaybackErrorRef = useRef(onPlaybackError);
  const onPlaybackReadyRef = useRef(onPlaybackReady);

  useEffect(() => {
    onLoadedMetadataRef.current = onLoadedMetadata;
    onTimeUpdateRef.current = onTimeUpdate;
    onPauseRef.current = onPause;
    onEndedRef.current = onEnded;
    onPlaybackErrorRef.current = onPlaybackError;
    onPlaybackReadyRef.current = onPlaybackReady;
  }, [
    onLoadedMetadata,
    onTimeUpdate,
    onPause,
    onEnded,
    onPlaybackError,
    onPlaybackReady,
  ]);

  useEffect(() => {
    playbackReadyRef.current = false;
  }, [sourceUrl, reloadToken]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !sourceUrl) {
      return;
    }

    const handleLoadedMetadataEvent = () => onLoadedMetadataRef.current();
    const handleTimeUpdateEvent = () => onTimeUpdateRef.current();
    const handlePauseEvent = () => onPauseRef.current();
    const handleEndedEvent = () => onEndedRef.current();
    const handleCanPlayEvent = () => onPlaybackReadyRef.current?.();
    const handlePlayEvent = () => onPlaybackReadyRef.current?.();
    const markReady = () => {
      playbackReadyRef.current = true;
    };
    /**
     * Buffering is not failure. A `waiting` before the first frame is the
     * normal state of a phone on cellular — AnimeKai ships ~2.4MB for 4.7s of
     * video, so the opening segments take real time on LTE — and treating the
     * first one as fatal reported "Playback error" for streams that were
     * loading fine. Only a lack of *progress* is evidence of a hung stream, so
     * we watch the gap between progress events instead of the events
     * themselves.
     */
    let lastProgressAt = Date.now();
    const markProgress = () => {
      lastProgressAt = Date.now();
    };
    const handleErrorEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const detailMessage = String(customEvent?.detail?.message || "").trim();
      const eventMessage = String((event as { type?: string })?.type || "").trim();
      const fallbackMessage = detailMessage || eventMessage || "Playback failed";
      onPlaybackErrorRef.current?.(fallbackMessage);
    };

    // A dead provider still fails, but only after it has genuinely gone quiet
    // for this long — not merely because startup was slow.
    const stallTimeout = window.setInterval(() => {
      if (playbackReadyRef.current) return;
      if (Date.now() - lastProgressAt < 30000) return;

      window.clearInterval(stallTimeout);
      onPlaybackErrorRef.current?.(
        "Stream timeout: provider did not return playable media.",
      );
    }, 2000);

    player.addEventListener("loaded-metadata", handleLoadedMetadataEvent);
    player.addEventListener("time-update", handleTimeUpdateEvent);
    player.addEventListener("pause", handlePauseEvent);
    player.addEventListener("ended", handleEndedEvent);
    player.addEventListener("can-play", handleCanPlayEvent);
    player.addEventListener("play", handlePlayEvent);
    player.addEventListener("can-play", markReady);
    player.addEventListener("play", markReady);
    player.addEventListener("progress", markProgress);
    player.addEventListener("loaded-metadata", markProgress);
    player.addEventListener("loaded-data", markProgress);
    player.addEventListener("time-update", markProgress);
    player.addEventListener("can-play", markProgress);
    player.addEventListener("play", markProgress);
    player.addEventListener("error", handleErrorEvent);
    player.addEventListener("stream-error", handleErrorEvent);

    return () => {
      window.clearInterval(stallTimeout);
      player.removeEventListener("loaded-metadata", handleLoadedMetadataEvent);
      player.removeEventListener("time-update", handleTimeUpdateEvent);
      player.removeEventListener("pause", handlePauseEvent);
      player.removeEventListener("ended", handleEndedEvent);
      player.removeEventListener("can-play", handleCanPlayEvent);
      player.removeEventListener("play", handlePlayEvent);
      player.removeEventListener("can-play", markReady);
      player.removeEventListener("play", markReady);
      player.removeEventListener("progress", markProgress);
      player.removeEventListener("loaded-metadata", markProgress);
      player.removeEventListener("loaded-data", markProgress);
      player.removeEventListener("time-update", markProgress);
      player.removeEventListener("can-play", markProgress);
      player.removeEventListener("play", markProgress);
      player.removeEventListener("error", handleErrorEvent);
      player.removeEventListener("stream-error", handleErrorEvent);
    };
  }, [playerRef, sourceUrl, reloadToken]);

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
          "--video-brand": "#ededed",
        } as React.CSSProperties}
      >
        <MediaOutlet />
        <MediaCommunitySkin />
      </MediaPlayer>
    </Box>
  );
}

export default PlaybackSurface;
