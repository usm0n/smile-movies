import { useEffect } from "react";
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
