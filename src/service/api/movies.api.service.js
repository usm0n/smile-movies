import { api } from "./api";

const movies = {
  getAllMovies: async () => {
    try {
      const response = await api.get("/movies");
      return response;
    } catch (error) {
      return error;
    }
  },

  getMovieById: async (id) => {
    try {
      const response = await api.get("/movies/id/" + id);
      return response;
    } catch (error) {
      return error;
    }
  },

  updateMovieById: async (id, data) => {
    try {
      const response = await api.put("/movies/id/" + id, data);
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteMovieById: async (id) => {
    try {
      const response = await api.delete("/movies/id/" + id);
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteAllMovies: async () => {
    try {
      const response = await api.delete("/movies");
      return response;
    } catch (error) {
      return error;
    }
  },

  createMovie: async (data) => {
    try {
      const response = await api.post("/movies", data);
      return response;
    } catch (error) {
      return error;
    }
  },
};

export default movies;
