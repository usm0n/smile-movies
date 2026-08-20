import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/joy";
import { MediaOutlet, MediaPlayer } from "@vidstack/react";
import "vidstack/styles/defaults.css";
import {
  ProviderSourceFormat,
  VixsrcPlaybackStream,
} from "../../types/providers";
import PlayerChrome, { PlayerChromeProps } from "./PlayerChrome";
import {
  DEFAULT_SUBTITLE_APPEARANCE,
  SubtitleAppearance,
  clampSubtitleOffset,
  readSubtitleAppearance,
  readSubtitleOffset,
  writeSubtitleAppearance,
  writeSubtitleOffset,
} from "../../utilities/subtitlePrefs";

type ChromeOptions = Omit<
  PlayerChromeProps,
  "subtitleOffset" | "onSubtitleOffsetChange" | "appearance" | "onAppearanceChange"
>;

type CueLike = { startTime: number; endTime: number };
type TrackLike = {
  cues?: ReadonlyArray<CueLike>;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

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
  chrome,
  overlay,
  subtitleOffsetKey,
  videoInset,
  captionsLift,
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
  /** Everything the custom skin needs that only the page knows about. */
  chrome: ChromeOptions;
  /** Rendered inside `<media-player>` so it survives fullscreen. */
  overlay?: ReactNode;
  /** localStorage key the subtitle delay is remembered under. */
  subtitleOffsetKey: string;
  /**
   * CSS inset for the picture inside the player box.
   *
   * Watch-party layouts shrink the video to make room for the cameras. Doing it
   * here rather than by reparenting keeps the whole arrangement inside
   * `<media-player>`, so it survives fullscreen.
   */
  videoInset?: string;
  /** Pixels to raise the captions by, so a layout cannot cover them. */
  captionsLift?: number;
}) {
  const playbackReadyRef = useRef(false);

  /**
   * hls.js tuning for streams that arrive the long way round.
   *
   * Some providers — AnimeKai above all — cannot be fetched by the browser
   * directly, so their segments are relayed through an edge worker. That relay
   * adds latency and makes delivery bursty, and hls.js's defaults are built for
   * a CDN answering from down the street: thirty seconds of buffer, an ABR
   * estimate that starts optimistic, and few retries. The result is a stream
   * that plays, drains its buffer on one slow segment, and stalls — the
   * stuttering that made anime feel broken on desktop while the same player
   * handled other providers fine.
   *
   * Everything here buys headroom: a deeper buffer to ride out a slow segment,
   * a cautious opening bandwidth guess so the first fragments are small enough
   * to arrive quickly, and enough retries that one failed segment is recovered
   * from rather than fatal. The back buffer is capped in exchange, so the
   * deeper forward buffer does not cost memory on a long film.
   */
  const applyHlsConfig = useCallback((provider: unknown) => {
    if (!provider || (provider as { type?: string }).type !== "hls") return;

    (provider as { config: Record<string, unknown> }).config = {
      lowLatencyMode: false,
      backBufferLength: 30,
      maxBufferLength: 60,
      maxMaxBufferLength: 180,
      maxBufferSize: 120 * 1000 * 1000,
      maxBufferHole: 0.5,
      // A relayed segment can take a while; giving up after two tries turns a
      // slow fetch into a playback error.
      fragLoadingMaxRetry: 8,
      fragLoadingRetryDelay: 500,
      fragLoadingMaxRetryTimeout: 8000,
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
      nudgeMaxRetry: 8,
      // Start conservative rather than picking 1080p off an unmeasured link and
      // spending the first ten seconds rebuffering.
      abrEwmaDefaultEstimate: 800_000,
      startLevel: -1,
    };
  }, []);

  const configureHls = useCallback(
    (event: Event) => applyHlsConfig((event as CustomEvent<unknown>).detail),
    [applyHlsConfig],
  );

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

  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [appearance, setAppearance] = useState<SubtitleAppearance>(
    DEFAULT_SUBTITLE_APPEARANCE,
  );
  /**
   * How much shift is already baked into each track's cues. Offsets are applied
   * by moving the cues themselves, so re-applying has to be a delta against
   * what was applied last time rather than the absolute value.
   */
  const appliedOffsetsRef = useRef(new WeakMap<object, number>());

  useEffect(() => {
    setSubtitleOffset(readSubtitleOffset(subtitleOffsetKey));
  }, [subtitleOffsetKey]);

  useEffect(() => {
    setAppearance(readSubtitleAppearance());
  }, []);

  const handleSubtitleOffsetChange = useCallback(
    (value: number) => {
      const offset = clampSubtitleOffset(value);
      setSubtitleOffset(offset);
      writeSubtitleOffset(subtitleOffsetKey, offset);
    },
    [subtitleOffsetKey],
  );

  const handleAppearanceChange = useCallback((value: SubtitleAppearance) => {
    setAppearance(value);
    writeSubtitleAppearance(value);
  }, []);

  /**
   * Community subtitles are cut against one particular release; the stream a
   * provider hands us is usually a different one, which is why a track can be
   * the right language and the right episode and still drift a second or two.
   * Shifting the parsed cues fixes it for whatever the viewer is actually
   * watching, without waiting on the source to publish a better file.
   */
  useEffect(() => {
    const player = playerRef.current;
    const trackList = player?.textTracks;
    if (!trackList) return;

    const applyToTrack = (track: TrackLike) => {
      const cues = track?.cues;
      if (!cues?.length) return;

      const applied = appliedOffsetsRef.current.get(track as object) || 0;
      const delta = subtitleOffset - applied;
      if (!delta) return;

      cues.forEach((cue) => {
        const start = Math.max(0, cue.startTime + delta);
        const end = Math.max(start, cue.endTime + delta);
        cue.startTime = start;
        cue.endTime = end;
      });
      appliedOffsetsRef.current.set(track as object, subtitleOffset);
    };

    const applyToAll = () => {
      for (const track of trackList as Iterable<TrackLike>) {
        applyToTrack(track);
      }
    };

    // Cues only exist once a track has been fetched and parsed, so tracks are
    // shifted both now and as each one finishes loading.
    const trackLoadListeners = new Map<TrackLike, () => void>();
    const watchTrack = (track: TrackLike) => {
      if (trackLoadListeners.has(track)) return;
      const listener = () => applyToTrack(track);
      trackLoadListeners.set(track, listener);
      track.addEventListener("load", listener);
    };

    for (const track of trackList as Iterable<TrackLike>) {
      watchTrack(track);
    }
    applyToAll();

    const handleTrackAdded = (event: Event) => {
      const track = (event as CustomEvent<TrackLike>).detail;
      if (!track) return;
      watchTrack(track);
      applyToTrack(track);
    };

    trackList.addEventListener("add", handleTrackAdded);

    return () => {
      trackList.removeEventListener("add", handleTrackAdded);
      trackLoadListeners.forEach((listener, track) => {
        track.removeEventListener("load", listener);
      });
    };
  }, [playerRef, sourceUrl, reloadToken, subtitleOffset]);

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
    player.addEventListener("provider-change", configureHls);
    // The provider can already be in place by the time this effect runs — for
    // an eagerly loading player it usually is — and that fires the event before
    // anyone is listening.
    applyHlsConfig((player as { provider?: unknown }).provider);

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
      player.removeEventListener("provider-change", configureHls);
    };
  }, [applyHlsConfig, configureHls, playerRef, sourceUrl, reloadToken]);

  if (!sourceUrl) {
    return null;
  }

  return (
    <Box
      style={
        {
          "--sm-video-inset": videoInset || "0px",
          // Subtitles belong on the picture, so they rise with its bottom edge.
          "--sm-captions-lift": `${captionsLift || 0}px`,
        } as React.CSSProperties
      }
      sx={{
        position: "absolute",
        inset: 0,
        background: "black",
        "& media-player": {
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          fontFamily: "var(--smile-fontFamily-body)",
        },
        // The player fills the viewport, so the video is letterboxed inside it
        // rather than the page scrolling around a 16:9 box.
        //
        // The video is not a direct child of the outlet — Vidstack wraps it in a
        // `<shadow-root>` element that has no size of its own, so a percentage
        // height on the video resolves against `auto` and collapses back to the
        // file's own dimensions. That is invisible in a window (the width still
        // fills) but obvious in fullscreen, where the picture stays at its
        // intrinsic size instead of growing to the screen. Taking the video out
        // of flow against the outlet sizes it from the player box directly,
        // whatever wrappers sit in between.
        "& media-outlet": {
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
        },
        "& media-outlet video": {
          position: "absolute",
          inset: "var(--sm-video-inset, 0px)",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          transition: "inset 220ms ease",
        },
        // Captions ride above the control bar while it is visible, and above
        // the camera strip when a layout puts one there.
        "& media-captions": {
          transition: "transform 200ms ease",
          transform: "translateY(calc(-56px - var(--sm-captions-lift, 0px)))",
        },
        "& media-player[data-user-idle]:not([data-paused]) media-captions": {
          transform: "translateY(0)",
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
        thumbnails={stream?.thumbnailTrackUrl || undefined}
        poster={poster}
        load="eager"
        streamType="on-demand"
        viewType="video"
        keyTarget="document"
        crossorigin
        playsinline
        preferNativeHLS={sourceMimeType.includes("mpegurl") ? false : undefined}
        style={
          {
            "--media-border-radius": "0px",
            "--media-focus-ring": "0 0 0 3px #0070f3",
          } as React.CSSProperties
        }
      >
        <MediaOutlet />
        <PlayerChrome
          {...chrome}
          subtitleOffset={subtitleOffset}
          onSubtitleOffsetChange={handleSubtitleOffsetChange}
          appearance={appearance}
          onAppearanceChange={handleAppearanceChange}
        />
        {overlay}
      </MediaPlayer>
    </Box>
  );
}

export default PlaybackSurface;
