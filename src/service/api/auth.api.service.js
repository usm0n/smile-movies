import { api } from "./api";

const auth = {
  registerUser: async (user) => {
    try {
      const response = await api.post("/users/register", user);
      return response;
    } catch (error) {
      return error;
    }
  },
  loginUser: async (user) => {
    try {
      const response = await api.post("/users/login", user);
      return response;
    } catch (error) {
      return error;
    }
  },
};

export default auth;
