import axios from "axios";

const api = axios.create({
  baseURL: "https://smile-movies-project.onrender.com",
});

const users = {
  getAllUsers: async () => {
    try {
      const response = await api.get("/users");
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  getUserById: async (id) => {
    try {
      const response = await api.get("/users/id/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  getUserByEmail: async (email) => {
    try {
      const response = await api.get("/users/email/" + email);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  updateUserById: async (id, data) => {
    try {
      const response = await api.put("/users/id/" + id, data);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  updateUserByEmail: async (email, data) => {
    try {
      const response = await api.put("/users/email/" + email, data);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  deleteUserById: async (id) => {
    try {
      const response = await api.delete("/users/id/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  deleteUserByEmail: async (email) => {
    try {
      const response = await api.delete("/users/email/" + email);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  verifyUser: async (id, token) => {
    try {
      const response = await api.get("/users/" + id + "/verify/" + token);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  
  deleteVerifyTokenByUserId: async (id) => {
    try {
      const response = await api.delete("/users/deletetoken/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  resendToken: async (id) => {
    try {
      const response = await api.post("/users/resendtoken/" + id);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getFavourites: async (userId) => {
    try {
      const response = await api.get("/users/" + userId + "/favourites");
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  addMovieToFavourites: async (userId, movieId) => {
    try {
      const response = await api.post("/users/" + userId + "/amtf/" + movieId);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  removeMovieFromFavourites: async (userId, favMovieId) => {
    try {
      const response = await api.delete(
        "/users/" + userId + "/rmff/" + favMovieId
      );
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getWatchLater: async (userId) => {
    try {
      const response = await api.get("/users/" + userId + "/watchlater");
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  addMovieToWatchLater: async (userId, movieId) => {
    try {
      const response = await api.post("/users/" + userId + "/wlm/" + movieId);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  removeMovieFromWatchLater: async (userId, wlmId) => {
    try {
      const response = await api.delete("/users/" + userId + "/rmwl/" + wlmId);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  givePremium: async (email) => {
    try {
      const response = await api.post("/users/givepremium/" + email);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  cancelPremium: async (email) => {
    try {
      const response = await api.post("/users/cancelpremium/" + email);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};

export default users;