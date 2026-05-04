import { smbV1API } from "../api";

export interface WatchParty {
  code: string;
  hostUid: string;
  mediaType: "movie" | "tv";
  mediaId: string;
  season?: number;
  episode?: number;
  state: "playing" | "paused";
  currentTime: number;
  createdAt: string;
  members: string[];
  messages?: WatchPartyMessage[];
}

export interface WatchPartyMessage {
  uid: string;
  displayName?: string;
  text: string;
  at: number;
}

export const watchPartyAPI = {
  create: async (payload: {
    mediaType: string;
    mediaId: string;
    season?: number;
    episode?: number;
  }): Promise<{ code: string }> => {
    const r = await smbV1API.post("/watchparty", payload);
    return r.data;
  },
  get: async (code: string): Promise<WatchParty> => {
    const r = await smbV1API.get(`/watchparty/${code}`);
    return r.data;
  },
  update: async (
    code: string,
    payload: { state?: string; currentTime?: number },
  ) => {
    const r = await smbV1API.patch(`/watchparty/${code}`, payload);
    return r.data;
  },
  sendMessage: async (code: string, text: string) => {
    const r = await smbV1API.post(`/watchparty/${code}/messages`, { text });
    return r.data;
  },
  join: async (code: string) => {
    const r = await smbV1API.post(`/watchparty/${code}/join`);
    return r.data;
  },
  leave: async (code: string) => {
    const r = await smbV1API.post(`/watchparty/${code}/leave`);
    return r.data;
  },
};
