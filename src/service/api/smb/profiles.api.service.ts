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
};
