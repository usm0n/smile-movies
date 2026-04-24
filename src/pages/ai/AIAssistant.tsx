import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemContent,
  Sheet,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AIRecommendation,
  AIChatSessionSummary,
  aiService,
  ChatMessage,
} from "../../service/api/ai/ai.api.service";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { isLoggedIn } from "../../utilities/defaults";
import NotLoggedIn from "../../components/utils/NotLoggedIn";
import { useNavigate } from "react-router-dom";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
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
  reason?: string;
};

type TMDBSearchResult = {
  id: number | string;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
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

const extractBoldTitles = (content: string): string[] =>
  Array.from(
    new Set(
      [...content.matchAll(/\*\*(.+?)\*\*/g)]
        .map((match) => match[1].trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);

const pickBestMediaMatch = (
  title: string,
  results: TMDBSearchResult[] = [],
  preferredMediaType?: "movie" | "tv" | "unknown",
  preferredYear?: number | null,
) => {
  const candidates = results.filter(
    (result) =>
      result &&
      (result.media_type === "movie" ||
        result.media_type === "tv" ||
        preferredMediaType === "movie" ||
        preferredMediaType === "tv"),
  );
  if (!candidates.length) return null;

  const mediaFiltered =
    preferredMediaType && preferredMediaType !== "unknown"
      ? candidates.filter((result) => {
          const inferredType =
            result.media_type || ("name" in result ? "tv" : "movie");
          return inferredType === preferredMediaType;
        })
      : candidates;
  const pool = mediaFiltered.length ? mediaFiltered : candidates;
  const normalized = normalizeTitle(title);
  const exactMatch = pool.find(
    (result) => normalizeTitle(result.title || result.name || "") === normalized,
  );
  if (exactMatch) return exactMatch;

  if (preferredYear) {
    const yearMatch = pool.find((result) => {
      const resultYear = Number(
        String(result.release_date || result.first_air_date || "").slice(0, 4),
      );
      return resultYear === preferredYear;
    });
    if (yearMatch) return yearMatch;
  }

  const containsMatch = pool.find((result) =>
    normalizeTitle(result.title || result.name || "").includes(normalized),
  );
  return containsMatch || pool[0];
};

const formatSessionDate = (timestamp: number) => {
  if (!timestamp) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const mapStatusError = (error: unknown): string => {
  const apiError = error as { status?: number; data?: { message?: string } };
  const status = apiError?.status;

  if (!status) {
    return "Network issue: SmileAI could not be reached. Please check your connection and retry.";
  }

  if (status === 429) {
    return "Too many AI requests right now. Please wait a few seconds and try again.";
  }

  if (status === 404) {
    return "This conversation could not be found. Start a new chat or refresh history.";
  }

  if (status >= 500) {
    return "SmileAI is temporarily unavailable. Please try again in a moment.";
  }

  return apiError?.data?.message || "Something went wrong while talking to SmileAI.";
};

const toUiMessage = (message: ChatMessage): UIChatMessage => ({
  id: message.id || makeMessageId(),
  role: message.role,
  content: message.content,
  createdAtMs: message.createdAtMs,
  recommendations: message.recommendations,
  relatedMedia: [],
  resolvingMedia:
    message.role === "assistant" &&
    Array.isArray(message.recommendations) &&
    message.recommendations.length > 0,
});

function AIAssistant() {
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [sessions, setSessions] = useState<AIChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastAttemptedPayload, setLastAttemptedPayload] = useState<{
    messages: ChatMessage[];
    sessionId: string | null;
  } | null>(null);
  const [syncingHistory, setSyncingHistory] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const sessionLoadToken = useRef(0);
  const navigate = useNavigate();

  const scrollMessagesToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = messagesContainerRef.current;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior });
    },
    [],
  );

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 120;
  }, []);

  useEffect(() => {
    if (!shouldAutoScrollRef.current && !loading) return;

    const behavior: ScrollBehavior = loading ? "auto" : "smooth";
    window.requestAnimationFrame(() => scrollMessagesToBottom(behavior));
  }, [loading, loadingSession, messages, scrollMessagesToBottom]);

  const goToSearch = (title: string) =>
    navigate(`/search/${encodeURIComponent(title)}`);

  const resolveAssistantMedia = useCallback(
    async (
      messageId: string,
      recommendations: AIRecommendation[] = [],
      fallbackContent: string,
    ) => {
      const fallbackTitles = extractBoldTitles(fallbackContent);
      const recommendationInputs =
        recommendations.length > 0
          ? recommendations
          : fallbackTitles.map((title) => ({
              title,
              mediaType: "unknown" as const,
              year: null,
              reason: "Mentioned directly in the assistant reply.",
            }));

      if (!recommendationInputs.length) {
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
            recommendationInputs.map(async (recommendation) => {
              const query = encodeURIComponent(recommendation.title);
              let response: { results?: TMDBSearchResult[] } | null = null;

              if (recommendation.mediaType === "movie") {
                response = await tmdb.searchMovie(query, 1);
              } else if (recommendation.mediaType === "tv") {
                response = await tmdb.searchTv(query, 1);
              } else {
                response = await tmdb.searchMulti(query, 1);
              }

              const rawResults = Array.isArray(response?.results)
                ? response.results
                : [];
              const bestMatch = pickBestMediaMatch(
                recommendation.title,
                rawResults,
                recommendation.mediaType,
                recommendation.year,
              );
              if (!bestMatch) return null;

              return {
                id: bestMatch.id,
                mediaType: (bestMatch.media_type ||
                  ("name" in bestMatch ? "tv" : "movie")) as "movie" | "tv",
                title: bestMatch.title || bestMatch.name || recommendation.title,
                posterPath: bestMatch.poster_path,
                reason: recommendation.reason,
              } as ResolvedMedia;
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
      } catch {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? { ...message, relatedMedia: [], resolvingMedia: false }
              : message,
          ),
        );
      }
    },
    [],
  );

  const resolveMediaForLatestAssistants = useCallback(
    (currentMessages: UIChatMessage[]) => {
      currentMessages
        .filter((message) => message.role === "assistant")
        .slice(-6)
        .forEach((message) => {
          void resolveAssistantMedia(
            message.id,
            message.recommendations || [],
            message.content,
          );
        });
    },
    [resolveAssistantMedia],
  );

  const refreshHistory = useCallback(async () => {
    setSyncingHistory(true);
    try {
      const history = await aiService.listHistory();
      setSessions(history.sessions || []);
    } catch {
      // Keep existing list if refresh fails.
    } finally {
      setSyncingHistory(false);
    }
  }, []);

  const openSession = useCallback(
    async (sessionId: string) => {
      const token = ++sessionLoadToken.current;
      setLoadingSession(true);
      setChatError(null);
      try {
        const response = await aiService.getHistorySession(sessionId);
        if (token !== sessionLoadToken.current) return;

        const uiMessages = (response.session.messages || []).map(toUiMessage);
        shouldAutoScrollRef.current = true;
        setActiveSessionId(response.session.sessionId);
        setMessages(uiMessages);
        setHistoryDrawerOpen(false);
        resolveMediaForLatestAssistants(uiMessages);
      } catch (error) {
        if (token !== sessionLoadToken.current) return;
        setChatError(mapStatusError(error));
      } finally {
        if (token === sessionLoadToken.current) {
          setLoadingSession(false);
        }
      }
    },
    [resolveMediaForLatestAssistants],
  );

  const startNewChat = useCallback(() => {
    shouldAutoScrollRef.current = true;
    setActiveSessionId(null);
    setMessages([]);
    setChatError(null);
    setPendingRetry(false);
    setLastAttemptedPayload(null);
    setHistoryDrawerOpen(false);
  }, []);

  const loadHistoryOnMount = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await aiService.listHistory();
      const historySessions = response.sessions || [];
      setSessions(historySessions);

      if (historySessions[0]?.sessionId) {
        await openSession(historySessions[0].sessionId);
      }
    } catch (error) {
      setChatError(mapStatusError(error));
    } finally {
      setLoadingHistory(false);
    }
  }, [openSession]);

  useEffect(() => {
    void loadHistoryOnMount();
  }, [loadHistoryOnMount]);

  const sendChat = useCallback(
    async (
      payloadMessages: ChatMessage[],
      targetSessionId: string | null,
      options?: { replaceLastAssistant?: boolean },
    ) => {
      setLoading(true);
      setChatError(null);
      setPendingRetry(false);
      setLastAttemptedPayload({
        messages: payloadMessages,
        sessionId: targetSessionId,
      });

      try {
        const response = await aiService.chat(
          payloadMessages,
          targetSessionId || undefined,
        );

        const assistantId = makeMessageId();
        const assistantMessage: UIChatMessage = {
          id: assistantId,
          role: "assistant",
          content: response.reply,
          recommendations: response.recommendations,
          resolvingMedia: true,
          relatedMedia: [],
          createdAtMs: Date.now(),
        };

        setActiveSessionId(response.sessionId);
        shouldAutoScrollRef.current = true;

        setMessages((prev) => {
          const nextBase = options?.replaceLastAssistant
            ? prev.filter((msg, index) => {
                const isLast = index === prev.length - 1;
                return !(isLast && msg.role === "assistant");
              })
            : prev;

          return [...nextBase, assistantMessage];
        });

        await resolveAssistantMedia(
          assistantId,
          response.recommendations || [],
          response.reply,
        );
        void refreshHistory();
      } catch (error) {
        setChatError(mapStatusError(error));
        setPendingRetry(true);
      } finally {
        setLoading(false);
      }
    },
    [refreshHistory, resolveAssistantMedia],
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const userText = (text || input).trim();
      if (!userText || loading || loadingSession) return;

      setInput("");
      const userMessage: UIChatMessage = {
        id: makeMessageId(),
        role: "user",
        content: userText,
        createdAtMs: Date.now(),
      };

      const nextMessages = [...messages, userMessage];
      shouldAutoScrollRef.current = true;
      setMessages(nextMessages);

      await sendChat(
        nextMessages.map(({ id, role, content, createdAtMs, recommendations }) => ({
          id,
          role,
          content,
          createdAtMs,
          recommendations,
        })),
        activeSessionId,
      );
    },
    [activeSessionId, input, loading, loadingSession, messages, sendChat],
  );

  const retryLastRequest = useCallback(async () => {
    if (!lastAttemptedPayload || loading) return;

    await sendChat(lastAttemptedPayload.messages, lastAttemptedPayload.sessionId);
  }, [lastAttemptedPayload, loading, sendChat]);

  const regenerateLastAssistant = useCallback(async () => {
    if (loading || messages.length < 2) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;

    const withoutLastAssistant = messages.slice(0, -1);
    shouldAutoScrollRef.current = true;
    setMessages(withoutLastAssistant);
    await sendChat(
      withoutLastAssistant.map(({ id, role, content, createdAtMs, recommendations }) => ({
        id,
        role,
        content,
        createdAtMs,
        recommendations,
      })),
      activeSessionId,
      { replaceLastAssistant: true },
    );
  }, [activeSessionId, loading, messages, sendChat]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await aiService.deleteHistorySession(sessionId);
        const nextSessions = sessions.filter((session) => session.sessionId !== sessionId);
        setSessions(nextSessions);

        if (activeSessionId === sessionId) {
          if (nextSessions[0]?.sessionId) {
            await openSession(nextSessions[0].sessionId);
          } else {
            startNewChat();
          }
        }
      } catch (error) {
        setChatError(mapStatusError(error));
      }
    },
    [activeSessionId, openSession, sessions, startNewChat],
  );

  const clearAllHistory = useCallback(async () => {
    const shouldClear = window.confirm(
      "Clear your full SmileAI chat history? This cannot be undone.",
    );
    if (!shouldClear) return;

    try {
      await aiService.clearHistory();
      setSessions([]);
      startNewChat();
    } catch (error) {
      setChatError(mapStatusError(error));
    }
  }, [startNewChat]);

  const copyMessage = useCallback(async (message: UIChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId((id) => (id === message.id ? null : id)), 1400);
    } catch {
      setChatError("Copy failed. Please select and copy the text manually.");
    }
  }, []);

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

  const sessionList = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1.2 }}>
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={startNewChat}
            sx={{ flex: 1 }}
          >
            New Chat
          </Button>
          <Tooltip title="Clear all history">
            <IconButton
              color="neutral"
              variant="outlined"
              onClick={clearAllHistory}
              disabled={!sessions.length}
              sx={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "neutral.400",
                "&:hover": {
                  color: "danger.300",
                  borderColor: "rgba(255,84,84,0.35)",
                  background: "rgba(255,84,84,0.08)",
                },
              }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 0.3,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 4,
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          {!sessions.length ? (
            <Typography level="body-sm" textColor="neutral.400" sx={{ mt: 2 }}>
              No saved conversations yet.
            </Typography>
          ) : (
            <List sx={{ "--ListItem-paddingY": "10px", "--List-gap": "8px" }}>
              {sessions.map((session) => (
                <Card
                  key={session.sessionId}
                  sx={{
                    p: 0.7,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor:
                      activeSessionId === session.sessionId
                        ? "rgba(96,183,255,0.4)"
                        : "rgba(255,255,255,0.08)",
                    background:
                      activeSessionId === session.sessionId
                        ? "rgba(96,183,255,0.08)"
                        : "rgba(9,16,32,0.6)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.4 }}>
                    <ListItemButton
                      onClick={() => void openSession(session.sessionId)}
                      sx={{
                        alignItems: "flex-start",
                        gap: 1.2,
                        py: 0.9,
                        px: 1,
                        borderRadius: 10,
                        flex: 1,
                      }}
                    >
                      <ListItemContent>
                        <Typography level="title-sm" sx={{ lineHeight: 1.25 }}>
                          {session.title || "Untitled chat"}
                        </Typography>
                        <Typography
                          level="body-xs"
                          textColor="neutral.400"
                          sx={{
                            mt: 0.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 30,
                          }}
                        >
                          {session.lastAssistantPreview || "No assistant response yet"}
                        </Typography>
                        <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.5 }}>
                          {session.messageCount} messages · {formatSessionDate(session.updatedAtMs)}
                        </Typography>
                      </ListItemContent>
                    </ListItemButton>
                    <Tooltip title="Delete conversation">
                      <IconButton
                        size="sm"
                        color="neutral"
                        variant="plain"
                        onClick={() => void deleteSession(session.sessionId)}
                        sx={{
                          mt: 0.45,
                          color: "neutral.400",
                          "&:hover": {
                            color: "danger.300",
                            background: "rgba(255,84,84,0.12)",
                          },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              ))}
            </List>
          )}
        </Box>
      </Box>
    ),
    [activeSessionId, clearAllHistory, deleteSession, openSession, sessions, startNewChat],
  );

  if (!isLoggedIn) return <NotLoggedIn type="page" />;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        paddingTop: "84px",
        paddingBottom: 3,
        width: "100%",
        px: { xs: 1.2, sm: 1.8, md: 2.4 },
        gap: { xs: 0, md: 2.2 },
        alignItems: "flex-start",
      }}
    >
      <Sheet
        variant="soft"
        sx={{
          width: 300,
          p: 1.2,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(7, 13, 25, 0.75)",
          backdropFilter: "blur(16px)",
          display: { xs: "none", md: "block" },
          maxHeight: "calc(100vh - 110px)",
          position: "sticky",
          top: 92,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
          <HistoryRoundedIcon sx={{ color: "rgb(96,183,255)", fontSize: 18 }} />
          <Typography level="title-sm">Chat History</Typography>
          {syncingHistory ? <CircularProgress size="sm" /> : null}
        </Box>
        {sessionList}
      </Sheet>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          width: "100%",
          maxWidth: { xs: "100%", md: 920 },
          mx: "auto",
          height: "calc(100vh - 92px)",
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
          <Box sx={{ flex: 1 }}>
            <Typography level="h4" fontWeight={700}>SmileAI</Typography>
            <Typography level="body-xs" textColor="neutral.400">
              Your personal movie and TV assistant
            </Typography>
          </Box>
          <IconButton
            onClick={() => setHistoryDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Box>

        {chatError && (
          <Sheet
            color="danger"
            variant="soft"
            sx={{
              px: 1.4,
              py: 1,
              mb: 1,
              borderRadius: 10,
              border: "1px solid rgba(255, 96, 96, 0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography level="body-sm">{chatError}</Typography>
            {pendingRetry ? (
              <Button
                size="sm"
                startDecorator={<ReplayRoundedIcon />}
                onClick={() => void retryLastRequest()}
                disabled={loading}
              >
                Retry
              </Button>
            ) : null}
          </Sheet>
        )}

        <Box
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
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
          {(loadingHistory || loadingSession) && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
              <CircularProgress size="lg" />
            </Box>
          )}

          {!loadingHistory && !loadingSession && messages.length === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
              <Typography level="body-md" textColor="neutral.400" textAlign="center">
                Ask me anything — find movies by description, get recommendations, or check if something is family-safe.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                {SUGGESTIONS.map((suggestion) => (
                  <Sheet
                    key={suggestion}
                    onClick={() => void sendMessage(suggestion)}
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

          {!loadingHistory && !loadingSession && messages.map((msg, index) => {
            const isLastAssistant =
              msg.role === "assistant" && index === messages.length - 1;

            return (
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
                  <Typography
                    level="body-sm"
                    sx={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}
                  >
                    {renderMessage(msg.content)}
                  </Typography>

                  {msg.role === "assistant" ? (
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Typography level="body-xs" textColor="neutral.400">
                        {msg.createdAtMs
                          ? formatSessionDate(msg.createdAtMs)
                          : ""}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip
                          title={
                            copiedMessageId === msg.id ? "Copied" : "Copy response"
                          }
                        >
                          <IconButton
                            size="sm"
                            onClick={() => void copyMessage(msg)}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {isLastAssistant ? (
                          <Tooltip title="Regenerate response">
                            <IconButton
                              size="sm"
                              disabled={loading}
                              onClick={() => void regenerateLastAssistant()}
                            >
                              <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Box>
                    </Box>
                  ) : null}

                  {msg.role === "assistant" && !!msg.relatedMedia?.length && (
                    <Divider>
                      Quick picks from this reply
                    </Divider>
                  )}

                  {msg.role === "assistant" && msg.resolvingMedia && (
                    <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 1.5 }}>
                      Pulling matching titles from the catalog...
                    </Typography>
                  )}

                  {msg.role === "assistant" && !!msg.relatedMedia?.length && (
                    <Box sx={{ mt: 2.2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {msg.relatedMedia.map((media) => (
                          <Box
                            key={`${msg.id}-${media.mediaType}-${media.id}`}
                            sx={{
                              width: "250px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.8,
                              "@media (max-width: 800px)": {
                                width: "200px",
                              },
                            }}
                          >
                            <EventMC
                              eventId={media.id}
                              eventPoster={media.posterPath}
                              eventTitle={media.title}
                              eventType={media.mediaType}
                            />
                            {media.reason ? (
                              <Typography
                                level="body-xs"
                                textColor="neutral.400"
                                sx={{ px: 0.4, lineHeight: 1.5 }}
                              >
                                {media.reason}
                              </Typography>
                            ) : null}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Card>
              </Box>
            );
          })}

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
                void sendMessage();
              }
            }}
            placeholder="Ask about a movie, get recommendations, or describe something you want to watch..."
            minRows={1}
            maxRows={5}
            disabled={loading || loadingSession}
            sx={{
              flex: 1,
              "--Textarea-focusedHighlight": "rgb(96, 183, 255)",
              background: "rgba(9,16,32,0.78)",
              borderColor: "rgba(96, 183, 255, 0.16)",
            }}
          />
          <IconButton
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading || loadingSession}
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

      <Drawer open={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)}>
        <Box sx={{ p: 1, width: "min(82vw, 300px)", pt: 2, height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
            <HistoryRoundedIcon sx={{ color: "rgb(96,183,255)", fontSize: 18 }} />
            <Typography level="title-sm">Chat History</Typography>
          </Box>
          {sessionList}
        </Box>
      </Drawer>
    </Box>
  );
}

export default AIAssistant;
