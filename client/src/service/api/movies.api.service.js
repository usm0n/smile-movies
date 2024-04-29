import axios from "axios";

const api = axios.create({
  baseURL: "https://smile-movies-project.onrender.com",
});

const movies = {
  getAllMovies: async () => {
    try {
      const response = await api.get("/movies");
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getMovieById: async (id) => {
    try {
      const response = await api.get("/movies/id/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  updateMovieById: async (id, data) => {
    try {
      const response = await api.put("/movies/id/" + id, data);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  deleteMovieById: async (id) => {
    try {
      const response = await api.delete("/movies/id/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  deleteAllMovies: async () => {
    try {
      const response = await api.delete("/movies");
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  createMovie: async (data) => {
    try {
      const response = await api.post("/movies", data);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  postComment: async (movieId, userId, comment) => {
    try {
      const response = await api.post(
        "/movies/" + movieId + "/commentAs" + userId,
        comment
      );
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  deleteComment: async (movieId, commentId) => {
    try {
      const response = await api.delete(
        "/movies/" + movieId + "/comment/" + commentId
      );
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};

export default movies;
