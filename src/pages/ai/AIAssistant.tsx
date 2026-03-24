import {
  Box,
  Card,
  IconButton,
  Sheet,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { aiService, ChatMessage } from "../../service/api/ai/ai.api.service";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import { isLoggedIn } from "../../utilities/defaults";
import NotLoggedIn from "../../components/utils/NotLoggedIn";

const SUGGESTIONS = [
  "Recommend me something like Interstellar",
  "I'm looking for a movie with a twist ending",
  "Find me a heartwarming family show",
  "What's a good horror movie that's not too gory?",
  "I want something like Breaking Bad",
];

function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await aiService.chat(newMessages);
      setMessages([...newMessages, { role: "assistant", content: res.message }]);
    } catch (_) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I ran into an issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    const parts = content.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  if (!isLoggedIn) return <NotLoggedIn type="page"/>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingTop: "70px",
        maxWidth: 800,
        margin: "0 auto",
        width: "90%",
      }}
    >
      <Box sx={{ py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <AutoAwesomeIcon sx={{ color: "black", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography level="h4" fontWeight={700}>SmileAI</Typography>
          <Typography level="body-xs" textColor="neutral.400">
            Your personal movie and TV assistant
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, pb: 2,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 4, background: "rgba(255,255,255,0.1)" },
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <Typography level="body-md" textColor="neutral.400" textAlign="center">
              Ask me anything — find movies by description, get recommendations, or check if something is family-safe.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <Sheet
                  key={s}
                  onClick={() => sendMessage(s)}
                  sx={{
                    px: 2, py: 1, borderRadius: 20,
                    border: "1px solid", borderColor: "neutral.700",
                    cursor: "pointer", fontSize: 13, transition: "all 0.15s",
                    "&:hover": { borderColor: "rgb(255,216,77)", color: "rgb(255,216,77)" },
                  }}
                >
                  {s}
                </Sheet>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: msg.role === "user" ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
              }}
            >
              {msg.role === "user" ? <PersonIcon sx={{ fontSize: 18 }} /> : <AutoAwesomeIcon sx={{ fontSize: 18, color: "black" }} />}
            </Box>
            <Card
              sx={{
                maxWidth: "80%", px: 2, py: 1.5,
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: msg.role === "user" ? "rgba(255,216,77,0.12)" : "rgba(255,255,255,0.05)",
                border: "1px solid",
                borderColor: msg.role === "user" ? "rgba(255,216,77,0.25)" : "rgba(255,255,255,0.08)",
              }}
            >
              <Typography level="body-sm" sx={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {renderMessage(msg.content)}
              </Typography>
            </Card>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18, color: "black" }} />
            </Box>
            <Card sx={{ px: 2, py: 1.5, borderRadius: "4px 16px 16px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Box sx={{ display: "flex", gap: 0.6, alignItems: "center", height: 20 }}>
                {[0, 1, 2].map((i) => (
                  <Box key={i} sx={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "rgba(255,216,77,0.6)",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                      "40%": { transform: "scale(1)", opacity: 1 },
                    },
                  }} />
                ))}
              </Box>
            </Card>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ pb: 3, pt: 2, display: "flex", gap: 1, alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder="Ask about a movie, get recommendations, or describe something you want to watch..."
          minRows={1}
          maxRows={5}
          disabled={loading}
          sx={{ flex: 1, "--Textarea-focusedHighlight": "rgb(255,216,77)" }}
        />
        <IconButton
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          sx={{
            background: "rgb(255,216,77)", color: "black",
            "&:hover": { background: "rgb(230,195,60)" },
            "&:disabled": { opacity: 0.4 },
            borderRadius: 8, mb: 0.5,
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default AIAssistant;
