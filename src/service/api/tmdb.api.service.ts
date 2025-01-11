import {
  discoverMovie,
  discoverTV,
  trendingMovie,
  trendingTV,
} from "../../interfaces/tmdb";
import { tmdbAPI } from "./api";

const tmdb = {
  discover: async (page: number, kind: "movie" | "tv") => {
    try {
      const response = await tmdbAPI.get(`/discover/${kind}?page=${page}`);
      return response.data as discoverMovie | discoverTV;
    } catch (error) {
      return error;
    }
  },
  trending: async (
    kind: "all" | "movie" | "tv",
    time: "day" | "week",
    page: number,
  ) => {
    try {
      const response = await tmdbAPI.get(
        `/trending/${kind}/${time}?page=${page}`
      );
      return response.data as trendingMovie | trendingTV;
    } catch (error) {
      return error;
    }
  },
};

export default tmdb;
