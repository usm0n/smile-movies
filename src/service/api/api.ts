import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    apiKey: import.meta.env.VITE_API_KEY,
  },
});

export const tmdbAPI = axios.create({
  baseURL: import.meta.env.VITE_TMDB_API_URL,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
});
