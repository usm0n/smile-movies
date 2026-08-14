import axios from "axios";
import { toast } from "../../components/ui/toast";
import { deviceId, isLoggedIn } from "../../utilities/defaults";

export const smbAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "X-API-Key": import.meta.env.VITE_API_KEY },
});

const v1BaseUrl = String(import.meta.env.VITE_API_URL || "").replace(
  /\/api\/v3\/?$/,
  "/api/v1",
);

export const smbV1API = axios.create({
  baseURL: v1BaseUrl,
  withCredentials: true,
  headers: { "X-API-Key": import.meta.env.VITE_API_KEY },
});

// Attach the current device fingerprint to every request
smbAPI.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = deviceId();
  return config;
});

smbV1API.interceptors.request.use((config) => {
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

/**
 * TMDB returns titles, overviews and taglines in whatever `language` the
 * request asks for, so the interface locale has to reach every call. The value
 * lives here rather than in React state because the axios instance is created
 * once at module load, outside any provider; `LocaleProvider` pushes changes in.
 */
let tmdbLanguage = "en-US";

export const setTmdbLanguage = (language: string) => {
  tmdbLanguage = language;
};

/** Bare subtag (`ru`, `en`) — what the artwork endpoints and logo pickers use. */
export const getTmdbImageLanguage = () => tmdbLanguage.split("-")[0];

/**
 * Preference list for artwork and trailers: the viewer's language first, then
 * English, then `null` — TMDB's marker for textless assets, which read
 * correctly in any locale and are usually the best hero backdrops.
 */
const preferredMediaLanguages = () => {
  const subtag = getTmdbImageLanguage();
  return subtag === "en" ? "en,null" : `${subtag},en,null`;
};

tmdbAPI.interceptors.request.use((config) => {
  const url = config.url || "";

  /**
   * `/images` treats `language` as a hard filter rather than a preference, so
   * asking it for `ru-RU` returns only artwork that has Russian text — for
   * Fight Club that is 1 backdrop instead of 105, and for most titles none at
   * all, which empties the hero. `include_image_language` is the endpoint's
   * own way to express a preference: Russian first, then English, then the
   * textless artwork (`null`) that suits any locale.
   */
  if (/\/images(\?|$)/.test(url)) {
    config.params = { include_image_language: preferredMediaLanguages(), ...(config.params || {}) };
    return config;
  }

  /**
   * `/videos` filters the same way — asking for `ru-RU` cuts a recent title
   * from 51 trailers to 1 — so it gets the same preference list, alongside
   * `language` since the two combine here.
   */
  if (/\/videos(\?|$)/.test(url)) {
    config.params = {
      language: tmdbLanguage,
      include_video_language: preferredMediaLanguages(),
      ...(config.params || {}),
    };
    return config;
  }

  // Spread the caller's params last so a request that names its own language
  // — a deliberate English lookup, say — still wins.
  config.params = { language: tmdbLanguage, ...(config.params || {}) };
  return config;
});

export const omdbAPI = axios.create({
  baseURL: "https://www.omdbapi.com",
  params: { apikey: import.meta.env.VITE_OMDB_API_KEY },
});

export const ocAPI = axios.create({
  baseURL: import.meta.env.VITE_OC_API_URL,
});
