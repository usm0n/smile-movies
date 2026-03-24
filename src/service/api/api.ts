import axios from "axios";
import toast from "react-hot-toast";
import { deviceId } from "../../utilities/defaults";

export const smbAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
});

// Attach the current device's fingerprint ID to every request so the backend
// can verify the device is active via requireActiveDevice middleware.
smbAPI.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = deviceId();
  return config;
});

smbAPI.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const data = error.response?.data || "Something went wrong";
    const status = error.response?.status;
    const originalRequest = error.config;

    // Auto-refresh JWT on 401 — one retry only, never loop
    if (status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        await smbAPI.post("/users/auth/refresh");
        return smbAPI(originalRequest);
      } catch (_) {
        // Refresh also failed — user must log in again
        toast.error("Session expired. Please sign in again.");
        return Promise.reject({ data, status, originalError: error });
      }
    }

    // Show a specific message for inactive device errors
    if (status === 403 && data?.code === "DEVICE_NOT_ACTIVE") {
      toast.error("This device needs to be activated. Go to Settings → Devices.");
    } else {
      toast.error(data?.message || "Something went wrong");
    }

    return Promise.reject({ data, status, originalError: error });
  }
);

export const tmdbAPI = axios.create({
  baseURL: import.meta.env.VITE_TMDB_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
});

export const omdbAPI = axios.create({
  baseURL: "https://www.omdbapi.com",
  params: {
    apikey: import.meta.env.VITE_OMDB_API_KEY,
  },
});

export const ocAPI = axios.create({
  baseURL: import.meta.env.VITE_OC_API_URL,
});

export const nuvioAPI = axios.create({
  baseURL: import.meta.env.VITE_NUVIO_API_URL,
});
