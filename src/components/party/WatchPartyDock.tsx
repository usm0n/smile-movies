import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/joy";
import {
  Chat,
  Close,
  ContentCopy,
  Mic,
  MicOff,
  People,
  PhoneOff,
  Send,
  Smile,
  Layers,
  Videocam,
  VideocamOff,
} from "../ui/icons";
import { copyToClipboard } from "../../utilities/defaults";
import { toast } from "../ui/toast";
import { WatchPartySession } from "./useWatchPartySession";
import { ParticipantAudio, ParticipantTile } from "./ParticipantMedia";
import {
  PARTY_LAYOUTS,
  PartyLayout,
  THEATER_STRIP_PX,
  gridShape,
} from "./partyLayout";

const REACTIONS = ["😂", "😍", "😱", "🔥", "👏", "😴"];

const roundButtonStyles = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "50%",
  backgroundColor: "rgba(10,10,10,0.72)",
  backdropFilter: "blur(8px)",
  color: "#ededed",
  cursor: "pointer",
  pointerEvents: "auto",
  transition: "background-color 150ms ease, border-color 150ms ease",
  "&:hover": {
    backgroundColor: "rgba(26,26,26,0.92)",
    borderColor: "rgba(255,255,255,0.32)",
    color: "#ffffff",
  },
} as const;

/**
 * Everything the party adds on top of the video: who is here, what they are
 * saying, and the controls for joining in.
 *
 * It renders inside `<media-player>` so none of it disappears in fullscreen,
 * which is where a film actually gets watched. The layer itself is
 * click-through — only the controls take the pointer — so the video underneath
 * still responds to a click beside them.
 */
function WatchPartyDock({
  session,
  layout,
  onLayoutChange,
  onExit,
}: {
  session: WatchPartySession;
  layout: PartyLayout;
  onLayoutChange: (layout: PartyLayout) => void;
  onExit: () => void;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { people, messages, party, self } = session;
  const inCall = people.filter((person) => person.sessionId);

  const setChatOpen = session.setChatOpen;
  useEffect(() => {
    setChatOpen(isChatOpen);
  }, [isChatOpen, setChatOpen]);

  useEffect(() => {
    if (!isChatOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isChatOpen, messages.length]);

  const copyInvite = () => {
    copyToClipboard(`${window.location.origin}/party/${session.code}`);
    toast.success("Invite link copied — send it to anyone.");
  };

  const submitChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    session.sendChat(text);
    setChatInput("");
  };

  return (
    <>
      {/* Voices, whether or not the faces are on screen. */}
      {people.map((person) => (
        <ParticipantAudio key={`audio-${person.pid}`} person={person} />
      ))}

      {/* Reactions drifting up over the picture. */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none" }}>
        {session.reactions.map((reaction) => (
          <Box
            key={reaction.id}
            sx={{
              position: "absolute",
              bottom: 140,
              left: `${reaction.offset}%`,
              fontSize: 34,
              animation: "sm-reaction-float 4s ease-out forwards",
              "@keyframes sm-reaction-float": {
                "0%": { opacity: 0, transform: "translateY(0) scale(0.6)" },
                "15%": { opacity: 1, transform: "translateY(-20px) scale(1.1)" },
                "100%": { opacity: 0, transform: "translateY(-220px) scale(0.9)" },
              },
            }}
          >
            {reaction.emoji}
          </Box>
        ))}
      </Box>

      {/* Who the room is waiting for, while it waits. */}
      {session.waitingFor.length ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            borderRadius: "999px",
            border: "1px solid #1f1f1f",
            backgroundColor: "rgba(10,10,10,0.88)",
            backdropFilter: "blur(10px)",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#f5a623",
              animation: "sm-wait-pulse 1.1s ease-in-out infinite",
              "@keyframes sm-wait-pulse": {
                "0%, 100%": { opacity: 0.35 },
                "50%": { opacity: 1 },
              },
            }}
          />
          <Typography level="body-sm" sx={{ color: "#ededed" }}>
            {session.waitingFor.length === 1
              ? `Waiting for ${session.waitingFor[0]}…`
              : `Waiting for ${session.waitingFor.length} people…`}
          </Typography>
        </Box>
      ) : null}

      {/* Playback cannot start on its own until this tab has been touched. */}
      {session.needsGesture ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.72)",
            pointerEvents: "auto",
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={session.acceptGesture}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: "8px",
              border: "1px solid #333333",
              backgroundColor: "#ededed",
              color: "#000000",
              fontFamily: "body",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tap to watch along
          </Box>
        </Box>
      ) : null}

      {/* Theatre: a row of equal tiles across the bottom of the player. */}
      {layout === "theater" && inCall.length ? (
        <Box
          className="no-scrollbar"
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: THEATER_STRIP_PX,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 1.5,
            overflowX: "auto",
            backgroundColor: "#050505",
            borderTop: "1px solid #1f1f1f",
            pointerEvents: "auto",
          }}
        >
          {inCall.map((person) => (
            <ParticipantTile
              key={person.pid}
              person={person}
              size={THEATER_STRIP_PX * 1.28}
              speaking={session.someoneSpeaking === person.displayName}
            />
          ))}
        </Box>
      ) : null}

      {/* Equal grid: the video holds the first cell, cameras fill the rest. */}
      {layout === "grid" && inCall.length ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "grid",
            gridTemplateColumns: `repeat(${gridShape(inCall.length + 1).columns}, 1fr)`,
            gridTemplateRows: `repeat(${gridShape(inCall.length + 1).rows}, 1fr)`,
            gap: "2px",
            pointerEvents: "none",
          }}
        >
          {/* The picture itself occupies this cell. */}
          <Box />
          {inCall.map((person) => (
            <Box
              key={person.pid}
              sx={{
                position: "relative",
                minWidth: 0,
                minHeight: 0,
                pointerEvents: "auto",
              }}
            >
              <ParticipantTile
                person={person}
                fill
                speaking={session.someoneSpeaking === person.displayName}
              />
            </Box>
          ))}
        </Box>
      ) : null}

      {/* The rail: faces, then the controls under them. */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: 8, md: 16 },
          bottom:
            layout === "theater" && inCall.length
              ? { xs: 84 + THEATER_STRIP_PX, md: 104 + THEATER_STRIP_PX }
              : { xs: 84, md: 104 },
          zIndex: 7,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
          pointerEvents: "none",
        }}
      >
        {layout === "spotlight" && inCall.length ? (
          <Box
            className="no-scrollbar"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              maxHeight: "45vh",
              overflowY: "auto",
              pointerEvents: "auto",
            }}
          >
            {inCall.map((person) => (
              <ParticipantTile
                key={person.pid}
                person={person}
                speaking={session.someoneSpeaking === person.displayName}
              />
            ))}
          </Box>
        ) : null}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, position: "relative" }}>
          {isLayoutOpen ? (
            <Box
              sx={{
                position: "absolute",
                bottom: 48,
                right: 0,
                width: 244,
                py: 0.5,
                borderRadius: "10px",
                border: "1px solid #1f1f1f",
                backgroundColor: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(12px)",
                pointerEvents: "auto",
              }}
            >
              {PARTY_LAYOUTS.map((option) => (
                <Box
                  key={option.id}
                  component="button"
                  type="button"
                  onClick={() => {
                    onLayoutChange(option.id);
                    setIsLayoutOpen(false);
                  }}
                  sx={{
                    display: "block",
                    width: "100%",
                    px: 1.25,
                    py: 0.75,
                    border: "none",
                    background:
                      option.id === layout ? "#1a1a1a" : "transparent",
                    color: option.id === layout ? "#ededed" : "#a1a1a1",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "body",
                    "&:hover": { background: "#141414", color: "#ededed" },
                  }}
                >
                  <Box sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                    {option.label}
                  </Box>
                  <Box sx={{ fontSize: "0.6875rem", color: "#707070" }}>
                    {option.description}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : null}

          {isReactionsOpen ? (
            <Box
              sx={{
                position: "absolute",
                bottom: 48,
                right: 0,
                display: "flex",
                gap: 0.25,
                px: 0.75,
                py: 0.5,
                borderRadius: "999px",
                border: "1px solid #1f1f1f",
                backgroundColor: "rgba(10,10,10,0.94)",
                backdropFilter: "blur(12px)",
                pointerEvents: "auto",
              }}
            >
              {REACTIONS.map((emoji) => (
                <Box
                  key={emoji}
                  component="button"
                  type="button"
                  onClick={() => {
                    session.sendReaction(emoji);
                    setIsReactionsOpen(false);
                  }}
                  sx={{
                    border: "none",
                    background: "transparent",
                    fontSize: 22,
                    lineHeight: 1,
                    px: 0.5,
                    py: 0.25,
                    cursor: "pointer",
                    borderRadius: "8px",
                    transition: "transform 120ms ease",
                    "&:hover": { transform: "scale(1.25)" },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
          ) : null}

          {session.voiceAvailable ? (
            <>
              <Box
                component="button"
                type="button"
                aria-label={session.micOn ? "Mute microphone" : "Unmute microphone"}
                title={session.micOn ? "Mute microphone" : "Unmute microphone"}
                onClick={session.toggleMic}
                sx={{
                  ...roundButtonStyles,
                  backgroundColor: session.micOn
                    ? "rgba(62,207,142,0.22)"
                    : roundButtonStyles.backgroundColor,
                  borderColor: session.micOn ? "rgba(62,207,142,0.5)" : roundButtonStyles.border,
                }}
              >
                {session.micOn ? (
                  <Mic sx={{ fontSize: 18 }} />
                ) : (
                  <MicOff sx={{ fontSize: 18 }} />
                )}
              </Box>
              <Box
                component="button"
                type="button"
                aria-label={session.camOn ? "Turn camera off" : "Turn camera on"}
                title={session.camOn ? "Turn camera off" : "Turn camera on"}
                onClick={session.toggleCam}
                sx={{
                  ...roundButtonStyles,
                  backgroundColor: session.camOn
                    ? "rgba(62,207,142,0.22)"
                    : roundButtonStyles.backgroundColor,
                }}
              >
                {session.camOn ? (
                  <Videocam sx={{ fontSize: 18 }} />
                ) : (
                  <VideocamOff sx={{ fontSize: 18 }} />
                )}
              </Box>
            </>
          ) : null}

          <Box
            component="button"
            type="button"
            aria-label="Change layout"
            title="Change layout"
            onClick={() => {
              setIsLayoutOpen((open) => !open);
              setIsReactionsOpen(false);
            }}
            sx={roundButtonStyles}
          >
            <Layers sx={{ fontSize: 18 }} />
          </Box>

          <Box
            component="button"
            type="button"
            aria-label="Send a reaction"
            title="Send a reaction"
            onClick={() => {
              setIsReactionsOpen((open) => !open);
              setIsLayoutOpen(false);
            }}
            sx={roundButtonStyles}
          >
            <Smile sx={{ fontSize: 18 }} />
          </Box>

          <Box
            component="button"
            type="button"
            aria-label="Party chat"
            title="Party chat"
            onClick={() => setIsChatOpen((open) => !open)}
            sx={{ ...roundButtonStyles, position: "relative" }}
          >
            <Chat sx={{ fontSize: 18 }} />
            {session.unreadCount && !isChatOpen ? (
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 17,
                  height: 17,
                  px: 0.5,
                  borderRadius: "999px",
                  backgroundColor: "#f5a623",
                  color: "#000000",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {session.unreadCount > 9 ? "9+" : session.unreadCount}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>

      {/* Chat, as a sheet on the right so it never covers the subtitles. */}
      {isChatOpen ? (
        <Box
          role="dialog"
          aria-label="Party chat"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 9,
            width: { xs: "100%", sm: 340 },
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(10,10,10,0.96)",
            backdropFilter: "blur(16px)",
            borderLeft: "1px solid #1f1f1f",
            pointerEvents: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <People sx={{ fontSize: 16, color: "#a1a1a1" }} />
            <Typography level="title-sm" sx={{ flex: 1, color: "#ededed" }}>
              {people.length} watching
            </Typography>
            <Box
              component="button"
              type="button"
              aria-label="Copy invite link"
              title="Copy invite link"
              onClick={copyInvite}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                height: 28,
                borderRadius: "6px",
                border: "1px solid #1f1f1f",
                background: "transparent",
                color: "#a1a1a1",
                fontFamily: "code",
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "#ededed", borderColor: "#333333" },
              }}
            >
              <ContentCopy sx={{ fontSize: 13 }} />
              {session.code}
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Close chat"
              onClick={() => setIsChatOpen(false)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                border: "none",
                borderRadius: "6px",
                background: "transparent",
                color: "#a1a1a1",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#111111", color: "#ededed" },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 1.5,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {messages.length === 0 ? (
              <Typography level="body-sm" sx={{ textAlign: "center", mt: 3 }}>
                Nobody has said anything yet.
              </Typography>
            ) : null}
            {messages.map((message) => {
              const isMine = message.pid === self?.pid;
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  {!isMine ? (
                    <Typography level="body-xs" sx={{ mb: 0.25 }}>
                      {message.displayName}
                    </Typography>
                  ) : null}
                  <Box
                    sx={{
                      maxWidth: "85%",
                      px: 1.25,
                      py: 0.75,
                      borderRadius: isMine
                        ? "12px 12px 4px 12px"
                        : "12px 12px 12px 4px",
                      backgroundColor: isMine ? "#ededed" : "#1a1a1a",
                      color: isMine ? "#0a0a0a" : "#ededed",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography
                      level="body-sm"
                      sx={{ color: "inherit", fontSize: "0.8125rem" }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              p: 1.25,
              borderTop: "1px solid #1f1f1f",
            }}
          >
            <Box
              component="input"
              value={chatInput}
              placeholder="Say something…"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setChatInput(event.target.value.slice(0, 400))
              }
              onKeyDown={(event: React.KeyboardEvent) => {
                // The player listens for space and arrows on the document.
                event.stopPropagation();
                if (event.key === "Enter") submitChat();
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                px: 1.25,
                height: 36,
                borderRadius: "8px",
                border: "1px solid #1f1f1f",
                backgroundColor: "#111111",
                color: "#ededed",
                fontFamily: "body",
                fontSize: "0.8125rem",
                outline: "none",
                "&:focus": { borderColor: "#333333" },
              }}
            />
            <Box
              component="button"
              type="button"
              aria-label="Send message"
              onClick={submitChat}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#ededed",
                color: "#0a0a0a",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#ffffff" },
              }}
            >
              <Send sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          <Box sx={{ px: 1.5, pb: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {session.isHost ? (
              <Box
                component="button"
                type="button"
                onClick={() =>
                  session.setControlMode(
                    party?.control === "host" ? "everyone" : "host",
                  )
                }
                sx={{
                  px: 1.25,
                  py: 0.75,
                  textAlign: "left",
                  borderRadius: "8px",
                  border: "1px solid #1f1f1f",
                  backgroundColor: "transparent",
                  color: "#a1a1a1",
                  fontFamily: "body",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  "&:hover": { color: "#ededed", borderColor: "#333333" },
                }}
              >
                {party?.control === "host"
                  ? "Only you can play and pause — tap to let everyone"
                  : "Everyone can play and pause — tap to make it host-only"}
              </Box>
            ) : null}
            <Box sx={{ display: "flex", gap: 0.75 }}>
              <Box
                component="button"
                type="button"
                onClick={session.resync}
                sx={{
                  flex: 1,
                  py: 0.75,
                  borderRadius: "8px",
                  border: "1px solid #1f1f1f",
                  backgroundColor: "transparent",
                  color: "#a1a1a1",
                  fontFamily: "body",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  "&:hover": { color: "#ededed", borderColor: "#333333" },
                }}
              >
                Out of sync? Catch up
              </Box>
              <Box
                component="button"
                type="button"
                onClick={onExit}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: "8px",
                  border: "1px solid rgba(255,90,90,0.3)",
                  backgroundColor: "transparent",
                  color: "#ff7a7a",
                  fontFamily: "body",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  "&:hover": { borderColor: "rgba(255,90,90,0.6)" },
                }}
              >
                <PhoneOff sx={{ fontSize: 14 }} />
                Leave
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </>
  );
}

export default WatchPartyDock;
