import axios from "axios";
import toast from "react-hot-toast";
import { deviceId, isLoggedIn } from "../../utilities/defaults";

export const smbAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "X-API-Key": import.meta.env.VITE_API_KEY },
});

// Attach the current device fingerprint to every request
smbAPI.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = deviceId();
  return config;
});

smbAPI.interceptors.response.use(
  (response) => {
    // Only show success toast for mutation requests (POST/PUT/DELETE), not GET
    if (response.data?.message && response.config.method !== "get") {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const data = error.response?.data;
    const status = error.response?.status;
    const originalRequest = error.config;

    // Auto-refresh JWT on 401 — only if user was logged in and this is not
    // already a retry or a refresh/login/register call
    const isAuthRoute = originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes("/register") ||
      originalRequest?.url?.includes("/refresh");

    if (status === 401 && !originalRequest._retried && isLoggedIn && !isAuthRoute) {
      originalRequest._retried = true;
      try {
        await smbAPI.post("/users/auth/refresh");
        return smbAPI(originalRequest);
      } catch (_) {
        // Refresh also failed — silent, let the app handle auth state
      }
    }

    // Show error toast — but skip silent 401s for non-logged-in users (e.g. getMyself on load)
    const shouldSuppressToast =
      status === 401 && !isLoggedIn;

    if (!shouldSuppressToast && data?.message) {
      if (status === 403 && data?.code === "DEVICE_NOT_ACTIVE") {
        toast.error("This device needs activation. Go to Settings → Devices.");
      } else {
        toast.error(data.message);
      }
    }

    return Promise.reject({ data, status, originalError: error });
  }
);

export const tmdbAPI = axios.create({
  baseURL: import.meta.env.VITE_TMDB_API_URL,
  headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}` },
});

export const omdbAPI = axios.create({
  baseURL: "https://www.omdbapi.com",
  params: { apikey: import.meta.env.VITE_OMDB_API_KEY },
});

export const ocAPI = axios.create({
  baseURL: import.meta.env.VITE_OC_API_URL,
});

export const nuvioAPI = axios.create({
  baseURL: import.meta.env.VITE_NUVIO_API_URL,
});
