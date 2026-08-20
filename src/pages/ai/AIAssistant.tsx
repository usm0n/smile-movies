import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AIRecommendation,
  AIChatSessionSummary,
  ListAction,
  aiService,
  ChatMessage,
} from "../../service/api/ai/ai.api.service";
import {
  AutoAwesome as AutoAwesomeIcon,
  SearchRounded as SearchRoundedIcon,
  Send as SendIcon,
  ContentCopyRounded as ContentCopyRoundedIcon,
  RefreshRounded as RefreshRoundedIcon,
  DeleteOutlineRounded as DeleteOutlineRoundedIcon,
  AddRounded as AddRoundedIcon,
  MenuRounded as MenuRoundedIcon,
  ReplayRounded as ReplayRoundedIcon,
  PlaylistAdd as PlaylistAddIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Check as CheckIcon,
  ArrowUpRight as ArrowUpRightIcon,
} from "../../components/ui/icons";
import { isLoggedIn } from "../../utilities/defaults";
import NotLoggedIn from "../../components/utils/NotLoggedIn";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ResolvedMedia,
  resolveSuggestedMediaList,
} from "../../utilities/resolveSuggestedMedia";
import { tmdbAPI } from "../../service/api/api";
import EventMC from "../../components/cards/EventMC";
import { collectionsAPI } from "../../service/api/smb/collections.api.service";
import { useUsers } from "../../context/Users";
import { tokens } from "../../theme";

/**
 * Shared bits of the Vercel-style chrome. Everything colour-related comes from
 * the design tokens so this page stays in step with the rest of the app.
 */
const scrollbarSx = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 3,
    background: tokens.level2,
  },
  "&::-webkit-scrollbar-thumb:hover": { background: tokens.borderHover },
} as const;

/** Uppercase micro-label used above sections, as on Vercel's dashboard. */
const sectionLabelSx = {
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: tokens.textTertiary,
} as const;

const messageActionSx = {
  "--IconButton-size": "28px",
  color: tokens.textTertiary,
  "&:hover": { color: tokens.textPrimary, background: tokens.level1 },
} as const;

const kbdSx = {
  px: "4px",
  py: "1px",
  borderRadius: "3px",
  border: `1px solid ${tokens.border}`,
  background: tokens.level1,
  color: tokens.textTertiary,
  fontFamily: "inherit",
  fontSize: "0.625rem",
} as const;

const SUGGESTIONS = [
  "Recommend me something like Interstellar",
  "I'm looking for a movie with a twist ending",
  "Find me a heartwarming family show",
  "What's a good horror movie that's not too gory?",
  "I want something like Breaking Bad",
];

type UIChatMessage = ChatMessage & {
  id: string;
  relatedMedia?: ResolvedMedia[];
  resolvingMedia?: boolean;
  listActions?: ListAction[];
};

const makeMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const extractBoldTitles = (content: string): string[] =>
  Array.from(
    new Set(
      [...content.matchAll(/\*\*(.+?)\*\*/g)]
        .map((match) => match[1].trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);

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
  // Track which list actions have been executed (by msgId+index)
  const [executedListActions, setExecutedListActions] = useState<Set<string>>(new Set());
  const [executingListAction, setExecutingListAction] = useState<string | null>(null);

  const { isAuthenticated } = useUsers();

  const handleListAction = useCallback(async (action: ListAction, actionKey: string) => {
    if (!isAuthenticated) return;
    setExecutingListAction(actionKey);
    try {
      // Resolve TMDB ID if not provided by AI
      let resolvedId = String(action.tmdbId || "");
      let resolvedPoster = "";
      if (!action.tmdbId) {
        try {
          const searchEndpoint = action.mediaType === "movie"
            ? `/search/movie?query=${encodeURIComponent(action.title)}&page=1`
            : `/search/tv?query=${encodeURIComponent(action.title)}&page=1`;
          const res = await tmdbAPI.get(searchEndpoint);
          const first = res.data?.results?.[0];
          if (first) {
            resolvedId = String(first.id);
            resolvedPoster = first.poster_path || "";
          }
        } catch { /* use title as fallback id */ }
      }

      if (!resolvedId) resolvedId = action.title;

      const allLists = await collectionsAPI.getAll();
      const existing = allLists.collections.find(
        (c) => c.name.toLowerCase() === action.listName.toLowerCase(),
      );
      let collectionId = existing?.id;
      if (!collectionId) {
        const created = await collectionsAPI.create(action.listName);
        collectionId = created.collection.id;
      }
      await collectionsAPI.addItem(collectionId, {
        id: resolvedId,
        type: action.mediaType,
        title: action.title,
        poster: resolvedPoster,
      });
      setExecutedListActions((prev) => new Set([...prev, actionKey]));
    } catch {
      // silently fail — user can do it manually
    } finally {
      setExecutingListAction(null);
    }
  }, [isAuthenticated]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const sessionLoadToken = useRef(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-send logic — defined after startNewChat and sendMessage are available (see below)
  const autoPromptRef = useRef(false);
  const pendingPromptRef = useRef<string | null>(null);

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
        const resolvedMedia = await resolveSuggestedMediaList(recommendationInputs);

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

  // Auto-send a prompt from ?prompt= URL param — always opens a NEW session
  // Split into two effects: (1) capture param early, (2) send once sendMessage is available
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (!promptParam || autoPromptRef.current) return;
    autoPromptRef.current = true;
    pendingPromptRef.current = promptParam;
    startNewChat();
    const next = new URLSearchParams(searchParams);
    next.delete("prompt");
    setSearchParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          listActions: response.listActions,
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
    async (textOrOptions?: string | { overrideInput?: string }) => {
      const overrideInput = typeof textOrOptions === "object" ? textOrOptions?.overrideInput : textOrOptions;
      const userText = (overrideInput || input).trim();
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

  // Second part of auto-prompt: fire the pending prompt now that sendMessage is stable
  useEffect(() => {
    if (!pendingPromptRef.current || loadingHistory || loading) return;
    const prompt = pendingPromptRef.current;
    pendingPromptRef.current = null;
    void sendMessage({ overrideInput: prompt });
  // sendMessage identity is stable (useCallback) so this won't loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingHistory, loading]);

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
          component="button"
          onClick={() => goToSearch(part)}
          aria-label={`Search for ${part}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            verticalAlign: "baseline",
            mx: "1px",
            px: "6px",
            py: "1px",
            font: "inherit",
            fontWeight: 500,
            lineHeight: 1.4,
            color: tokens.textPrimary,
            background: tokens.level1,
            border: `1px solid ${tokens.border}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 150ms ease, border-color 150ms ease",
            "&:hover": {
              background: tokens.level2,
              borderColor: tokens.borderHover,
            },
            "&:focus-visible": { outline: "none", boxShadow: tokens.focusRing },
          }}
        >
          {part}
          <SearchRoundedIcon
            sx={{ fontSize: 11, color: tokens.textTertiary, flexShrink: 0 }}
          />
        </Box>
      ) : (
        <span key={`${part}-${i}`}>{part}</span>
      ),
    );
  };

  const sessionList = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          startDecorator={<AddRoundedIcon sx={{ fontSize: 15 }} />}
          onClick={startNewChat}
          sx={{ justifyContent: "flex-start", width: "100%", mb: 2 }}
        >
          New chat
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 0.75,
            mb: 0.75,
          }}
        >
          <Typography sx={sectionLabelSx}>History</Typography>
          {syncingHistory ? (
            <CircularProgress size="sm" sx={{ "--CircularProgress-size": "12px" }} />
          ) : sessions.length ? (
            <Typography sx={{ ...sectionLabelSx, letterSpacing: 0 }}>
              {sessions.length}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", mx: -0.5, px: 0.5, ...scrollbarSx }}>
          {!sessions.length ? (
            <Typography level="body-xs" sx={{ px: 0.75, py: 1 }}>
              No conversations yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {sessions.map((session) => {
                const isActive = activeSessionId === session.sessionId;

                return (
                  <Box
                    key={session.sessionId}
                    sx={{
                      position: "relative",
                      borderRadius: "6px",
                      background: isActive ? tokens.level1 : "transparent",
                      transition: "background-color 150ms ease",
                      "&:hover": { background: tokens.level1 },
                      "&:hover .session-delete": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="button"
                      onClick={() => void openSession(session.sessionId)}
                      sx={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        px: 1,
                        py: 0.9,
                        pr: 4,
                        borderRadius: "6px",
                        "&:focus-visible": { outline: "none", boxShadow: tokens.focusRing },
                      }}
                    >
                      <Typography
                        level="title-sm"
                        sx={{
                          fontSize: "0.8125rem",
                          color: isActive ? tokens.textPrimary : tokens.textSecondary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.title || "Untitled chat"}
                      </Typography>
                      <Typography
                        level="body-xs"
                        sx={{
                          mt: 0.25,
                          fontSize: "0.6875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatSessionDate(session.updatedAtMs)} · {session.messageCount} messages
                      </Typography>
                    </Box>

                    <Tooltip title="Delete conversation" size="sm">
                      <IconButton
                        className="session-delete"
                        aria-label="Delete chat"
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={() => void deleteSession(session.sessionId)}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 4,
                          "--IconButton-size": "26px",
                          opacity: { xs: 1, md: 0 },
                          transition: "opacity 150ms ease, color 150ms ease",
                          "&:hover": { color: tokens.redHover, background: tokens.level2 },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {sessions.length ? (
          <Box sx={{ pt: 1.5, mt: 1, borderTop: `1px solid ${tokens.border}` }}>
            <Button
              variant="plain"
              color="neutral"
              size="sm"
              startDecorator={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={clearAllHistory}
              sx={{
                justifyContent: "flex-start",
                width: "100%",
                fontSize: "0.75rem",
                "&:hover": { color: tokens.redHover },
              }}
            >
              Clear all history
            </Button>
          </Box>
        ) : null}
      </Box>
    ),
    [activeSessionId, clearAllHistory, deleteSession, openSession, sessions, startNewChat, syncingHistory],
  );

  if (!isLoggedIn) return <NotLoggedIn type="page" />;

  return (
    <Box
      sx={{
        // Pinned to the viewport under the fixed navbar. The message list is the
        // only thing that scrolls, which keeps the composer on screen and stops
        // the mobile URL bar (the 100vh/100dvh gap) from pushing it out of view.
        position: "fixed",
        top: "var(--sm-nav-height)",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background: tokens.black,
      }}
    >
      {/* Desktop history rail */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: 260,
          flexShrink: 0,
          borderRight: `1px solid ${tokens.border}`,
          px: 1.5,
          py: 2,
          overflow: "hidden",
        }}
      >
        {sessionList}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderBottom: `1px solid ${tokens.border}`,
            flexShrink: 0,
          }}
        >
          <IconButton
            aria-label="Open chat history"
            variant="outlined"
            color="neutral"
            size="sm"
            onClick={() => setHistoryDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, "--IconButton-size": "32px" }}
          >
            <MenuRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              border: `1px solid ${tokens.border}`,
              background: tokens.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 15, color: tokens.textPrimary }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography level="title-sm" sx={{ lineHeight: 1.2 }}>
              SmileAI
            </Typography>
            <Typography level="body-xs" sx={{ fontSize: "0.6875rem", lineHeight: 1.2 }}>
              Movie and TV assistant
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          sx={{ flex: 1, minHeight: 0, overflowY: "auto", ...scrollbarSx }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 768,
              mx: "auto",
              px: { xs: 2, md: 3 },
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {chatError && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: "8px",
                  border: "1px solid rgba(229, 72, 77, 0.35)",
                  background: tokens.redDim,
                }}
              >
                <Typography level="body-sm" sx={{ color: tokens.redHover }}>
                  {chatError}
                </Typography>
                {pendingRetry ? (
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<ReplayRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => void retryLastRequest()}
                    disabled={loading}
                  >
                    Retry
                  </Button>
                ) : null}
              </Box>
            )}

            {(loadingHistory || loadingSession) && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                <CircularProgress size="sm" />
              </Box>
            )}

            {/* Empty state */}
            {!loadingHistory && !loadingSession && messages.length === 0 && (
              <Box sx={{ pt: { xs: 4, md: 8 } }}>
                <Typography
                  sx={{
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: tokens.textPrimary,
                    lineHeight: 1.15,
                  }}
                >
                  What are you in the mood for?
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1, mb: 3 }}>
                  Describe a plot you half-remember, ask for something like a film you
                  loved, or check whether a title is family-safe.
                </Typography>

                <Box
                  sx={{
                    border: `1px solid ${tokens.border}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {SUGGESTIONS.map((suggestion, index) => (
                    <Box
                      key={suggestion}
                      component="button"
                      onClick={() => void sendMessage(suggestion)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        width: "100%",
                        textAlign: "left",
                        px: 1.75,
                        py: 1.4,
                        border: "none",
                        borderTop: index === 0 ? "none" : `1px solid ${tokens.border}`,
                        background: tokens.surface,
                        color: tokens.textSecondary,
                        font: "inherit",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "background-color 150ms ease, color 150ms ease",
                        "&:hover": { background: tokens.level1, color: tokens.textPrimary },
                        "&:hover .suggestion-arrow": { opacity: 1, transform: "none" },
                        "&:focus-visible": { outline: "none", boxShadow: tokens.focusRing },
                      }}
                    >
                      {suggestion}
                      <ArrowUpRightIcon
                        className="suggestion-arrow"
                        sx={{
                          fontSize: 15,
                          flexShrink: 0,
                          opacity: 0,
                          transform: "translate(-3px, 3px)",
                          transition: "opacity 150ms ease, transform 150ms ease",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {!loadingHistory && !loadingSession && messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === "assistant" && index === messages.length - 1;

              if (msg.role === "user") {
                return (
                  <Box key={msg.id} sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box
                      sx={{
                        maxWidth: "85%",
                        px: 1.75,
                        py: 1.1,
                        borderRadius: "12px",
                        background: tokens.level1,
                        border: `1px solid ${tokens.border}`,
                      }}
                    >
                      <Typography
                        level="body-sm"
                        sx={{
                          color: tokens.textPrimary,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                );
              }

              return (
                <Box key={msg.id} sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      mt: "1px",
                      borderRadius: "6px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${tokens.border}`,
                      background: tokens.surface,
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 14, color: tokens.textSecondary }} />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      level="body-sm"
                      sx={{
                        color: tokens.textPrimary,
                        lineHeight: 1.75,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {renderMessage(msg.content)}
                    </Typography>

                    {msg.resolvingMedia && (
                      <Typography level="body-xs" sx={{ mt: 1.5 }}>
                        Pulling matching titles from the catalog...
                      </Typography>
                    )}

                    {!!msg.relatedMedia?.length && (
                      <Box sx={{ mt: 2.5 }}>
                        <Typography sx={{ ...sectionLabelSx, mb: 1.25 }}>
                          Quick picks
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                          {msg.relatedMedia.map((media) => (
                            <Box
                              key={`${msg.id}-${media.mediaType}-${media.id}`}
                              sx={{
                                width: 200,
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.8,
                                "@media (max-width: 800px)": { width: 160 },
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
                                  sx={{ px: 0.2, fontSize: "0.6875rem", lineHeight: 1.5 }}
                                >
                                  {media.reason}
                                </Typography>
                              ) : null}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {!!msg.listActions?.length && (
                      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {msg.listActions.map((action, idx) => {
                          const actionKey = `${msg.id}-${idx}`;
                          const done = executedListActions.has(actionKey);
                          const busy = executingListAction === actionKey;

                          return (
                            <Button
                              key={actionKey}
                              size="sm"
                              variant="outlined"
                              color="neutral"
                              disabled={done || busy}
                              onClick={() => handleListAction(action, actionKey)}
                              startDecorator={
                                busy ? (
                                  <CircularProgress
                                    size="sm"
                                    sx={{ "--CircularProgress-size": "13px" }}
                                  />
                                ) : done ? (
                                  <CheckCircleOutlineIcon
                                    sx={{ fontSize: 14, color: tokens.green }}
                                  />
                                ) : (
                                  <PlaylistAddIcon sx={{ fontSize: 14 }} />
                                )
                              }
                              sx={{ fontSize: "0.75rem", minHeight: 28 }}
                            >
                              {done
                                ? `Added to ${action.listName}`
                                : action.action === "create_and_add"
                                ? `Create "${action.listName}" & add ${action.title}`
                                : `Add ${action.title} to "${action.listName}"`}
                            </Button>
                          );
                        })}
                      </Box>
                    )}

                    {/* Row actions */}
                    <Box
                      sx={{
                        mt: 1.25,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.25,
                        ml: -0.5,
                      }}
                    >
                      <Tooltip
                        size="sm"
                        title={copiedMessageId === msg.id ? "Copied" : "Copy response"}
                      >
                        <IconButton
                          aria-label="Copy message"
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => void copyMessage(msg)}
                          sx={messageActionSx}
                        >
                          {copiedMessageId === msg.id ? (
                            <CheckIcon sx={{ fontSize: 14, color: tokens.green }} />
                          ) : (
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      {isLastAssistant ? (
                        <Tooltip size="sm" title="Regenerate response">
                          <IconButton
                            aria-label="Regenerate response"
                            size="sm"
                            variant="plain"
                            color="neutral"
                            disabled={loading}
                            onClick={() => void regenerateLastAssistant()}
                            sx={messageActionSx}
                          >
                            <RefreshRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      ) : null}

                      {msg.createdAtMs ? (
                        <Typography
                          level="body-xs"
                          sx={{ ml: 0.75, fontSize: "0.6875rem" }}
                        >
                          {formatSessionDate(msg.createdAtMs)}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {loading && (
              <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    mt: "1px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${tokens.border}`,
                    background: tokens.surface,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 14, color: tokens.textSecondary }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, height: 26 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: tokens.textTertiary,
                        animation: "smileAiPulse 1.2s infinite ease-in-out",
                        animationDelay: `${i * 0.16}s`,
                        "@keyframes smileAiPulse": {
                          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.35 },
                          "40%": { transform: "scale(1)", opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Composer */}
        <Box sx={{ flexShrink: 0, px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, pt: 1 }}>
          <Box sx={{ width: "100%", maxWidth: 768, mx: "auto" }}>
            <Box
              sx={{
                border: `1px solid ${tokens.border}`,
                borderRadius: "12px",
                background: tokens.surface,
                transition: "border-color 150ms ease",
                "&:hover": { borderColor: tokens.borderHover },
                "&:focus-within": { borderColor: tokens.borderHover },
              }}
            >
              <Textarea
                variant="plain"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask about a movie, or describe something you want to watch..."
                minRows={1}
                maxRows={8}
                disabled={loading || loadingSession}
                sx={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "12px 12px 0 0",
                  px: 1.75,
                  pt: 1.5,
                  pb: 0.5,
                  fontSize: "0.875rem",
                  "&.Mui-focused": { border: "none", boxShadow: "none" },
                  "&:hover": { border: "none" },
                  "&::before": { display: "none" },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  px: 1.25,
                  pb: 1.25,
                  pt: 0.25,
                }}
              >
                <Typography
                  level="body-xs"
                  sx={{
                    fontSize: "0.6875rem",
                    pl: 0.5,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  <Box component="kbd" sx={kbdSx}>
                    Enter
                  </Box>{" "}
                  to send ·{" "}
                  <Box component="kbd" sx={kbdSx}>
                    Shift + Enter
                  </Box>{" "}
                  for a new line
                </Typography>

                <IconButton
                  aria-label="Send message"
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || loading || loadingSession}
                  sx={{
                    ml: "auto",
                    "--IconButton-size": "30px",
                    borderRadius: "6px",
                    background: tokens.textPrimary,
                    color: tokens.black,
                    "&:hover": { background: "#ffffff" },
                    "&.Mui-disabled": {
                      background: tokens.level2,
                      color: tokens.textTertiary,
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Drawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        size="sm"
      >
        <Box sx={{ height: "100%", px: 1.5, py: 2, display: "flex", flexDirection: "column" }}>
          {sessionList}
        </Box>
      </Drawer>
    </Box>
  );
}

export default AIAssistant;
