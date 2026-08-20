import { smbV1API } from "../api";

export type WatchPartyControl = "everyone" | "host";
export type WatchPartyPlayState = "playing" | "paused";

export interface WatchPartyMember {
  pid: string;
  displayName: string;
  isGuest: boolean;
  joinedAt: number;
  lastSeenAt: number;
}

export interface WatchPartyMessage {
  id: string;
  pid: string;
  displayName: string;
  text: string;
  at: number;
}

export interface WatchPartyReaction {
  id: string;
  pid: string;
  displayName: string;
  emoji: string;
  at: number;
}

export interface WatchParty {
  code: string;
  hostPid: string;
  hostName: string;
  mediaType: "movie" | "tv";
  mediaId: string;
  season: number | null;
  episode: number | null;
  provider: string;
  server: string;
  version: string;
  control: WatchPartyControl;
  state: WatchPartyPlayState;
  currentTime: number;
  updatedAt: number;
  updatedBy: string;
  createdAt: string;
  expiresAt: number;
  /** Whether the party has a voice/video room to join. */
  hasVideoChat: boolean;
  /** Whether this deployment can offer voice and video at all. */
  canVideoChat: boolean;
  members: WatchPartyMember[];
  messages: WatchPartyMessage[];
  reactions: WatchPartyReaction[];
}

export interface WatchPartySelf {
  pid: string;
  displayName: string;
  isGuest?: boolean;
  isHost: boolean;
  canControl: boolean;
}

export interface WatchPartyJoinResult {
  party: WatchParty;
  you: WatchPartySelf;
  /** Room URL and a meeting token minted for this member, when available. */
  daily: { url: string; token: string } | null;
}

/** Guests identify themselves on every call; signed-in users are read from the cookie. */
export interface GuestIdentity {
  pid?: string;
  displayName?: string;
}

export const watchPartyAPI = {
  create: async (payload: {
    mediaType: string;
    mediaId: string;
    season?: number;
    episode?: number;
    provider?: string;
    server?: string;
    version?: string;
  }): Promise<{ code: string; party: WatchParty }> => {
    const r = await smbV1API.post("/watchparty", payload);
    return r.data;
  },

  get: async (code: string): Promise<WatchParty> => {
    const r = await smbV1API.get(`/watchparty/${code}`);
    return r.data;
  },

  join: async (
    code: string,
    identity: GuestIdentity = {},
  ): Promise<WatchPartyJoinResult> => {
    const r = await smbV1API.post(`/watchparty/${code}/join`, identity);
    return r.data;
  },

  /** Presence heartbeat, and the playback transport when Daily is unavailable. */
  sync: async (
    code: string,
    payload: GuestIdentity & {
      state?: WatchPartyPlayState;
      currentTime?: number;
    },
  ): Promise<{ party: WatchParty; you: WatchPartySelf; serverTime: number }> => {
    const r = await smbV1API.post(`/watchparty/${code}/sync`, payload);
    return r.data;
  },

  /** Host-only: control mode, and moving everyone to another episode. */
  update: async (
    code: string,
    payload: GuestIdentity & {
      control?: WatchPartyControl;
      mediaType?: string;
      mediaId?: string;
      season?: number | null;
      episode?: number | null;
      provider?: string;
      server?: string;
      version?: string;
    },
  ): Promise<{ success: boolean; party: WatchParty }> => {
    const r = await smbV1API.patch(`/watchparty/${code}`, payload);
    return r.data;
  },

  sendMessage: async (
    code: string,
    text: string,
    identity: GuestIdentity = {},
  ): Promise<{ success: boolean; message: WatchPartyMessage }> => {
    const r = await smbV1API.post(`/watchparty/${code}/messages`, {
      ...identity,
      text,
    });
    return r.data;
  },

  sendReaction: async (
    code: string,
    emoji: string,
    identity: GuestIdentity = {},
  ): Promise<{ success: boolean; reaction: WatchPartyReaction }> => {
    const r = await smbV1API.post(`/watchparty/${code}/reactions`, {
      ...identity,
      emoji,
    });
    return r.data;
  },

  leave: async (code: string, identity: GuestIdentity = {}) => {
    const r = await smbV1API.post(`/watchparty/${code}/leave`, identity);
    return r.data;
  },
};
