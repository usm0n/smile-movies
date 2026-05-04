import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  ContentCopy,
  People,
  Send,
  ArrowBackIos,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { watchPartyAPI, WatchParty, WatchPartyMessage } from "../service/api/smb/watchparty.api.service";
import { useUsers } from "../context/Users";
import { User } from "../user";
// import PlaybackSurface from "../components/player/PlaybackSurface";
import toast from "react-hot-toast";
import { copyToClipboard } from "../utilities/defaults";

const POLL_INTERVAL_MS = 2000;

function WatchPartyPage() {
  const { code } = useParams<{ code: string }>();
  const { myselfData } = useUsers();
  const [party, setParty] = useState<WatchParty | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const myUid = (myselfData?.data as User)?.id;
  const isHost = party?.hostUid === myUid;

  // Poll for party state
  useEffect(() => {
    if (!code) return;

    const fetchParty = async () => {
      try {
        const data = await watchPartyAPI.get(code);
        setParty(data);
      } catch {
        toast.error("Party not found or has ended.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchParty();
    const interval = setInterval(fetchParty, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [code]);

  // Scroll chat to bottom when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [party?.messages?.length]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !code) return;
    setSending(true);
    try {
      await watchPartyAPI.sendMessage(code, chatInput.trim());
      setChatInput("");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/party/${code}`;
    copyToClipboard(url);
    toast.success("Invite link copied!");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (!party) return null;

  const messages: WatchPartyMessage[] = party.messages || [];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Player */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <IconButton variant="plain" onClick={() => navigate(-1)}>
            <ArrowBackIos />
          </IconButton>
          <Typography level="title-md" sx={{ flex: 1 }}>
            Watch Party
          </Typography>
          <Chip
            startDecorator={<People />}
            variant="soft"
            color="neutral"
            size="sm"
          >
            {party.members.length} watching
          </Chip>
          {isHost && (
            <Chip variant="solid" color="warning" size="sm">
              Host
            </Chip>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          {/* <PlaybackSurface /> */}
        </Box>
      </Box>

      {/* Chat sidebar */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          "@media (max-width: 900px)": { display: "none" },
        }}
      >
        {/* Sidebar header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="title-md">Party Chat</Typography>
          <Tooltip title="Copy invite link">
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<ContentCopy fontSize="small" />}
              onClick={copyInviteLink}
            >
              {code}
            </Button>
          </Tooltip>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {messages.length === 0 && (
            <Typography
              level="body-sm"
              sx={{ color: "text.tertiary", textAlign: "center", mt: 4 }}
            >
              No messages yet. Say hi! 👋
            </Typography>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.uid === myUid;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                {!isMine && (
                  <Typography level="body-xs" sx={{ color: "text.tertiary", mb: 0.3 }}>
                    {msg.displayName || msg.uid.slice(0, 8)}
                  </Typography>
                )}
                <Box
                  sx={{
                    background: isMine
                      ? "rgb(255,220,92)"
                      : "rgba(255,255,255,0.08)",
                    color: isMine ? "black" : "white",
                    borderRadius: "lg",
                    px: 1.5,
                    py: 0.75,
                    maxWidth: "85%",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography level="body-sm">{msg.text}</Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Chat input */}
        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Input
            size="sm"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            sx={{ flex: 1 }}
          />
          <IconButton
            size="sm"
            variant="solid"
            color="warning"
            onClick={sendMessage}
            disabled={!chatInput.trim() || sending}
          >
            <Send fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default WatchPartyPage;
