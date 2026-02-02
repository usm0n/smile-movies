import axios from "axios";

export const smbAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
});

export const tmdbAPI = axios.create({
  baseURL: import.meta.env.VITE_TMDB_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
});

export const ocAPI = axios.create({
  baseURL: import.meta.env.VITE_OC_API_URL,
});

export const nuvioAPI = axios.create({
  baseURL: import.meta.env.VITE_NUVIO_API_URL,
});