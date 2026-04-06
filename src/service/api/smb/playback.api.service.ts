import { smbV1API } from "../api";

export const playbackAPI = {
  createSession: async (payload: Record<string, unknown>) => {
    const response = await smbV1API.post("/playback/sessions", payload);
    return response;
  },
  heartbeat: async (sessionId: string, payload: Record<string, unknown>) => {
    const response = await smbV1API.post(`/playback/sessions/${sessionId}/heartbeat`, payload);
    return response;
  },
  complete: async (sessionId: string, payload: Record<string, unknown>) => {
    const response = await smbV1API.post(`/playback/sessions/${sessionId}/complete`, payload);
    return response;
  },
};
