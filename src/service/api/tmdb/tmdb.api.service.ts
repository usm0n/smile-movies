import { tmdbAPI } from "../api";

export const tmdb = {
  discover: async (kind: "movie" | "tv") => {
    try {
      const response = await tmdbAPI.get("/discover/" + kind);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  nowPlayingMovies: async () => {
    try {
      const response = await tmdbAPI.get("/movie/now_playing");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  popularMovies: async () => {
    try {
      const response = await tmdbAPI.get("/movie/popular");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  topRatedMovies: async () => {
    try {
      const response = await tmdbAPI.get("/movie/top_rated");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  upcomingMovies: async () => {
    try {
      const response = await tmdbAPI.get("/movie/upcoming");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  airingTodayTv: async () => {
    try {
      const response = await tmdbAPI.get("/tv/airing_today");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  onTheAirTv: async () => {
    try {
      const response = await tmdbAPI.get("/tv/on_the_air");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  popularTv: async () => {
    try {
      const response = await tmdbAPI.get("/tv/popular");
      return response.data;
    } catch (error) {
      return error;
    }
  },
  topRatedTv: async () => {
    try {
      const response = await tmdbAPI.get("/tv/top_rated");
      return response.data;
    } catch (error) {
      return error;
    }
  },

  searchMovie: async (query: string) => {
    try {
      const response = await tmdbAPI.get("/search/movie?query=" + query);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  searchTv: async (query: string) => {
    try {
      const response = await tmdbAPI.get("/search/tv?query=" + query);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  trending: async (kind: "movie" | "tv", time: "day" | "week") => {
    try {
      const response = await tmdbAPI.get(`/trending/${kind}/${time}`);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  movie: async (id: string) => {
    try {
      const response = await tmdbAPI.get("/movie/" + id);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  tv: async (id: string) => {
    try {
      const response = await tmdbAPI.get("/tv/" + id);
      return response.data;
    } catch (error) {
      return error;
    }
  },
};
