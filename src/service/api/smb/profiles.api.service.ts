import { smbV1API } from "../api";

export const profilesAPI = {
  getProfile: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}`);
    return response;
  },
  getWatchlist: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/watchlist`);
    return response;
  },
  getRecentlyWatched: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/recently-watched`);
    return response;
  },
  getRatings: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/ratings`);
    return response;
  },
  getReviews: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/reviews`);
    return response;
  },
  setPin: async (pin: string) => {
    const response = await smbV1API.post("/profiles/pin/set", { pin });
    return response.data;
  },
  disablePin: async () => {
    const response = await smbV1API.post("/profiles/pin/set", { disable: true });
    return response.data;
  },
  verifyPin: async (pin: string) => {
    const response = await smbV1API.post("/profiles/pin/verify", { pin });
    return response.data as { valid: boolean };
  },
  resetPinRequest: async () => {
    const response = await smbV1API.post("/profiles/pin/reset-request");
    return response.data;
  },
  resetPinConfirm: async (token: string, newPin: string) => {
    const response = await smbV1API.post("/profiles/pin/reset-confirm", { token, newPin });
    return response.data;
  },
};

