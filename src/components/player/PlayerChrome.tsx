import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/joy";
import {
  MediaCaptions,
  MediaSliderThumbnail,
  MediaSliderValue,
  MediaTime,
  MediaTimeSlider,
  MediaVolumeSlider,
  useMediaPlayer,
  useMediaRemote,
  useMediaStore,
} from "@vidstack/react";
import {
  ArrowBackIos,
  Check,
  Forward10,
  Fullscreen,
  FullscreenExit,
  Info,
  ListVideo,
  Loader,
  Pause,
  PictureInPicture,
  PlayArrow,
  Replay10,
  Server,
  Settings,
  SkipNext,
  Subtitles,
  SubtitlesOff,
  VolumeDown,
  VolumeOff,
  VolumeUp,
} from "../ui/icons";
import {
  SubtitleAppearance,
  clampSubtitleOffset,
  formatSubtitleOffset,
} from "../../utilities/subtitlePrefs";

const SEEK_SECONDS = 10;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const OFFSET_STEPS = [-0.5, -0.1, 0.1, 0.5];

type PopoverId = "captions" | "settings" | null;

export type PlayerChromeProps = {
  title: string;
  /** Second line under the title — "S2 · E4 · Episode name" for series. */
  subtitle?: string;
  /** Third line under the title — rating, parental guide, info. */
  titleMeta?: ReactNode;
  onBack?: () => void;
  /** Page-level actions (watch party, share) pinned to the top-right. */
  topRight?: ReactNode;
  onOpenEpisodes?: () => void;
  onOpenSources?: () => void;
  onOpenInfo?: () => void;
  /** Shown next to the sources button — "Vixsrc · Server 2". */
  sourcesLabel?: string;
  onNextEpisode?: () => void;
  subtitleOffset: number;
  onSubtitleOffsetChange: (offset: number) => void;
  appearance: SubtitleAppearance;
  onAppearanceChange: (appearance: SubtitleAppearance) => void;
};

const controlButtonStyles = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  height: 36,
  minWidth: 36,
  px: 0,
  border: "none",
  borderRadius: "6px",
  background: "transparent",
  color: "#ededed",
  cursor: "pointer",
  fontFamily: "body",
  fontSize: "0.8125rem",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  transition: "background-color 150ms ease, color 150ms ease",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
  "&:focus-visible": {
    outline: "none",
    boxShadow: "0 0 0 2px rgba(0,0,0,0.8), 0 0 0 4px #0070f3",
  },
  "&[aria-pressed='true']": { color: "#ffffff" },
} as const;

/** Icon-and-optional-label control used across the bar. */
function ControlButton({
  label,
  onClick,
  children,
  pressed,
  text,
  disabled,
  hideOnMobile,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
  text?: string;
  disabled?: boolean;
  /** Controls that are dropped on narrow screens to keep the bar on one row. */
  hideOnMobile?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        onClick();
      }}
      sx={{
        ...controlButtonStyles,
        height: { xs: 32, md: 36 },
        minWidth: { xs: 32, md: 36 },
        ...(text ? { px: 1.25 } : {}),
        ...(disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}),
        ...(hideOnMobile
          ? { display: { xs: "none", sm: "inline-flex" } }
          : {}),
      }}
    >
      {children}
      {text ? <Box component="span">{text}</Box> : null}
    </Box>
  );
}

function PopoverSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ px: 1, py: 1, "& + &": { borderTop: "1px solid #1f1f1f" } }}>
      <Typography
        level="body-xs"
        sx={{
          px: 1,
          pb: 0.75,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 500,
          color: "#707070",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function PopoverOption({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        width: "100%",
        px: 1,
        py: 0.75,
        border: "none",
        borderRadius: "4px",
        background: "transparent",
        color: selected ? "#ededed" : "#a1a1a1",
        cursor: "pointer",
        fontFamily: "body",
        fontSize: "0.8125rem",
        fontWeight: 500,
        textAlign: "left",
        "&:hover": { backgroundColor: "#111111", color: "#ededed" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Box>
        {hint ? (
          <Box sx={{ fontSize: "0.6875rem", fontWeight: 400, color: "#707070" }}>
            {hint}
          </Box>
        ) : null}
      </Box>
      {selected ? <Check sx={{ fontSize: 15, flexShrink: 0 }} /> : null}
    </Box>
  );
}

function Popover({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        bottom: "calc(100% + 8px)",
        width: 288,
        maxHeight: "min(60vh, 420px)",
        overflowY: "auto",
        borderRadius: "12px",
        border: "1px solid #1f1f1f",
        backgroundColor: "#0a0a0a",
        boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
        pointerEvents: "auto",
      }}
      onClick={(event: React.MouseEvent) => event.stopPropagation()}
    >
      {children}
    </Box>
  );
}

/**
 * The player's own controls.
 *
 * Vidstack's community skin is a different design language to the rest of the
 * app, so the chrome is rebuilt here out of the Vercel tokens: monochrome
 * fills, hairline borders, Geist type and Lucide strokes. Everything lives
 * inside `<media-player>` rather than in a portal — the player is the
 * fullscreen element, and anything portalled to `document.body` disappears the
 * moment the viewer goes fullscreen.
 */
function PlayerChrome({
  title,
  subtitle,
  titleMeta,
  onBack,
  topRight,
  onOpenEpisodes,
  onOpenSources,
  onOpenInfo,
  sourcesLabel,
  onNextEpisode,
  subtitleOffset,
  onSubtitleOffsetChange,
  appearance,
  onAppearanceChange,
}: PlayerChromeProps) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const {
    paused,
    started,
    waiting,
    muted,
    volume,
    fullscreen,
    canPictureInPicture,
    pictureInPicture,
    textTracks,
    textTrack,
    qualities,
    quality,
    autoQuality,
    canSetQuality,
    playbackRate,
    userIdle,
    touchPointer,
  } = useMediaStore();
  const [popover, setPopover] = useState<PopoverId>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const captionTracks = useMemo(
    () =>
      (textTracks || []).filter(
        (track) => track.kind === "subtitles" || track.kind === "captions",
      ),
    [textTracks],
  );
  const captionsOn = Boolean(textTrack);

  /**
   * An open menu must survive the idle timer — otherwise the controls fade out
   * from under the viewer's cursor while they are still reading them.
   */
  useEffect(() => {
    if (!popover) return;
    remote.pauseUserIdle();
    return () => remote.resumeUserIdle();
  }, [popover, remote]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const togglePopover = useCallback((id: Exclude<PopoverId, null>) => {
    setPopover((current) => (current === id ? null : id));
  }, []);

  const seekBy = useCallback(
    (seconds: number) => {
      if (!player) return;

      // Read the position off the element rather than the React store: the
      // store proxy subscribes whatever it touches, and subscribing to
      // `currentTime` would re-render the whole chrome four times a second.
      const state = (player as unknown as {
        state?: { currentTime?: number; duration?: number };
      }).state;
      const duration = Number(state?.duration || 0) || Infinity;
      const nextTime = Math.max(
        0,
        Math.min(duration, Number(state?.currentTime || 0) + seconds),
      );
      remote.seek(nextTime);
    },
    [player, remote],
  );

  const selectTextTrack = useCallback(
    (index: number) => {
      (textTracks || []).forEach((_track, trackIndex) => {
        if (trackIndex === index) return;
        remote.changeTextTrackMode(trackIndex, "disabled");
      });

      if (index >= 0) {
        remote.changeTextTrackMode(index, "showing");
      }
    },
    [remote, textTracks],
  );

  const nudgeOffset = useCallback(
    (delta: number) => {
      onSubtitleOffsetChange(clampSubtitleOffset(subtitleOffset + delta));
    },
    [onSubtitleOffsetChange, subtitleOffset],
  );

  const handleSurfaceClick = useCallback(() => {
    if (popover) {
      setPopover(null);
      return;
    }

    // On a phone the first tap is how you get the controls back, so it must not
    // also pause — that is the tap everyone makes when they just want to see
    // how much of the episode is left.
    if (touchPointer && userIdle) return;

    // Wait out the double-click window so "click to pause" and "double-click to
    // go fullscreen" don't both fire on the same gesture.
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      remote.togglePaused();
    }, 200);
  }, [popover, remote, touchPointer, userIdle]);

  const handleSurfaceDoubleClick = useCallback(() => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    remote.toggleFullscreen();
  }, [remote]);

  const volumeIcon = muted || volume === 0 ? VolumeOff : volume < 0.5 ? VolumeDown : VolumeUp;
  const VolumeIcon = volumeIcon;

  return (
    <>
      <MediaCaptions
        className="sm-captions"
        style={
          {
            "--media-cue-font-size": `calc(var(--overlay-height, 480px) / 100 * ${(
              5 * appearance.fontScale
            ).toFixed(2)})`,
            "--media-cue-bg": `rgba(0, 0, 0, ${appearance.backgroundOpacity})`,
            "--media-cue-color": "#ffffff",
            "--media-cue-border-radius": "6px",
            "--media-cue-backdrop": appearance.backgroundOpacity
              ? "blur(6px)"
              : "none",
            "--media-cue-box-shadow": appearance.backgroundOpacity
              ? "none"
              : "0 2px 6px rgba(0,0,0,0.9)",
          } as React.CSSProperties
        }
      />

      {/* Click surface — sits under the controls so buttons win the pointer. */}
      <Box
        onClick={handleSurfaceClick}
        onDoubleClick={handleSurfaceDoubleClick}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {waiting && !paused ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Loader
            sx={{
              fontSize: 44,
              color: "#ededed",
              animation: "sm-spin 900ms linear infinite",
              "@keyframes sm-spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
        </Box>
      ) : null}

      <Box
        className="sm-chrome"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          opacity: 1,
          transition: "opacity 200ms ease",
          "media-player[data-user-idle]:not([data-paused]) &": {
            opacity: 0,
            pointerEvents: "none",
          },
          "& button": { pointerEvents: "auto" },
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            px: { xs: 1.5, md: 2.5 },
            pt: { xs: 1.5, md: 2 },
            pb: 6,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)",
          }}
        >
          {onBack ? (
            <ControlButton label="Back to details" onClick={onBack}>
              <ArrowBackIos sx={{ fontSize: 20 }} />
            </ControlButton>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
            <Typography
              level="title-md"
              sx={{
                color: "#ffffff",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textShadow: "0 1px 6px rgba(0,0,0,0.9)",
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                level="body-xs"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
            {titleMeta ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.75,
                  mt: 0.75,
                  "& > *": { pointerEvents: "auto" },
                }}
              >
                {titleMeta}
              </Box>
            ) : null}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              "& > *": { pointerEvents: "auto" },
            }}
          >
            {topRight}
          </Box>
        </Box>

        {/* Centre play affordance before the first frame plays */}
        {!started ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label="Play"
              onClick={() => remote.play()}
              sx={{
                ...controlButtonStyles,
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.95)",
                color: "#000000",
                "&:hover": { backgroundColor: "#ffffff", transform: "scale(1.04)" },
              }}
            >
              <PlayArrow sx={{ fontSize: 30, ml: "3px" }} strokeWidth={2} />
            </Box>
          </Box>
        ) : null}

        {/* Bottom bar */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            px: { xs: 1, md: 2.5 },
            pt: 8,
            pb: { xs: 1, md: 1.5 },
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
            "--media-slider-height": "24px",
            "--media-slider-track-height": "4px",
            "--media-slider-focused-track-height": "6px",
            "--media-slider-track-border-radius": "999px",
            "--media-slider-track-bg": "rgba(255,255,255,0.25)",
            "--media-slider-track-fill-bg": "#ededed",
            "--media-slider-track-progress-bg": "rgba(255,255,255,0.45)",
            "--media-slider-thumb-size": "13px",
            "--media-slider-thumb-bg": "#ffffff",
            "--media-slider-thumb-border": "none",
            "--media-slider-focused-thumb-shadow": "0 0 0 5px rgba(255,255,255,0.25)",
            "--media-slider-preview-gap": "6px",
            "--media-slider-value-bg": "#0a0a0a",
            "--media-slider-value-color": "#ededed",
            "--media-slider-value-border": "1px solid #1f1f1f",
            "--media-slider-value-border-radius": "6px",
            "--media-slider-value-padding": "3px 8px",
            "& media-time-slider": { pointerEvents: "auto" },
            "& media-volume-slider": { pointerEvents: "auto" },
            "& media-slider-thumbnail": {
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #1f1f1f",
              marginBottom: "6px",
            },
          }}
        >
          {/* The gradient stays click-through; only the controls themselves
              take the pointer, so a click beside them still pauses. */}
          <Box sx={{ px: { xs: 0.5, md: 0 }, pointerEvents: "auto" }}>
            <MediaTimeSlider>
              <div slot="preview">
                <MediaSliderThumbnail />
                <MediaSliderValue type="pointer" format="time" />
              </div>
            </MediaTimeSlider>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.25, md: 0.5 },
              mt: 0.5,
              position: "relative",
              pointerEvents: "auto",
            }}
          >
            <ControlButton
              label={paused ? "Play" : "Pause"}
              onClick={() => remote.togglePaused()}
            >
              {paused ? (
                <PlayArrow sx={{ fontSize: 22 }} strokeWidth={2} />
              ) : (
                <Pause sx={{ fontSize: 22 }} strokeWidth={2} />
              )}
            </ControlButton>
            <ControlButton
              label={`Back ${SEEK_SECONDS} seconds`}
              onClick={() => seekBy(-SEEK_SECONDS)}
            >
              <Replay10 sx={{ fontSize: 19 }} />
            </ControlButton>
            <ControlButton
              label={`Forward ${SEEK_SECONDS} seconds`}
              onClick={() => seekBy(SEEK_SECONDS)}
            >
              <Forward10 sx={{ fontSize: 19 }} />
            </ControlButton>
            {onNextEpisode ? (
              <ControlButton label="Next episode" onClick={onNextEpisode} hideOnMobile>
                <SkipNext sx={{ fontSize: 19 }} />
              </ControlButton>
            ) : null}

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                "&:hover .sm-volume, &:focus-within .sm-volume": {
                  width: 76,
                  opacity: 1,
                  marginLeft: "4px",
                  marginRight: "8px",
                },
              }}
            >
              <ControlButton
                label={muted ? "Unmute" : "Mute"}
                onClick={() => remote.toggleMuted()}
              >
                <VolumeIcon sx={{ fontSize: 20 }} />
              </ControlButton>
              <Box
                className="sm-volume"
                sx={{
                  width: 0,
                  opacity: 0,
                  overflow: "hidden",
                  transition:
                    "width 180ms ease, opacity 180ms ease, margin 180ms ease",
                  "--media-slider-track-fill-bg": "#ffffff",
                  "--media-slider-thumb-size": "11px",
                }}
              >
                <MediaVolumeSlider />
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.5,
                ml: 1,
                fontFamily: "code",
                fontSize: "0.8125rem",
                color: "#a1a1a1",
                fontVariantNumeric: "tabular-nums",
                "& media-time": { color: "#ededed" },
                "& media-time[type='duration']": { color: "#707070" },
              }}
            >
              <MediaTime type="current" />
              <Box component="span" sx={{ color: "#3d3d3d" }}>
                /
              </Box>
              <MediaTime type="duration" />
            </Box>

            <Box sx={{ flex: 1 }} />

            {onOpenInfo ? (
              <ControlButton label="About this episode" onClick={onOpenInfo}>
                <Info sx={{ fontSize: 19 }} />
              </ControlButton>
            ) : null}
            {onOpenEpisodes ? (
              <ControlButton label="Episodes" onClick={onOpenEpisodes}>
                <ListVideo sx={{ fontSize: 19 }} />
              </ControlButton>
            ) : null}
            {onOpenSources ? (
              <ControlButton
                label={sourcesLabel ? `Source — ${sourcesLabel}` : "Sources"}
                onClick={onOpenSources}
              >
                <Server sx={{ fontSize: 18 }} />
              </ControlButton>
            ) : null}

            <Box sx={{ position: "relative" }}>
              <ControlButton
                label={captionsOn ? "Subtitles on" : "Subtitles off"}
                pressed={popover === "captions"}
                onClick={() => togglePopover("captions")}
              >
                {captionsOn ? (
                  <Subtitles sx={{ fontSize: 20 }} />
                ) : (
                  <SubtitlesOff sx={{ fontSize: 20, color: "#a1a1a1" }} />
                )}
              </ControlButton>
              {popover === "captions" ? (
                <Popover>
                  <PopoverSection title="Subtitles">
                    <PopoverOption
                      label="Off"
                      selected={!captionsOn}
                      onClick={() => selectTextTrack(-1)}
                    />
                    {captionTracks.length ? (
                      (textTracks || []).map((track, index) =>
                        track.kind === "subtitles" || track.kind === "captions" ? (
                          <PopoverOption
                            key={track.id || `${track.label}-${index}`}
                            label={track.label || track.language || "Subtitle"}
                            selected={textTrack?.id === track.id}
                            onClick={() => selectTextTrack(index)}
                          />
                        ) : null,
                      )
                    ) : (
                      <Typography level="body-xs" sx={{ px: 1, py: 0.5 }}>
                        No subtitles for this source.
                      </Typography>
                    )}
                  </PopoverSection>

                  <PopoverSection title="Delay">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 0.5,
                      }}
                    >
                      {OFFSET_STEPS.slice(0, 2).map((step) => (
                        <Box
                          key={step}
                          component="button"
                          type="button"
                          onClick={() => nudgeOffset(step)}
                          sx={{ ...controlButtonStyles, px: 1, minWidth: 42 }}
                        >
                          {step}s
                        </Box>
                      ))}
                      <Typography
                        level="body-sm"
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          fontFamily: "code",
                          color: subtitleOffset ? "#ededed" : "#707070",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatSubtitleOffset(subtitleOffset)}
                      </Typography>
                      {OFFSET_STEPS.slice(2).map((step) => (
                        <Box
                          key={step}
                          component="button"
                          type="button"
                          onClick={() => nudgeOffset(step)}
                          sx={{ ...controlButtonStyles, px: 1, minWidth: 42 }}
                        >
                          +{step}s
                        </Box>
                      ))}
                    </Box>
                    <Typography level="body-xs" sx={{ px: 1, pt: 0.75 }}>
                      Negative shows the subtitles earlier. Remembered for this
                      title.
                    </Typography>
                    {subtitleOffset ? (
                      <PopoverOption
                        label="Reset to 0.00s"
                        onClick={() => onSubtitleOffsetChange(0)}
                      />
                    ) : null}
                  </PopoverSection>

                  <PopoverSection title="Text size">
                    <Box sx={{ display: "flex", gap: 0.5, px: 0.5 }}>
                      {[
                        { label: "S", value: 0.8 },
                        { label: "M", value: 1 },
                        { label: "L", value: 1.25 },
                        { label: "XL", value: 1.5 },
                      ].map((option) => (
                        <Box
                          key={option.label}
                          component="button"
                          type="button"
                          onClick={() =>
                            onAppearanceChange({
                              ...appearance,
                              fontScale: option.value,
                            })
                          }
                          sx={{
                            ...controlButtonStyles,
                            flex: 1,
                            backgroundColor:
                              appearance.fontScale === option.value
                                ? "#1a1a1a"
                                : "transparent",
                            color:
                              appearance.fontScale === option.value
                                ? "#ededed"
                                : "#a1a1a1",
                          }}
                        >
                          {option.label}
                        </Box>
                      ))}
                    </Box>
                  </PopoverSection>

                  <PopoverSection title="Background">
                    <Box sx={{ display: "flex", gap: 0.5, px: 0.5 }}>
                      {[
                        { label: "None", value: 0 },
                        { label: "Dim", value: 0.5 },
                        { label: "Solid", value: 0.9 },
                      ].map((option) => (
                        <Box
                          key={option.label}
                          component="button"
                          type="button"
                          onClick={() =>
                            onAppearanceChange({
                              ...appearance,
                              backgroundOpacity: option.value,
                            })
                          }
                          sx={{
                            ...controlButtonStyles,
                            flex: 1,
                            backgroundColor:
                              appearance.backgroundOpacity === option.value
                                ? "#1a1a1a"
                                : "transparent",
                            color:
                              appearance.backgroundOpacity === option.value
                                ? "#ededed"
                                : "#a1a1a1",
                          }}
                        >
                          {option.label}
                        </Box>
                      ))}
                    </Box>
                  </PopoverSection>
                </Popover>
              ) : null}
            </Box>

            <Box sx={{ position: "relative" }}>
              <ControlButton
                label="Settings"
                pressed={popover === "settings"}
                onClick={() => togglePopover("settings")}
              >
                <Settings sx={{ fontSize: 19 }} />
              </ControlButton>
              {popover === "settings" ? (
                <Popover>
                  <PopoverSection title="Speed">
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: 0.5 }}>
                      {PLAYBACK_RATES.map((rate) => (
                        <Box
                          key={rate}
                          component="button"
                          type="button"
                          onClick={() => remote.changePlaybackRate(rate)}
                          sx={{
                            ...controlButtonStyles,
                            px: 1.25,
                            fontFamily: "code",
                            backgroundColor:
                              playbackRate === rate ? "#1a1a1a" : "transparent",
                            color: playbackRate === rate ? "#ededed" : "#a1a1a1",
                          }}
                        >
                          {rate}×
                        </Box>
                      ))}
                    </Box>
                  </PopoverSection>

                  {canSetQuality && qualities.length ? (
                    <PopoverSection title="Quality">
                      <PopoverOption
                        label="Auto"
                        hint={
                          autoQuality && quality?.height
                            ? `Currently ${quality.height}p`
                            : undefined
                        }
                        selected={autoQuality}
                        onClick={() => remote.changeQuality(-1)}
                      />
                      {qualities.map((option, index) => (
                        <PopoverOption
                          key={`${option.height}-${index}`}
                          label={`${option.height}p`}
                          hint={
                            option.bitrate
                              ? `${Math.round(option.bitrate / 1000)} kbps`
                              : undefined
                          }
                          selected={!autoQuality && quality?.height === option.height}
                          onClick={() => remote.changeQuality(index)}
                        />
                      ))}
                    </PopoverSection>
                  ) : null}
                </Popover>
              ) : null}
            </Box>

            {canPictureInPicture ? (
              <ControlButton
                label={pictureInPicture ? "Exit picture in picture" : "Picture in picture"}
                onClick={() => remote.togglePictureInPicture()}
                hideOnMobile
              >
                <PictureInPicture sx={{ fontSize: 19 }} />
              </ControlButton>
            ) : null}

            <ControlButton
              label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => remote.toggleFullscreen()}
            >
              {fullscreen ? (
                <FullscreenExit sx={{ fontSize: 20 }} />
              ) : (
                <Fullscreen sx={{ fontSize: 20 }} />
              )}
            </ControlButton>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default PlayerChrome;
