import { tmdbAPI } from "./api";

const tmdb = {
  discoverMovies: async (page: number): Promise<void> => {
    try {
      const response = await tmdbAPI.get("/discover/movie?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
};

export default tmdb;
