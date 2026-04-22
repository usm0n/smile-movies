import { useEffect } from "react";
import { StreamServer } from "../../stream-res";

function PlaybackSurface({
  mode,
  movieType,
  movieId,
  seasonId,
  episodeId,
  isTvSE,
  videoRef,
  streamServer,
  onLoadedMetadata,
  onTimeUpdate,
  onPause,
  onEnded,
}: {
  mode: "internal" | "external";
  movieType: string;
  movieId: string;
  seasonId?: string;
  episodeId?: string;
  isTvSE: string | undefined;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  streamServer: StreamServer | null;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPause: () => void;
  onEnded: () => void;
}) {
  useEffect(() => {
    if (mode !== "internal" || !videoRef.current || !streamServer?.url) {
      return;
    }

    const video = videoRef.current;
    const url = streamServer.url;
    const isHlsLikeSource =
      /vixsrc|playlist|m3u8/i.test(`${streamServer.name} ${url}`);
    let disposed = false;
    let hlsInstance: { destroy: () => void } | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    if (isHlsLikeSource) {
      void import("hls.js").then(({ default: Hls }) => {
        if (disposed || !videoRef.current || !Hls.isSupported()) {
          return;
        }

        const hls = new Hls({
          enableWorker: true,
        });
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hlsInstance = hls;
      });

      return () => {
        disposed = true;
        hlsInstance?.destroy();
      };
    }

    video.src = url;
    return () => {
      disposed = true;
      hlsInstance?.destroy();
    };
  }, [mode, streamServer, videoRef]);

  if (mode === "external") {
    return (
      <iframe
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://vixsrc.to/${movieType}/${movieId}${
          isTvSE ? `/${seasonId}` : ""
        }${isTvSE ? `/${episodeId}` : ""}`}
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "5px",
          position: "absolute",
          top: 0,
          zIndex: 1000,
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onPause={onPause}
      onEnded={onEnded}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        zIndex: 1000,
      }}
    />
  );
}

export default PlaybackSurface;
