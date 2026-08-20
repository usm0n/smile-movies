import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/joy";
import { MicOff } from "../ui/icons";
import { PartyPerson } from "./useWatchPartySession";

/**
 * A participant's camera, or their initial when the camera is off.
 *
 * Tracks arrive as bare `MediaStreamTrack`s rather than streams, so each one is
 * wrapped fresh whenever it changes — reusing the element's existing stream
 * leaves the previous track attached and the tile frozen on a still frame.
 */
export function ParticipantTile({
  person,
  size = 84,
  fill,
  speaking,
}: {
  person: PartyPerson;
  size?: number;
  /** Fill the parent instead of drawing at a fixed size — used by the grid. */
  fill?: boolean;
  speaking?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (person.videoTrack && person.camOn) {
      element.srcObject = new MediaStream([person.videoTrack]);
      void element.play().catch(() => undefined);
    } else {
      element.srcObject = null;
    }
  }, [person.camOn, person.videoTrack]);

  const showVideo = Boolean(person.videoTrack && person.camOn);

  return (
    <Box
      title={`${person.displayName}${person.isHost ? " · host" : ""}`}
      sx={{
        position: "relative",
        width: fill ? "100%" : size,
        height: fill ? "100%" : size * 0.75,
        borderRadius: fill ? "4px" : "10px",
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor: "#111111",
        border: "1.5px solid",
        borderColor: speaking ? "#3ecf8e" : "#1f1f1f",
        boxShadow: speaking ? "0 0 0 3px rgba(62,207,142,0.18)" : "none",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: showVideo ? "block" : "none",
          transform: person.isSelf ? "scaleX(-1)" : "none",
        }}
      />
      {!showVideo ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ededed",
            fontWeight: 600,
            fontSize: fill ? "2rem" : size * 0.3,
          }}
        >
          {person.displayName.slice(0, 1).toUpperCase()}
        </Box>
      ) : null}

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 0.75,
          py: 0.25,
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        }}
      >
        {person.sessionId && !person.micOn ? (
          <MicOff sx={{ fontSize: 12, color: "#f5a623", flexShrink: 0 }} />
        ) : null}
        <Typography
          level="body-xs"
          sx={{
            color: "#ffffff",
            fontSize: "0.625rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {person.isSelf ? "You" : person.displayName}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Remote audio, kept out of sight.
 *
 * In call-object mode Daily hands over tracks and plays nothing itself, so
 * without these elements a party is silent. They are mounted regardless of
 * whether the tiles are on screen — hiding the faces should not mute the
 * conversation.
 */
export function ParticipantAudio({ person }: { person: PartyPerson }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;

    if (person.audioTrack && !person.isSelf) {
      element.srcObject = new MediaStream([person.audioTrack]);
      void element.play().catch(() => undefined);
    } else {
      element.srcObject = null;
    }
  }, [person.audioTrack, person.isSelf]);

  if (person.isSelf) return null;
  return <audio ref={audioRef} autoPlay playsInline />;
}
