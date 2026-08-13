import {
  Box, Button, Chip, CircularProgress, Divider, IconButton, Input,
  Modal, ModalDialog, Tab, TabList, TabPanel, Tabs, Tooltip, Typography,
} from "@mui/joy";
import { ContentCopy, People, Send, ArrowBackIos, Chat, PersonOutline } from "../components/ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { watchPartyAPI, WatchParty, WatchPartyMessage } from "../service/api/smb/watchparty.api.service";
import { useUsers } from "../context/Users";
import { User } from "../user";
import { toast } from "../components/ui/toast";
import { copyToClipboard } from "../utilities/defaults";

const POLL_INTERVAL_MS = 6000;
const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function WatchPartyPage() {
  const { code } = useParams<{ code: string }>();
  const { myselfData, isAuthenticated } = useUsers();
  const [party, setParty] = useState<WatchParty | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNameSubmitted, setGuestNameSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const joinedRef = useRef(false);

  const myUid = (myselfData?.data as User)?.id;
  const isHost = party?.hostUid === myUid;
  const displayName = isAuthenticated
    ? `${(myselfData?.data as User)?.firstname || ""} ${(myselfData?.data as User)?.lastname || ""}`.trim()
    : guestName;

  const watchUrl = party
    ? `/${party.mediaType}/${party.mediaId}${
        party.mediaType === "tv" && party.season && party.episode
          ? `/${party.season}/${party.episode}` : ""
      }/watch`
    : null;

  const fetchWithRetry = useCallback(async (): Promise<WatchParty | null> => {
    if (!code) return null;
    for (let i = 0; i <= MAX_RETRIES; i++) {
      try {
        return await watchPartyAPI.get(code);
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        if (i < MAX_RETRIES) await sleep(1500);
      }
    }
    return null;
  }, [code]);

  // Initial load
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    fetchWithRetry().then((data) => {
      if (cancelled) return;
      if (!data) { setPageError("Party not found or has ended."); }
      else setParty(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [code, fetchWithRetry]);

  // Join once identity is known
  useEffect(() => {
    if (!party || loading || joinedRef.current) return;
    if (!isAuthenticated && !guestNameSubmitted) return;
    joinedRef.current = true;
    watchPartyAPI.join(code!).catch(() => {});
  }, [party, loading, isAuthenticated, guestNameSubmitted]);

  // Leave on unmount
  useEffect(() => {
    return () => { if (code && joinedRef.current) watchPartyAPI.leave(code).catch(() => {}); };
  }, [code]);

  // Poll — skipped while the tab is in the background, where nobody is reading
  // the chat anyway and each tick would still cost an invocation + a read.
  useEffect(() => {
    if (!code || loading || pageError) return;
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        setParty(await watchPartyAPI.get(code));
      } catch (err: any) {
        if (err?.response?.status === 404) {
          clearInterval(interval);
          toast.message("The watch party has ended.");
          navigate("/");
        }
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [code, loading, pageError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [party?.messages?.length]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !code) return;
    setSending(true);
    try {
      await watchPartyAPI.sendMessage(code, chatInput.trim());
      setChatInput("");
    } catch { toast.error("Failed to send message."); }
    finally { setSending(false); }
  };

  const copyLink = () => { copyToClipboard(`${window.location.origin}/party/${code}`); toast.success("Invite link copied!"); };

  // Guest name prompt for unauthenticated users
  if (!loading && !pageError && !isAuthenticated && !guestNameSubmitted) {
    return (
      <Modal open onClose={() => navigate("/")}>
        <ModalDialog sx={{ maxWidth: 360, textAlign: "center", p: 4, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PersonOutline sx={{ color: "#ededed", fontSize: 28 }} />
          </Box>
          <Typography level="h4">Join the party</Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>What should everyone call you?</Typography>
          <Input autoFocus placeholder="Your name..." value={guestName}
            onChange={(e) => setGuestName(e.target.value.slice(0, 30))}
            onKeyDown={(e) => e.key === "Enter" && guestName.trim() && setGuestNameSubmitted(true)}
            sx={{ width: "100%" }} />
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <Button fullWidth onClick={() => { if (guestName.trim()) setGuestNameSubmitted(true); }} disabled={!guestName.trim()}>Join</Button>
            <Button fullWidth variant="outlined" color="neutral" onClick={() => navigate("/auth/login")}>Log in</Button>
          </Box>
        </ModalDialog>
      </Modal>
    );
  }

  if (loading) return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress size="lg" />
    </Box>
  );

  if (pageError) return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
      <Typography level="h3" sx={{ color: "text.tertiary" }}>{pageError}</Typography>
      <Button onClick={() => navigate("/")} variant="outlined">Go Home</Button>
    </Box>
  );

  if (!party) return null;

  const messages: WatchPartyMessage[] = party.messages || [];
  const members: any[] = Array.isArray(party.members) ? party.members : [];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", background: "#000" }}>
      {/* Player */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 10 }}>
          <IconButton variant="plain" sx={{ color: "white" }} onClick={() => navigate(-1)}><ArrowBackIos /></IconButton>
          <Typography level="title-md" sx={{ flex: 1, color: "white" }}>
            Watch Party
            {party.mediaType === "tv" && party.season && (
              <Typography component="span" level="body-sm" sx={{ color: "rgba(255,255,255,0.4)", ml: 1 }}>· S{party.season} E{party.episode}</Typography>
            )}
          </Typography>
          <Chip startDecorator={<People />} variant="soft" color="neutral" size="sm">{members.length || 1} watching</Chip>
          {isHost && <Chip variant="solid" color="warning" size="sm">Host</Chip>}
          <Tooltip title="Copy invite link">
            <Button size="sm" variant="outlined" color="neutral" startDecorator={<ContentCopy fontSize="small" />} onClick={copyLink}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", display: { xs: "none", sm: "flex" } }}>
              {code}
            </Button>
          </Tooltip>
        </Box>
        {watchUrl ? (
          <Box sx={{ flex: 1, position: "relative" }}>
            <iframe src={watchUrl} style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
              allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
            {!isHost && (
              <Box sx={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.7)", borderRadius: "sm", px: 1.5, py: 0.5, backdropFilter: "blur(4px)" }}>
                <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.6)" }}>🎬 Watching together</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>Loading player...</Typography>
          </Box>
        )}
      </Box>

      {/* Sidebar */}
      <Box sx={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,10,15,0.97)", "@media (max-width: 900px)": { display: "none" } }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as number)} sx={{ background: "transparent", flex: 1, display: "flex", flexDirection: "column" }}>
          <TabList sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <Tab sx={{ color: "white", flex: 1 }}><Chat sx={{ fontSize: 16, mr: 0.5 }} />Chat</Tab>
            <Tab sx={{ color: "white", flex: 1 }}><People sx={{ fontSize: 16, mr: 0.5 }} />Members ({members.length || 1})</Tab>
          </TabList>

          <TabPanel value={0} sx={{ flex: 1, display: "flex", flexDirection: "column", p: 0, overflow: "hidden" }}>
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {messages.length === 0 && (
                <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", mt: 4 }}>No messages yet. Say hi! 👋</Typography>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.uid === myUid || (!myUid && msg.displayName === displayName);
                return (
                  <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                    {!isMine && <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.4)", mb: 0.3 }}>{msg.displayName || "Guest"}</Typography>}
                    <Box sx={{ background: isMine ? "#ededed" : "rgba(255,255,255,0.1)", color: isMine ? "black" : "white", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", px: 1.5, py: 0.75, maxWidth: "85%", wordBreak: "break-word" }}>
                      <Typography level="body-sm">{msg.text}</Typography>
                    </Box>
                    <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.25)", mt: 0.3 }}>
                      {new Date(msg.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
            <Divider />
            <Box sx={{ p: 2, display: "flex", gap: 1 }}>
              <Input size="sm" placeholder="Type a message..." value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                sx={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "white" }} />
              <IconButton size="sm" variant="solid" color="warning" onClick={sendMessage} disabled={!chatInput.trim() || sending}>
                <Send fontSize="small" />
              </IconButton>
            </Box>
          </TabPanel>

          <TabPanel value={1} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            {members.length === 0 ? (
              <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", mt: 4 }}>Just you for now...</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {members.map((m: any, i: number) => {
                  const uid = typeof m === "string" ? m : m.uid;
                  const name = typeof m === "string" ? m.slice(0, 8) : (m.displayName || "Guest");
                  const isMe = uid === myUid || name === displayName;
                  return (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography level="body-sm" sx={{ color: "#ededed", fontWeight: 700 }}>{name.slice(0, 1).toUpperCase()}</Typography>
                      </Box>
                      <Typography level="body-sm" sx={{ color: "white", flex: 1 }}>{name}{isMe ? " (you)" : ""}</Typography>
                      {uid === party.hostUid && <Chip size="sm" variant="solid" color="warning">Host</Chip>}
                    </Box>
                  );
                })}
              </Box>
            )}
          </TabPanel>
        </Tabs>
      </Box>
    </Box>
  );
}

export default WatchPartyPage;
