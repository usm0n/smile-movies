import { useEffect, useMemo } from "react";
import { Box } from "@mui/joy";
import { MediaCommunitySkin, MediaOutlet, MediaPlayer } from "@vidstack/react";
import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";
import { VixsrcPlaybackStream } from "../../types/providers";

function PlaybackSurface({
  playerRef,
  stream,
  poster,
  title,
  onLoadedMetadata,
  onTimeUpdate,
  onPause,
  onEnded,
}: {
  playerRef: React.MutableRefObject<any>;
  stream: VixsrcPlaybackStream | null;
  poster?: string;
  title: string;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPause: () => void;
  onEnded: () => void;
}) {
  const subtitleTracks = useMemo(() => {
    const languageMap: Record<string, string> = {
      eng: "en",
      ita: "it",
      spa: "es",
      fra: "fr",
      fre: "fr",
      deu: "de",
      ger: "de",
      por: "pt",
      ara: "ar",
      tur: "tr",
      rus: "ru",
      hin: "hi",
      ind: "id",
      jpn: "ja",
      kor: "ko",
      zho: "zh",
    };

    const normalizeLanguage = (value?: string) => {
      const raw = String(value || "und").trim().toLowerCase();
      if (!raw) return "en";

      const withoutForcedPrefix = raw.replace(/^forced[-_]/, "");
      if (languageMap[withoutForcedPrefix]) {
        return languageMap[withoutForcedPrefix];
      }

      if (/^[a-z]{2}(-[a-z]{2})?$/.test(withoutForcedPrefix)) {
        return withoutForcedPrefix;
      }

      if (/^[a-z]{3}$/.test(withoutForcedPrefix) && languageMap[withoutForcedPrefix]) {
        return languageMap[withoutForcedPrefix];
      }

      return "en";
    };

    return (stream?.subtitleTracks || []).map((track, index) => ({
      src: track.url,
      kind: "subtitles" as const,
      label: track.name || `Subtitle ${index + 1}`,
      language: normalizeLanguage(track.language),
      default: Boolean(track.isDefault || index === 0),
    }));
  }, [stream?.subtitleTracks]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !stream?.masterPlaylistUrl) {
      return;
    }

    const handleLoadedMetadataEvent = () => onLoadedMetadata();
    const handleTimeUpdateEvent = () => onTimeUpdate();
    const handlePauseEvent = () => onPause();
    const handleEndedEvent = () => onEnded();

    player.addEventListener("loaded-metadata", handleLoadedMetadataEvent);
    player.addEventListener("time-update", handleTimeUpdateEvent);
    player.addEventListener("pause", handlePauseEvent);
    player.addEventListener("ended", handleEndedEvent);

    return () => {
      player.removeEventListener("loaded-metadata", handleLoadedMetadataEvent);
      player.removeEventListener("time-update", handleTimeUpdateEvent);
      player.removeEventListener("pause", handlePauseEvent);
      player.removeEventListener("ended", handleEndedEvent);
    };
  }, [onEnded, onLoadedMetadata, onPause, onTimeUpdate, playerRef, stream?.masterPlaylistUrl]);

  if (!stream?.masterPlaylistUrl) {
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
        key={stream.masterPlaylistUrl}
        ref={playerRef}
        title={title}
        src={{
          src: stream.masterPlaylistUrl,
          type: "application/x-mpegurl",
        }}
        textTracks={subtitleTracks}
        poster={poster}
        load="eager"
        aspectRatio={16 / 9}
        streamType="on-demand"
        viewType="video"
        crossorigin
        playsinline
        preferNativeHLS={false}
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
