import { smbV1API } from "../api";

export const profilesAPI = {
  getProfile: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}`);
    return response;
  },
  getFavorites: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/favorites`);
    return response;
  },
  getWatchlist: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/watchlist`);
    return response;
  },
  getReviews: async (handle: string) => {
    const response = await smbV1API.get(`/profiles/${handle}/reviews`);
    return response;
  },
};
