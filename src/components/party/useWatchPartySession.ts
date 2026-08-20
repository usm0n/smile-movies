import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type DailyIframe from "@daily-co/daily-js";
import type { DailyCall, DailyParticipant } from "@daily-co/daily-js";
import {
  GuestIdentity,
  WatchParty,
  WatchPartyControl,
  WatchPartyMessage,
  WatchPartyReaction,
  watchPartyAPI,
} from "../../service/api/smb/watchparty.api.service";
import { toast } from "../ui/toast";

/**
 * Watch party runtime: shared playback, voice, video, chat and reactions.
 *
 * ## How the syncing works
 *
 * Every party gets a Daily room. Daily is here for the faces and voices, but it
 * also carries `sendAppMessage` — a broadcast data channel over the connection
 * that is already open — and that is what playback sync rides on. It means
 * there is no socket server to run, which matters because the API is deployed
 * as serverless functions that cannot hold a connection open at all.
 *
 * When the room is unavailable — Daily unconfigured, a network that blocks
 * WebRTC — the same messages are carried by polling the API instead. It is
 * slower and chattier, but the party still works, and nothing above this layer
 * has to know which transport it got.
 *
 * ## The rules of playback
 *
 * - Anyone may play, pause and seek by default. The host can narrow that to
 *   host-only, which is what you want for a film and wrong for three friends
 *   watching a sitcom.
 * - A control action broadcasts `{state, time, at}` immediately. Applying a
 *   message from someone else is deliberately silenced for a moment afterwards,
 *   or the resulting local `play`/`seeked` would echo straight back out and the
 *   two clients would seesaw.
 * - The leader — the host, or whoever has been here longest — repeats the state
 *   every few seconds. Streams drift; a correction that arrives unasked is how
 *   nobody notices.
 * - Someone arriving mid-film asks for the state and gets it, so they land
 *   where everyone else is rather than at the beginning.
 */

/** How far out of step before we correct, in seconds. */
const DRIFT_TOLERANCE_SECONDS = 2;
/** Minimum spacing between two drift corrections. */
const CORRECTION_COOLDOWN_MS = 10000;
/** Applying a remote change must not bounce back out as a local one. */
const ECHO_GUARD_MS = 1200;
/** Leader's unprompted correction interval. */
const HEARTBEAT_MS = 4000;
/**
 * How often the polling transport asks the API for the state.
 *
 * This is now the ordinary path, not a fallback — a party only opens a WebRTC
 * connection once somebody turns on a microphone — so it has to be quick enough
 * that a pause lands while the other person is still reaching for the remote.
 * A control action is pushed immediately regardless; this interval only bounds
 * how long the *other* end waits to hear about it.
 */
const POLL_INTERVAL_MS = 1500;
/** Presence/state write-back while Daily carries the real traffic. */
const PRESENCE_INTERVAL_MS = 15000;
/** Volume the film drops to while someone is talking. */
const DUCKED_VOLUME_RATIO = 0.25;
const DUCK_RELEASE_MS = 1200;
const REACTION_LIFETIME_MS = 4000;
/**
 * How long a stall has to last before the party waits for it.
 *
 * Short hitches are constant and self-correcting; pausing everyone for each one
 * would be worse than the hitch. This is the point at which one person is
 * genuinely behind rather than momentarily catching up.
 */
const STALL_GRACE_MS = 900;
/**
 * Nobody waits forever. A viewer whose connection has given up entirely must
 * not hold the rest of the room hostage.
 */
const MAX_WAIT_MS = 20000;

export type PartyStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "not-found"
  | "error";

export type PartyTransport = "daily" | "polling" | "none";

export interface PartyPerson {
  pid: string;
  displayName: string;
  isHost: boolean;
  isSelf: boolean;
  /** Present only while they are actually in the Daily room. */
  sessionId?: string;
  micOn?: boolean;
  camOn?: boolean;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  isSpeaking?: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  displayName: string;
  /** Horizontal position as a percentage, so two at once do not overlap. */
  offset: number;
}

type SyncEnvelope =
  | {
      t: "state";
      state: "playing" | "paused";
      time: number;
      at: number;
      by: string;
      name: string;
    }
  | { t: "hello"; by: string }
  | { t: "chat"; message: WatchPartyMessage }
  | { t: "reaction"; reaction: WatchPartyReaction }
  | { t: "nav"; by: string; name: string; path: string }
  | { t: "control"; mode: WatchPartyControl }
  | { t: "buffering"; by: string; name: string; stalled: boolean };

export interface WatchPartySession {
  status: PartyStatus;
  transport: PartyTransport;
  code: string;
  party: WatchParty | null;
  error: string;

  self: { pid: string; displayName: string } | null;
  isHost: boolean;
  canControl: boolean;
  people: PartyPerson[];

  messages: WatchPartyMessage[];
  unreadCount: number;
  setChatOpen: (open: boolean) => void;
  sendChat: (text: string) => void;

  reactions: FloatingReaction[];
  sendReaction: (emoji: string) => void;

  /** Voice and video, absent when the room could not be joined. */
  /** Voice and video can be offered at all in this deployment. */
  voiceAvailable: boolean;
  micOn: boolean;
  camOn: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  duckAudio: boolean;
  setDuckAudio: (value: boolean) => void;
  someoneSpeaking: string;

  /** Playback is blocked until the viewer interacts — browsers require it. */
  needsGesture: boolean;
  acceptGesture: () => void;

  /**
   * Who the party is currently waiting to finish buffering, if anyone. Empty
   * when everybody is watching.
   */
  waitingFor: string[];

  setControlMode: (mode: WatchPartyControl) => void;
  resync: () => void;
  /** Tell the party everyone should move to this episode. Host only. */
  broadcastNavigation: (path: string, media: {
    mediaType: string;
    mediaId: string;
    season?: number | null;
    episode?: number | null;
  }) => void;
  leave: () => void;
}

/** A DOM-ish media element is all this needs; the player exposes exactly that. */
type PlayerLike = {
  currentTime: number;
  paused: boolean;
  volume: number;
  play: () => Promise<void> | void;
  pause: () => Promise<void> | void;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

const emptySession = (code: string, status: PartyStatus): WatchPartySession => ({
  status,
  transport: "none",
  code,
  party: null,
  error: "",
  self: null,
  isHost: false,
  canControl: true,
  people: [],
  messages: [],
  unreadCount: 0,
  setChatOpen: () => undefined,
  sendChat: () => undefined,
  reactions: [],
  sendReaction: () => undefined,
  voiceAvailable: false,
  micOn: false,
  camOn: false,
  toggleMic: () => undefined,
  toggleCam: () => undefined,
  duckAudio: true,
  setDuckAudio: () => undefined,
  someoneSpeaking: "",
  needsGesture: false,
  acceptGesture: () => undefined,
  waitingFor: [],
  setControlMode: () => undefined,
  resync: () => undefined,
  broadcastNavigation: () => undefined,
  leave: () => undefined,
});

export function useWatchPartySession(options: {
  /** Party code, or null when this is an ordinary solo watch. */
  code: string | null;
  playerRef: React.MutableRefObject<PlayerLike | null>;
  identity: GuestIdentity;
  /**
   * Identifies the media element currently on screen — empty while nothing is
   * loaded. It has to be the source rather than a ready/not-ready flag: moving
   * the party to the next episode swaps the element underneath us, and a
   * boolean that stays `true` across the swap leaves the listeners attached to
   * a player that is no longer there.
   */
  playerKey: string;
  onNavigate: (path: string) => void;
  onLeave: () => void;
}): WatchPartySession {
  const { code, playerRef, identity, playerKey, onNavigate, onLeave } = options;

  const [status, setStatus] = useState<PartyStatus>(code ? "connecting" : "idle");
  const [transport, setTransport] = useState<PartyTransport>("none");
  const [party, setParty] = useState<WatchParty | null>(null);
  const [error, setError] = useState("");
  const [self, setSelf] = useState<{ pid: string; displayName: string } | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [dailyPeople, setDailyPeople] = useState<PartyPerson[]>([]);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [duckAudio, setDuckAudio] = useState(true);
  const [someoneSpeaking, setSomeoneSpeaking] = useState("");
  const [needsGesture, setNeedsGesture] = useState(false);
  const [waitingFor, setWaitingFor] = useState<string[]>([]);

  const callRef = useRef<DailyCall | null>(null);
  const selfRef = useRef<{ pid: string; displayName: string } | null>(null);
  const partyRef = useRef<WatchParty | null>(null);
  const transportRef = useRef<PartyTransport>("none");
  const echoGuardRef = useRef(0);
  const seenIdsRef = useRef(new Set<string>());
  const chatOpenRef = useRef(false);
  const pendingStateRef = useRef<Extract<SyncEnvelope, { t: "state" }> | null>(null);
  /**
   * The last state we were told about.
   *
   * Setting `currentTime` on a player that has not loaded metadata yet is
   * silently dropped, and a party position that arrives during loading is
   * exactly that case — the joiner would start at zero while everyone else was
   * forty minutes in. Keeping it lets the seek be repeated the moment the
   * stream can actually accept one.
   */
  const lastStateRef = useRef<Extract<SyncEnvelope, { t: "state" }> | null>(null);
  /** `serverTime - Date.now()`, so stored positions are read on our clock. */
  const clockSkewRef = useRef(0);
  /**
   * The hold.
   *
   * Seeking is the moment a party falls apart: whoever jumped resumes from a
   * warm buffer while everyone else is still fetching segments at the new
   * position, and from then on they are watching different frames of the same
   * film. So a stall anywhere pauses everyone, and playback resumes only once
   * the slowest person has caught up. `heldRef` remembers that the pause was
   * ours rather than a viewer's, so it can be undone without being mistaken for
   * someone pressing play.
   */
  const stalledPeersRef = useRef(new Map<string, string>());
  /**
   * Deliberately only ever holds *other* people.
   *
   * Holding yourself is a trap: the hold pauses the player, a paused player
   * stops firing the events that would report recovery, and the client sits out
   * the rest of the film ignoring everything the party sends it. Your own stall
   * needs no local pause anyway — the video has already stopped, which is what
   * a stall is. It only needs reporting, so everyone else waits for you.
   */
  const heldRef = useRef(false);
  const holdStartedAtRef = useRef(0);
  const stallTimerRef = useRef(0);
  const localStalledRef = useRef(false);
  const lastCorrectionAtRef = useRef(0);
  /**
   * What the party was last watching.
   *
   * Moving the room to the next episode is announced on the data channel, which
   * the polling fallback does not have. Without this, a party that lost its
   * WebRTC connection would leave everyone behind on the old episode with no
   * sign anything had happened.
   */
  const partyMediaRef = useRef("");
  const identityRef = useRef(identity);
  const duckRef = useRef({ enabled: true, baseVolume: 1, timer: 0 });
  const leftRef = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  /**
   * Only one client answers a newcomer.
   *
   * Everyone answering worked, but five people replying to one arrival is five
   * seeks applied in a row on every screen in the party. The leader speaks for
   * the room; anyone else stays quiet.
   */
  const isLeaderRef = useRef(false);

  identityRef.current = identity;
  onNavigateRef.current = onNavigate;
  duckRef.current.enabled = duckAudio;

  const isHost = Boolean(party && self && party.hostPid === self.pid);
  const canControl = Boolean(
    !party || party.control === "everyone" || (self && party.hostPid === self.pid),
  );
  const canControlRef = useRef(true);
  canControlRef.current = canControl;

  const getPlayer = useCallback((): PlayerLike | null => {
    const player = playerRef.current;
    return player && typeof player.play === "function" ? (player as PlayerLike) : null;
  }, [playerRef]);

  /* ── Transport ──────────────────────────────────────────────────────────── */

  const send = useCallback((envelope: SyncEnvelope) => {
    const call = callRef.current;
    if (call && transportRef.current === "daily") {
      try {
        call.sendAppMessage(envelope, "*");
        return true;
      } catch {
        // Fall through to the API — a failed send is not worth a lost pause.
      }
    }

    if (!code) return false;
    if (envelope.t === "state") {
      void watchPartyAPI
        .sync(code, {
          ...identityRef.current,
          state: envelope.state,
          currentTime: envelope.time,
        })
        .catch(() => undefined);
      return true;
    }

    // Chat and reactions have their own persisted endpoints; the rest —
    // buffering reports, hellos, navigation — exist only on the data channel.
    return false;
  }, [code]);

  const broadcastLocalState = useCallback(() => {
    const player = getPlayer();
    const me = selfRef.current;
    if (!player || !me) return;

    send({
      t: "state",
      state: player.paused ? "paused" : "playing",
      time: Number(player.currentTime) || 0,
      at: Date.now(),
      by: me.pid,
      name: me.displayName,
    });
  }, [getPlayer, send]);

  /* ── Applying someone else's playback state ─────────────────────────────── */

  const applyState = useCallback(
    (envelope: Extract<SyncEnvelope, { t: "state" }>) => {
      const player = getPlayer();
      if (!player) {
        // The stream is still loading; hold the state and apply it on arrival.
        pendingStateRef.current = envelope;
        return;
      }

      /**
       * `at` is always on *our* clock by the time it gets here — see the note
       * on `localiseArrival`. Two browsers' clocks differ by whole seconds
       * routinely, and comparing a sender's `Date.now()` against ours turned
       * that difference into a permanent apparent drift: every four-second
       * heartbeat re-seeked by the size of the skew, so the film rebuffered
       * every four seconds forever. That was the stutter.
       */
      const elapsedSeconds =
        envelope.state === "playing"
          ? Math.max(0, (Date.now() - envelope.at) / 1000)
          : 0;
      const target = Math.max(0, envelope.time + elapsedSeconds);

      lastStateRef.current = envelope;

      const drift = Math.abs(Number(player.currentTime || 0) - target);
      /**
       * Correcting drift costs a rebuffer, so it is worth doing only when the
       * gap is big enough to see, and never twice in quick succession — a
       * correction that lands while the last one is still buffering measures
       * the buffering, not the drift, and chases itself.
       */
      const canCorrect =
        drift > DRIFT_TOLERANCE_SECONDS &&
        Date.now() - lastCorrectionAtRef.current > CORRECTION_COOLDOWN_MS;

      echoGuardRef.current = Date.now() + ECHO_GUARD_MS;

      if (canCorrect) {
        lastCorrectionAtRef.current = Date.now();
        player.currentTime = target;
      }

      // A correction arriving mid-wait must not restart playback under the
      // person everyone is waiting for. The state is recorded either way, so
      // the hold releases into the right one.
      if (envelope.state === "playing" && stalledPeersRef.current.size) return;

      if (envelope.state === "playing" && player.paused) {
        const started = player.play();
        if (started && typeof (started as Promise<void>).catch === "function") {
          (started as Promise<void>).catch(() => {
            // Autoplay policy: nothing can start until this tab has been
            // interacted with. Say so instead of silently falling behind.
            setNeedsGesture(true);
          });
        }
      } else if (envelope.state === "paused" && !player.paused) {
        void player.pause();
      }
    },
    [getPlayer],
  );

  /**
   * Pause for the stragglers, and pick back up when they arrive.
   *
   * The pause is applied under the echo guard so it never leaves this client as
   * "somebody pressed pause" — the party's agreed state is still "playing", and
   * that is what everyone returns to once the wait is over.
   */
  const applyHold = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    const stalled = Array.from(stalledPeersRef.current.values());
    setWaitingFor(stalled);

    if (stalled.length) {
      if (heldRef.current || player.paused) return;
      heldRef.current = true;
      holdStartedAtRef.current = Date.now();
      echoGuardRef.current = Date.now() + ECHO_GUARD_MS;
      void player.pause();
      return;
    }

    if (!heldRef.current) return;
    heldRef.current = false;
    holdStartedAtRef.current = 0;

    // Only resume if the party was playing when the wait began; a hold that
    // overlapped a genuine pause must not restart the film.
    if (partyRef.current?.state !== "playing") return;
    echoGuardRef.current = Date.now() + ECHO_GUARD_MS;
    const started = player.play();
    if (started && typeof (started as Promise<void>).catch === "function") {
      (started as Promise<void>).catch(() => setNeedsGesture(true));
    }
  }, [getPlayer]);

  /** Tell the party this client is, or is no longer, behind. */
  const reportStall = useCallback(
    (stalled: boolean) => {
      const me = selfRef.current;
      if (!me || localStalledRef.current === stalled) return;
      localStalledRef.current = stalled;

      // Without a data channel there is no way to say "I have caught up", so
      // there must be no way to say "wait for me" either — a hold nobody can
      // lift would strand the party.
      if (transportRef.current !== "daily") return;
      send({ t: "buffering", by: me.pid, name: me.displayName, stalled });
    },
    [send],
  );

  /* ── Inbound messages, whichever transport carried them ─────────────────── */

  const handleEnvelope = useCallback(
    (envelope: SyncEnvelope) => {
      const me = selfRef.current;

      switch (envelope.t) {
        case "state":
          if (me && envelope.by === me.pid) return;
          /**
           * Re-stamp on arrival.
           *
           * The data channel delivers in well under the drift tolerance, so
           * treating "when it got here" as "when it was sent" loses nothing
           * measurable — and it removes the sender's clock from the arithmetic
           * entirely, which is the only way two machines whose clocks disagree
           * can stay in step.
           */
          applyState({ ...envelope, at: Date.now() });
          return;

        case "hello": {
          // Somebody just arrived; the leader tells them where the film is.
          if (!me || envelope.by === me.pid || !isLeaderRef.current) return;
          const player = getPlayer();
          if (!player) return;
          send({
            t: "state",
            state: player.paused ? "paused" : "playing",
            time: Number(player.currentTime) || 0,
            at: Date.now(),
            by: me.pid,
            name: me.displayName,
          });
          return;
        }

        case "chat": {
          if (seenIdsRef.current.has(envelope.message.id)) return;
          seenIdsRef.current.add(envelope.message.id);
          setMessages((current) =>
            [...current, envelope.message].sort((a, b) => a.at - b.at),
          );
          if (!chatOpenRef.current && envelope.message.pid !== me?.pid) {
            setUnreadCount((count) => count + 1);
          }
          return;
        }

        case "reaction": {
          if (seenIdsRef.current.has(envelope.reaction.id)) return;
          seenIdsRef.current.add(envelope.reaction.id);
          const floating: FloatingReaction = {
            id: envelope.reaction.id,
            emoji: envelope.reaction.emoji,
            displayName: envelope.reaction.displayName,
            offset: 8 + Math.random() * 70,
          };
          setReactions((current) => [...current, floating]);
          window.setTimeout(() => {
            setReactions((current) => current.filter((item) => item.id !== floating.id));
          }, REACTION_LIFETIME_MS);
          return;
        }

        case "nav":
          if (me && envelope.by === me.pid) return;
          // Clearing this makes the next poll re-seed silently instead of
          // announcing the same move a second time.
          partyMediaRef.current = "";
          toast.message(`${envelope.name} moved the party to the next episode`);
          onNavigateRef.current(envelope.path);
          return;

        case "control":
          setParty((current) =>
            current ? { ...current, control: envelope.mode } : current,
          );
          return;

        case "buffering": {
          if (me && envelope.by === me.pid) return;
          if (envelope.stalled) {
            stalledPeersRef.current.set(envelope.by, envelope.name);
          } else {
            stalledPeersRef.current.delete(envelope.by);
          }
          applyHold();
          return;
        }
      }
    },
    [applyHold, applyState, getPlayer, send],
  );

  /* ── Local playback events → the party ──────────────────────────────────── */

  useEffect(() => {
    if (!code || status !== "connected") return;
    const player = getPlayer();
    if (!player) return;

    // A state that arrived before the player existed still applies.
    if (pendingStateRef.current) {
      const pending = pendingStateRef.current;
      pendingStateRef.current = null;
      applyState(pending);
    }

    const handleLocalChange = () => {
      if (Date.now() < echoGuardRef.current) return;

      if (!canControlRef.current) {
        // A follower in host-only mode: put them back where the party is
        // rather than letting them drift off alone.
        const current = partyRef.current;
        if (!current) return;
        echoGuardRef.current = Date.now() + ECHO_GUARD_MS;
        applyState({
          t: "state",
          state: current.state,
          time: current.currentTime,
          at: current.updatedAt
            ? current.updatedAt - clockSkewRef.current
            : Date.now(),
          by: current.updatedBy,
          name: current.hostName,
        });
        toast.message("Only the host can control playback in this party.");
        return;
      }

      broadcastLocalState();
    };

    // A seek issued before the stream was seekable never happened, so the
    // position is claimed again as soon as one can be.
    let hasCaughtUp = false;
    const catchUpOnLoad = () => {
      const known = lastStateRef.current;
      if (hasCaughtUp || !known) return;
      hasCaughtUp = true;
      const elapsed =
        known.state === "playing" ? (Date.now() - known.at) / 1000 : 0;
      applyState({ ...known, time: known.time + elapsed, at: Date.now() });
    };

    /**
     * Stall detection.
     *
     * `waiting` fires constantly during normal playback — every quality switch,
     * every segment boundary on a slow link — so it is reported only once it
     * has lasted long enough to mean this client is genuinely behind. Recovery
     * is reported immediately: nobody should wait a moment longer than needed.
     */
    const handleWaiting = () => {
      if (stallTimerRef.current) return;
      stallTimerRef.current = window.setTimeout(() => {
        stallTimerRef.current = 0;
        reportStall(true);
      }, STALL_GRACE_MS);
    };

    const handleRecovered = () => {
      if (stallTimerRef.current) {
        window.clearTimeout(stallTimerRef.current);
        stallTimerRef.current = 0;
      }
      reportStall(false);
    };

    player.addEventListener("play", handleLocalChange);
    player.addEventListener("pause", handleLocalChange);
    player.addEventListener("seeked", handleLocalChange);
    player.addEventListener("can-play", catchUpOnLoad);
    player.addEventListener("waiting", handleWaiting);
    player.addEventListener("playing", handleRecovered);
    player.addEventListener("can-play", handleRecovered);

    return () => {
      if (stallTimerRef.current) {
        window.clearTimeout(stallTimerRef.current);
        stallTimerRef.current = 0;
      }
      player.removeEventListener("play", handleLocalChange);
      player.removeEventListener("pause", handleLocalChange);
      player.removeEventListener("seeked", handleLocalChange);
      player.removeEventListener("can-play", catchUpOnLoad);
      player.removeEventListener("waiting", handleWaiting);
      player.removeEventListener("playing", handleRecovered);
      player.removeEventListener("can-play", handleRecovered);
    };
  }, [applyState, broadcastLocalState, code, getPlayer, playerKey, reportStall, status]);

  useEffect(() => {
    if (!waitingFor.length) return;

    const timeout = window.setTimeout(() => {
      // Someone has dropped out rather than buffered. Release the room and let
      // them catch up on their own — they can always ask for a resync.
      stalledPeersRef.current.clear();
      applyHold();
      toast.message("Carried on without whoever is still buffering.");
    }, MAX_WAIT_MS);

    return () => window.clearTimeout(timeout);
  }, [applyHold, waitingFor.length]);

  /* ── Leader's periodic correction ───────────────────────────────────────── */

  const isLeader = useMemo(() => {
    if (!party || !self) return false;
    const live = party.members || [];
    const hostPresent = live.some((member) => member.pid === party.hostPid);
    if (hostPresent) return party.hostPid === self.pid;

    const earliest = live
      .slice()
      .sort((a, b) => a.joinedAt - b.joinedAt)[0];
    return earliest ? earliest.pid === self.pid : false;
  }, [party, self]);

  isLeaderRef.current = isLeader;

  useEffect(() => {
    if (!code || status !== "connected" || !isLeader) return;

    const interval = window.setInterval(() => {
      const player = getPlayer();
      if (!player || player.paused) return;
      broadcastLocalState();
    }, HEARTBEAT_MS);

    return () => window.clearInterval(interval);
  }, [broadcastLocalState, code, getPlayer, isLeader, status]);

  /* ── Joining ────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!code) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    leftRef.current = false;
    setStatus("connecting");

    const start = async () => {
      try {
        const result = await watchPartyAPI.join(code, identityRef.current);
        if (cancelled) return;

        setParty(result.party);
        partyRef.current = result.party;
        setSelf({ pid: result.you.pid, displayName: result.you.displayName });
        selfRef.current = { pid: result.you.pid, displayName: result.you.displayName };

        partyMediaRef.current = `${result.party.mediaType}:${result.party.mediaId}:${result.party.season ?? ""}:${result.party.episode ?? ""}`;

        (result.party.messages || []).forEach((message) =>
          seenIdsRef.current.add(message.id),
        );
        setMessages(result.party.messages || []);

        // Join the room straight away. It carries the playback sync, so a party
        // that has not connected is a party where every pause arrives late.
        if (result.daily) {
          const connected = await connectCall(result.daily.url, result.daily.token);
          if (cancelled) return;
          if (!connected) {
            transportRef.current = "polling";
            setTransport("polling");
            toast.message("Voice chat unavailable — syncing over the network instead.");
          }
        } else {
          transportRef.current = "polling";
          setTransport("polling");
        }

        if (cancelled) return;
        setStatus("connected");

        // Seed from the stored position, then ask whoever is playing for the
        // live one — the stored value is only refreshed every few seconds.
        if (result.party.updatedAt) {
          applyState({
            t: "state",
            state: result.party.state,
            time: result.party.currentTime,
            at: result.party.updatedAt - clockSkewRef.current,
            by: result.party.updatedBy,
            name: result.party.hostName,
          });
        }
        send({ t: "hello", by: result.you.pid });
      } catch (requestError) {
        if (cancelled) return;
        const notFound = (requestError as { status?: number })?.status === 404;
        setStatus(notFound ? "not-found" : "error");
        setError(
          notFound
            ? "This watch party has ended."
            : "Could not connect to the watch party.",
        );
      }
    };

    void start();

    return () => {
      cancelled = true;
    };
    // `identity` is read through a ref so a re-render mid-party never rejoins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  /* ── Daily ──────────────────────────────────────────────────────────────── */

  const readDailyPeople = useCallback((call: DailyCall) => {
    const participants = call.participants();
    const me = selfRef.current;
    const hostPid = partyRef.current?.hostPid || "";

    const mapped: PartyPerson[] = Object.values(participants).map(
      (participant: DailyParticipant) => {
        const pid = participant.user_id || participant.session_id;
        return {
          pid,
          displayName: participant.user_name || "Guest",
          isHost: pid === hostPid,
          isSelf: Boolean(participant.local) || pid === me?.pid,
          sessionId: participant.session_id,
          micOn: Boolean(participant.tracks?.audio?.state === "playable"),
          camOn: Boolean(participant.tracks?.video?.state === "playable"),
          videoTrack: participant.tracks?.video?.persistentTrack,
          audioTrack: participant.tracks?.audio?.persistentTrack,
        };
      },
    );

    setDailyPeople(mapped);
    const local = participants.local;
    setMicOn(Boolean(local?.audio));
    setCamOn(Boolean(local?.video));
  }, []);

  /**
   * Join the voice/video room.
   *
   * Everyone joins on arrival, muted and with the camera off. The room is not
   * really about the cameras: `sendAppMessage` runs over the same connection,
   * and it is the only transport here that delivers a pause in the time it
   * takes to press the button. Polling is the fallback for when this fails, and
   * it is noticeably slower — a party on it feels broken.
   */
  const connectCall = useCallback(
    async (url: string, token: string): Promise<boolean> => {
      if (callRef.current) return true;

      try {
        const module = await import("@daily-co/daily-js");
        const factory = module.default as typeof DailyIframe;

        // A leftover instance from a previous party would refuse to create a
        // second one, so any survivor is torn down first.
        const existing = factory.getCallInstance?.();
        if (existing) await existing.destroy().catch(() => undefined);

        const call = factory.createCallObject({
          subscribeToTracksAutomatically: true,
        });
        callRef.current = call;

        const refresh = () => readDailyPeople(call);
        call.on("participant-joined", (event) => {
          refresh();
          const name = event?.participant?.user_name || "Someone";
          toast.message(`${name} joined the party`);
          // Bring them up to speed without waiting for them to ask.
          const player = getPlayer();
          const me = selfRef.current;
          if (player && me && isLeaderRef.current) {
            send({
              t: "state",
              state: player.paused ? "paused" : "playing",
              time: Number(player.currentTime) || 0,
              at: Date.now(),
              by: me.pid,
              name: me.displayName,
            });
          }
        });
        call.on("participant-updated", refresh);
        call.on("participant-left", refresh);
        call.on("joined-meeting", refresh);
        call.on("app-message", (event) => {
          handleEnvelope(event?.data as SyncEnvelope);
        });
        call.on("active-speaker-change", (event) => {
          const sessionId = event?.activeSpeaker?.peerId;
          const participants = call.participants();
          const speaker = Object.values(participants).find(
            (participant: DailyParticipant) => participant.session_id === sessionId,
          );
          setSomeoneSpeaking(
            speaker && !speaker.local ? speaker.user_name || "Someone" : "",
          );
        });
        call.on("error", () => {
          transportRef.current = "polling";
          setTransport("polling");
        });

        await call.join({
          url,
          token,
          startVideoOff: true,
          startAudioOff: true,
        });

        readDailyPeople(call);
        transportRef.current = "daily";
        setTransport("daily");
        return true;
      } catch (joinError) {
        console.error("[watch-party] video chat unavailable:", joinError);
        callRef.current = null;
        return false;
      }
    },
    [getPlayer, handleEnvelope, readDailyPeople, send],
  );



  // `app-message` and `participant-joined` close over `handleEnvelope`, which
  // changes as state does. Rebinding the listener each time keeps them current
  // without tearing down the call.
  useEffect(() => {
    const call = callRef.current;
    if (!call) return;

    const listener = (event?: { data?: unknown }) =>
      handleEnvelope(event?.data as SyncEnvelope);
    call.on("app-message", listener);
    return () => {
      call.off("app-message", listener);
    };
  }, [handleEnvelope]);

  /* ── Ducking the film while someone talks ───────────────────────────────── */

  useEffect(() => {
    const player = getPlayer();
    if (!player || !duckRef.current.enabled) return;

    if (someoneSpeaking) {
      if (!duckRef.current.timer) {
        duckRef.current.baseVolume = Number(player.volume ?? 1);
      }
      window.clearTimeout(duckRef.current.timer);
      duckRef.current.timer = 0;
      player.volume = duckRef.current.baseVolume * DUCKED_VOLUME_RATIO;
      return;
    }

    if (duckRef.current.baseVolume) {
      duckRef.current.timer = window.setTimeout(() => {
        const target = getPlayer();
        if (target) target.volume = duckRef.current.baseVolume;
        duckRef.current.timer = 0;
      }, DUCK_RELEASE_MS);
    }
  }, [getPlayer, someoneSpeaking]);

  /* ── Polling transport and presence ─────────────────────────────────────── */

  useEffect(() => {
    if (!code || status !== "connected") return;

    const isPolling = transport === "polling";
    const interval = window.setInterval(
      () => {
        if (document.visibilityState !== "visible" && !isPolling) return;

        const player = getPlayer();
        const shouldWriteState = isLeader && canControlRef.current && player;

        void watchPartyAPI
          .sync(code, {
            ...identityRef.current,
            ...(shouldWriteState
              ? {
                  state: player.paused ? "paused" : ("playing" as const),
                  currentTime: Number(player.currentTime) || 0,
                }
              : {}),
          })
          .then((response) => {
            const next = response.party;
            setParty(next);
            partyRef.current = next;
            // `updatedAt` is stamped by the server. Read against a browser
            // clock that is a few seconds out, it would put the whole party
            // permanently ahead of or behind the film.
            if (response.serverTime) {
              clockSkewRef.current = response.serverTime - Date.now();
            }

            const mediaKey = `${next.mediaType}:${next.mediaId}:${next.season ?? ""}:${next.episode ?? ""}`;
            if (partyMediaRef.current && partyMediaRef.current !== mediaKey) {
              partyMediaRef.current = mediaKey;
              const path =
                next.mediaType === "tv"
                  ? `/tv/${next.mediaId}/${next.season || 1}/${next.episode || 1}/watch`
                  : `/movie/${next.mediaId}/watch`;
              toast.message("The party moved to another episode.");
              onNavigateRef.current(`${path}${window.location.search}`);
              return;
            }
            partyMediaRef.current = mediaKey;

            if (!isPolling) return;

            // Only the polling transport carries content this way; over Daily
            // the same messages have already arrived on the data channel.
            (next.messages || []).forEach((message) => {
              if (seenIdsRef.current.has(message.id)) return;
              handleEnvelope({ t: "chat", message });
            });
            (next.reactions || []).forEach((reaction) => {
              if (seenIdsRef.current.has(reaction.id)) return;
              // Reactions older than their lifetime are history, not events.
              if (Date.now() - reaction.at > REACTION_LIFETIME_MS) {
                seenIdsRef.current.add(reaction.id);
                return;
              }
              handleEnvelope({ t: "reaction", reaction });
            });

            const me = selfRef.current;
            if (next.updatedBy && next.updatedBy !== me?.pid && next.updatedAt) {
              applyState({
                t: "state",
                state: next.state,
                time: next.currentTime,
                at: next.updatedAt - clockSkewRef.current,
                by: next.updatedBy,
                name: next.hostName,
              });
            }
          })
          .catch((syncError: unknown) => {
            if ((syncError as { status?: number })?.status === 404) {
              setStatus("not-found");
              setError("This watch party has ended.");
            }
          });
      },
      isPolling ? POLL_INTERVAL_MS : PRESENCE_INTERVAL_MS,
    );

    return () => window.clearInterval(interval);
  }, [applyState, code, getPlayer, handleEnvelope, isLeader, status, transport]);

  /* ── Leaving ────────────────────────────────────────────────────────────── */

  const leave = useCallback(() => {
    if (leftRef.current) return;
    leftRef.current = true;

    const call = callRef.current;
    callRef.current = null;
    if (call) void call.destroy().catch(() => undefined);

    if (code) void watchPartyAPI.leave(code, identityRef.current).catch(() => undefined);
    onLeave();
  }, [code, onLeave]);

  useEffect(() => {
    if (!code) return;

    const handleUnload = () => {
      const call = callRef.current;
      if (call) void call.destroy().catch(() => undefined);
    };

    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("pagehide", handleUnload);
      const call = callRef.current;
      callRef.current = null;
      if (call) void call.destroy().catch(() => undefined);
      if (!leftRef.current) {
        void watchPartyAPI.leave(code, identityRef.current).catch(() => undefined);
      }
    };
  }, [code]);

  /* ── Actions ────────────────────────────────────────────────────────────── */

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.replace(/\s+/g, " ").trim().slice(0, 400);
      const me = selfRef.current;
      if (!trimmed || !code || !me) return;

      void watchPartyAPI
        .sendMessage(code, trimmed, identityRef.current)
        .then((response) => {
          // The stored message is the one everyone else will see, so it is the
          // one broadcast — ids match and nobody gets it twice.
          if (seenIdsRef.current.has(response.message.id)) return;
          seenIdsRef.current.add(response.message.id);
          setMessages((current) =>
            [...current, response.message].sort((a, b) => a.at - b.at),
          );
          send({ t: "chat", message: response.message });
        })
        .catch(() => toast.error("Message not sent."));
    },
    [code, send],
  );

  const sendReactionEmoji = useCallback(
    (emoji: string) => {
      const me = selfRef.current;
      if (!code || !me) return;

      const optimistic: WatchPartyReaction = {
        id: `${me.pid}-${Date.now()}`,
        pid: me.pid,
        displayName: me.displayName,
        emoji,
        at: Date.now(),
      };
      handleEnvelope({ t: "reaction", reaction: optimistic });
      send({ t: "reaction", reaction: optimistic });

      if (transportRef.current === "polling") {
        void watchPartyAPI
          .sendReaction(code, emoji, identityRef.current)
          .catch(() => undefined);
      }
    },
    [code, handleEnvelope, send],
  );

  /**
   * Mic and camera are plain switches now: the room is already joined, so
   * turning one on is a local device change rather than a connection dance.
   */
  const toggleMic = useCallback(() => {
    const call = callRef.current;
    if (!call) {
      toast.message("Voice chat is still connecting.");
      return;
    }
    const next = !micOn;
    call.setLocalAudio(next);
    setMicOn(next);
  }, [micOn]);

  const toggleCam = useCallback(() => {
    const call = callRef.current;
    if (!call) {
      toast.message("Video chat is still connecting.");
      return;
    }
    const next = !camOn;
    call.setLocalVideo(next);
    setCamOn(next);
  }, [camOn]);

  const setControlMode = useCallback(
    (mode: WatchPartyControl) => {
      if (!code) return;
      setParty((current) => (current ? { ...current, control: mode } : current));
      send({ t: "control", mode });
      void watchPartyAPI
        .update(code, { ...identityRef.current, control: mode })
        .catch(() => toast.error("Could not change who can control playback."));
    },
    [code, send],
  );

  const resync = useCallback(() => {
    const me = selfRef.current;
    if (!me) return;
    send({ t: "hello", by: me.pid });
    toast.message("Catching up with the party…");
  }, [send]);

  const broadcastNavigation = useCallback(
    (path: string, media: {
      mediaType: string;
      mediaId: string;
      season?: number | null;
      episode?: number | null;
    }) => {
      const me = selfRef.current;
      if (!code || !me) return;

      partyMediaRef.current = `${media.mediaType}:${media.mediaId}:${
        media.season ?? ""
      }:${media.episode ?? ""}`;

      send({ t: "nav", by: me.pid, name: me.displayName, path });
      void watchPartyAPI
        .update(code, { ...identityRef.current, ...media })
        .catch(() => undefined);
    },
    [code, send],
  );

  const acceptGesture = useCallback(() => {
    setNeedsGesture(false);
    const player = getPlayer();
    const current = partyRef.current;
    if (!player || !current) return;
    if (current.state === "playing") void player.play();
  }, [getPlayer]);

  /**
   * Unread only counts while nobody is looking. Marking the chat read on open
   * and never marking it unread again meant the badge stopped working for the
   * rest of the party.
   */
  const setChatOpen = useCallback((open: boolean) => {
    chatOpenRef.current = open;
    if (open) setUnreadCount(0);
  }, []);

  /* ── The roster ─────────────────────────────────────────────────────────── */

  const people = useMemo(() => {
    const hostPid = party?.hostPid || "";
    const byPid = new Map<string, PartyPerson>();

    // Everyone the API knows about, so people without video still show up.
    (party?.members || []).forEach((member) => {
      byPid.set(member.pid, {
        pid: member.pid,
        displayName: member.displayName,
        isHost: member.pid === hostPid,
        isSelf: member.pid === self?.pid,
      });
    });

    // Daily is live, so it wins wherever the two disagree.
    dailyPeople.forEach((person) => {
      byPid.set(person.pid, {
        ...byPid.get(person.pid),
        ...person,
        isHost: person.pid === hostPid,
      });
    });

    return Array.from(byPid.values()).sort((a, b) => {
      if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [dailyPeople, party, self?.pid]);

  // A peer who leaves mid-stall cannot report recovery, so their hold leaves
  // with them — otherwise a closed tab pauses the party indefinitely.
  useEffect(() => {
    const present = new Set(people.map((person) => person.pid));
    let changed = false;
    stalledPeersRef.current.forEach((_name, pid) => {
      if (present.has(pid) || pid === selfRef.current?.pid) return;
      stalledPeersRef.current.delete(pid);
      changed = true;
    });
    if (changed) applyHold();
  }, [applyHold, people]);

  if (!code) return emptySession("", "idle");

  return {
    status,
    transport,
    code,
    party,
    error,
    self,
    isHost,
    canControl,
    people,
    messages,
    unreadCount,
    setChatOpen,
    sendChat,
    reactions,
    sendReaction: sendReactionEmoji,
    voiceAvailable: transport === "daily",
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    duckAudio,
    setDuckAudio,
    someoneSpeaking,
    needsGesture,
    acceptGesture,
    waitingFor,
    setControlMode,
    resync,
    broadcastNavigation,
    leave,
  };
}
