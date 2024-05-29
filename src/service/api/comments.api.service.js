import axios from "axios";

const api = axios.create({
  baseURL: "https://smile-movies-project.onrender.com",
});

const comments = {
  getComments: async (movieId) => {
    try {
      const response = await api.get("/movies/" + movieId + "/comments");
      return response;
    } catch (error) {
      return error;
    }
  },

  getComment: async (movieId, commentId) => {
    try {
      const response = await api.get(
        "/movies/" + movieId + "/comment/" + commentId
      );
      return response;
    } catch (error) {
      return error;
    }
  },

  postComment: async (movieId, data) => {
    try {
      const response = await api.post(
        "/movies/" + movieId + "/postComment",
        data
      );
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteComment: async (movieId, commentId) => {
    try {
      const response = await api.delete(
        "/movies/" + movieId + "/deleteComment/" + commentId
      );
      return response;
    } catch (error) {
      return error;
    }
  },

  updateComment: async (movieId, commentId, data) => {
    try {
      const response = await api.put(
        "/movies/" + movieId + "/updateComment/" + commentId,
        data
      );
      return response;
    } catch (error) {
      return error;
    }
  },
};

export default comments;
