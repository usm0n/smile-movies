import axios from "axios";
import toast from "react-hot-toast";

export const smbAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
});

smbAPI.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const data = error.response?.data || "Something went wrong";
    const status = error.response?.status;

    toast.error(data.message);

    return Promise.reject({ data, status, originalError: error });
  },
);

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
