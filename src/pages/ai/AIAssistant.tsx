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
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import { isLoggedIn } from "../../utilities/defaults";
import NotLoggedIn from "../../components/utils/NotLoggedIn";
import { useNavigate } from "react-router-dom";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
import { searchMulti } from "../../tmdb-res";
import EventMC from "../../components/cards/EventMC";

const SUGGESTIONS = [
  "Recommend me something like Interstellar",
  "I'm looking for a movie with a twist ending",
  "Find me a heartwarming family show",
  "What's a good horror movie that's not too gory?",
  "I want something like Breaking Bad",
];

type ResolvedMedia = {
  id: number | string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string;
};

type UIChatMessage = ChatMessage & {
  id: string;
  relatedMedia?: ResolvedMedia[];
  resolvingMedia?: boolean;
};

const makeMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeTitle = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const extractBoldTitles = (content: string) =>
  Array.from(
    new Set(
      [...content.matchAll(/\*\*(.+?)\*\*/g)]
        .map((match) => match[1].trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);

const pickBestMediaMatch = (title: string, results: searchMulti["results"]) => {
  const candidates = results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
  if (!candidates.length) return null;

  const normalizedTitle = normalizeTitle(title);
  const exactMatch = candidates.find(
    (result) => normalizeTitle(result.title || result.name || "") === normalizedTitle,
  );
  if (exactMatch) return exactMatch;

  const containsMatch = candidates.find((result) =>
    normalizeTitle(result.title || result.name || "").includes(normalizedTitle),
  );
  return containsMatch || candidates[0];
};

function AIAssistant() {
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const goToSearch = (title: string) => navigate(`/search/${encodeURIComponent(title)}`);

  const resolveAssistantMedia = async (messageId: string, content: string) => {
    const boldTitles = extractBoldTitles(content);

    if (!boldTitles.length) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, relatedMedia: [], resolvingMedia: false }
            : message,
        ),
      );
      return;
    }

    try {
      const resolvedMedia = (
        await Promise.all(
          boldTitles.map(async (title) => {
            const response = await tmdb.searchMulti(encodeURIComponent(title), 1);
            const bestMatch = pickBestMediaMatch(title, (response as searchMulti)?.results);
            if (!bestMatch) return null;

            return {
              id: bestMatch.id,
              mediaType: bestMatch.media_type as "movie" | "tv",
              title: bestMatch.title || bestMatch.name || title,
              posterPath: bestMatch.poster_path,
            } satisfies ResolvedMedia;
          }),
        )
      ).filter(Boolean) as ResolvedMedia[];

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, relatedMedia: resolvedMedia, resolvingMedia: false }
            : message,
        ),
      );
    } catch (_) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, relatedMedia: [], resolvingMedia: false }
            : message,
        ),
      );
    }
  };

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");

    const newMessages: UIChatMessage[] = [
      ...messages,
      { id: makeMessageId(), role: "user", content: userText },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await aiService.chat(
        newMessages.map(({ role, content }) => ({ role, content })),
      );

      const assistantId = makeMessageId();
      const assistantMessage: UIChatMessage = {
        id: assistantId,
        role: "assistant",
        content: res.message,
        resolvingMedia: true,
        relatedMedia: [],
      };

      setMessages([...newMessages, assistantMessage]);
      resolveAssistantMedia(assistantId, res.message);
    } catch (_) {
      setMessages([
        ...newMessages,
        {
          id: makeMessageId(),
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    const parts = content.split(/\*\*(.+?)\*\*/g);

    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <Box
          key={`${part}-${i}`}
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.4,
            flexWrap: "wrap",
            verticalAlign: "middle",
            mr: 0.25,
          }}
        >
          <Box
            component="button"
            onClick={() => goToSearch(part)}
            sx={{
              border: "none",
              background: "transparent",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              color: "rgb(96, 183, 255)",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease",
              "&:hover": {
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                color: "rgb(128, 204, 255)",
              },
            }}
          >
            {part}
          </Box>
          <IconButton
            size="sm"
            onClick={() => goToSearch(part)}
            sx={{
              "--IconButton-size": "22px",
              background: "rgba(96, 183, 255, 0.12)",
              color: "rgb(96, 183, 255)",
              border: "1px solid rgba(96, 183, 255, 0.2)",
              "&:hover": {
                background: "rgba(96, 183, 255, 0.2)",
              },
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ) : (
        <span key={`${part}-${i}`}>{part}</span>
      ),
    );
  };

  if (!isLoggedIn) return <NotLoggedIn type="page" />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingTop: "84px",
        paddingBottom: 3,
        maxWidth: 980,
        margin: "0 auto",
        width: "90%",
      }}
    >
      <Box sx={{ py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(255, 191, 0, 0.25)",
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
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pb: 2,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 4,
            background: "rgba(255,255,255,0.1)",
          },
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <Typography level="body-md" textColor="neutral.400" textAlign="center">
              Ask me anything — find movies by description, get recommendations, or check if something is family-safe.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {SUGGESTIONS.map((suggestion) => (
                <Sheet
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: "rgba(96, 183, 255, 0.18)",
                    background: "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    fontSize: 13,
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: "rgb(96, 183, 255)",
                      color: "rgb(96, 183, 255)",
                      boxShadow: "0 0 24px rgba(96, 183, 255, 0.14)",
                    },
                  }}
                >
                  {suggestion}
                </Sheet>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  msg.role === "user"
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
              }}
            >
              {msg.role === "user" ? (
                <PersonIcon sx={{ fontSize: 18 }} />
              ) : (
                <AutoAwesomeIcon sx={{ fontSize: 18, color: "black" }} />
              )}
            </Box>
            <Card
              sx={{
                maxWidth: msg.role === "assistant" ? "88%" : "80%",
                px: 2,
                py: 1.5,
                borderRadius:
                  msg.role === "user"
                    ? "16px 4px 16px 16px"
                    : "4px 16px 16px 16px",
                background:
                  msg.role === "user"
                    ? "rgba(255,216,77,0.12)"
                    : "rgba(9,16,32,0.78)",
                border: "1px solid",
                borderColor:
                  msg.role === "user"
                    ? "rgba(255,216,77,0.25)"
                    : "rgba(96, 183, 255, 0.12)",
                backdropFilter: "blur(18px)",
                boxShadow:
                  msg.role === "assistant"
                    ? "0 12px 48px rgba(0, 0, 0, 0.22)"
                    : "none",
              }}
            >
              <Typography level="body-sm" sx={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {renderMessage(msg.content)}
              </Typography>

              {msg.role === "assistant" && msg.resolvingMedia && (
                <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 1.5 }}>
                  Pulling matching titles from the catalog...
                </Typography>
              )}

              {msg.role === "assistant" && !!msg.relatedMedia?.length && (
                <Box sx={{ mt: 2.2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                  <Typography level="body-xs" textColor="neutral.400">
                    Quick picks from this reply
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {msg.relatedMedia.map((media) => (
                      <EventMC
                        key={`${msg.id}-${media.mediaType}-${media.id}`}
                        eventId={media.id}
                        eventPoster={media.posterPath}
                        eventTitle={media.title}
                        eventType={media.mediaType}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Card>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgb(255,216,77), rgb(255,160,0))",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18, color: "black" }} />
            </Box>
            <Card
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: "4px 16px 16px 16px",
                background: "rgba(9,16,32,0.78)",
                border: "1px solid rgba(96, 183, 255, 0.12)",
              }}
            >
              <Box sx={{ display: "flex", gap: 0.6, alignItems: "center", height: 20 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "rgba(96, 183, 255, 0.75)",
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${i * 0.2}s`,
                      "@keyframes bounce": {
                        "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                        "40%": { transform: "scale(1)", opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Box>
            </Card>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      <Box
        sx={{
          pb: 3,
          pt: 2,
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about a movie, get recommendations, or describe something you want to watch..."
          minRows={1}
          maxRows={5}
          disabled={loading}
          sx={{
            flex: 1,
            "--Textarea-focusedHighlight": "rgb(96, 183, 255)",
            background: "rgba(9,16,32,0.78)",
            borderColor: "rgba(96, 183, 255, 0.16)",
          }}
        />
        <IconButton
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          sx={{
            background: "rgb(96, 183, 255)",
            color: "white",
            "&:hover": { background: "rgb(74, 166, 244)" },
            "&:disabled": { opacity: 0.4 },
            borderRadius: 8,
            mb: 0.5,
            boxShadow: "0 0 24px rgba(96, 183, 255, 0.24)",
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default AIAssistant;
