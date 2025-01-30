import { tmdbAPI } from "../api";

export const tmdb = {
  discover: async (kind: "movie" | "tv", page: number) => {
    try {
      const response = await tmdbAPI.get("/discover/" + kind + "?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  nowPlayingMovies: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/movie/now_playing?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  popularMovies: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/movie/popular?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  topRatedMovies: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/movie/top_rated?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  upcomingMovies: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/movie/upcoming?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  airingTodayTv: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/tv/airing_today?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  onTheAirTv: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/tv/on_the_air?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  popularTv: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/tv/popular?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },
  topRatedTv: async (page: number) => {
    try {
      const response = await tmdbAPI.get("/tv/top_rated?page=" + page);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  searchMovie: async (query: string, page: number) => {
    try {
      const response = await tmdbAPI.get(
        "/search/movie?query=" + query + "&page=" + page
      );
      return response.data;
    } catch (error) {
      return error;
    }
  },
  searchTv: async (query: string, page: number) => {
    try {
      const response = await tmdbAPI.get(
        "/search/tv?query=" + query + "&page=" + page
      );
      return response.data;
    } catch (error) {
      return error;
    }
  },

  trending: async (
    kind: "movie" | "tv" | "all",
    time: "day" | "week",
    page: number
  ) => {
    try {
      const response = await tmdbAPI.get(
        `/trending/${kind}/${time}?page=${page}`
      );
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
