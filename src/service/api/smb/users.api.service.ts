import {
  User,
  UserLogin,
  UserRegister,
} from "../../../user";
import { smbAPI } from "../api";

export const users = {
  getAll: async () => {
    const response = await smbAPI.get("/users");
    return response;
  },
  getById: async (id: string) => {
    const response = await smbAPI.get(`/users/id/${id}`);
    return response;
  },
  getByEmail: async (email: string) => {
    const response = await smbAPI.get(`/users/email/${email}`);
    return response;
  },
  getMyself: async () => {
    const response = await smbAPI.get("/users/myself");
    return response;
  },
  updateById: async (id: string, user: User) => {
    const response = await smbAPI.put(`/users/id/${id}`, user);
    return response;
  },
  updateByEmail: async (email: string, user: User) => {
    const response = await smbAPI.put(`/users/email/${email}`, user);
    return response;
  },
  updateMyself: async (user: Partial<User>) => {
    const response = await smbAPI.put("/users/myself", user);
    return response;
  },
  deleteById: async (id: string) => {
    const response = await smbAPI.delete(`/users/id/${id}`);
    return response;
  },
  deleteByEmail: async (email: string) => {
    const response = await smbAPI.delete(`/users/email/${email}`);
    return response;
  },
  deleteMyself: async () => {
    const response = await smbAPI.delete("/users/myself");
    return response;
  },
  register: async (user: UserRegister) => {
    const response = await smbAPI.post("/users/register", user);
    return response;
  },
  login: async (user: UserLogin) => {
    const response = await smbAPI.post("/users/login", user);
    return response;
  },
  logout: async () => {
    const response = await smbAPI.post("/users/logout");
    return response;
  },
  verify: async (token: string) => {
    const response = await smbAPI.post("/users/verify/" + token);
    return response;
  },
  resendTokenVerification: async () => {
    const response = await smbAPI.post("/users/resendVericationToken");
    return response;
  },
  forgotPassword: async (email: string) => {
    const response = await smbAPI.post("/users/forgotPassword", { email });
    return response;
  },
  resendForgotPasswordToken: async (email: string) => {
    const response = await smbAPI.post("/users/resendForgotPasswordToken", { email });
    return response;
  },
  resetPassword: async (email: string, token: string, password: string) => {
    const response = await smbAPI.post("/users/resetPassword/" + email + "/" + token, { password });
    return response;
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await smbAPI.post("/users/changePassword", { oldPassword, newPassword });
    return response;
  },
  addToWatchlist: async (
    typeMovie: string,
    movieId: string,
    poster: string,
    title: string,
  ) => {
    const response = await smbAPI.post(`/users/watchlist/`, {
      typeMovie, movieId, poster, title,
    });
    return response;
  },
  removeFromWatchlist: async (typeMovie: string, movieId: string) => {
    const response = await smbAPI.delete(`/users/watchlist/${typeMovie}/${movieId}`);
    return response;
  },
  upsertRecentlyWatched: async (
    typeMovie: string,
    movieId: string,
    poster: string,
    title: string,
    duration = 0,
    currentTime = 0,
    currentSeason = 0,
    currentEpisode = 0,
    nextSeason = 0,
    nextEpisode = 0,
  ) => {
    const response = await smbAPI.post(`/users/recently-watched/`, {
      typeMovie,
      movieId,
      poster,
      title,
      duration,
      currentTime,
      currentSeason,
      currentEpisode,
      nextSeason,
      nextEpisode,
    });
    return response;
  },
  upsertRating: async (
    typeMovie: string,
    movieId: string,
    poster: string,
    title: string,
    rating: number,
  ) => {
    const response = await smbAPI.post(`/users/ratings/`, {
      typeMovie, movieId, poster, title, rating,
    });
    return response;
  },
  deleteRating: async (typeMovie: string, movieId: string) => {
    const response = await smbAPI.delete(`/users/ratings/${typeMovie}/${movieId}`);
    return response;
  },
  lastLogin: async (deviceId: string) => {
    const response = await smbAPI.post(`/users/lastLogin/`, { deviceId });
    return response;
  },
  addDevice: async (deviceId: string, deviceType: string, deviceName: string) => {
    const response = await smbAPI.post(`/users/addDevice`, { deviceId, deviceType, deviceName });
    return response;
  },
  deleteDevice: async (deviceId: string) => {
    const response = await smbAPI.delete(`/users/deleteDevice/${deviceId}`);
    return response;
  },
  activateDevice: async (deviceId: string) => {
    const response = await smbAPI.post(`/users/activateDevice/${deviceId}`);
    return response;
  },
  requestActivateDevice: async (deviceId: string) => {
    const response = await smbAPI.post(`/users/requestActivateDevice/${deviceId}`);
    return response;
  },
  verifyDevice: async (deviceId: string, token: string) => {
    const response = await smbAPI.post(`/users/verifyDevice/${deviceId}/${token}`);
    return response;
  },
};
