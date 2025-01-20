import { CatchError, Message, TokenResponse, User } from "../../../user-res";
import { smbAPI } from "../api";

export const users = {
  getAll: async () => {
    try {
      const response = await smbAPI.get("/users");
      return response.data as User[] | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await smbAPI.get(`/users/id/${id}`);
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  getByEmail: async (email: string) => {
    try {
      const response = await smbAPI.get(`/users/email/${email}`);
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  getMyself: async () => {
    try {
      const response = await smbAPI.get("/users/myself");
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  updateById: async (id: string, user: User) => {
    try {
      const response = await smbAPI.put(`/users/id/${id}`, user);
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  updateByEmail: async (email: string, user: User) => {
    try {
      const response = await smbAPI.put(`/users/email/${email}`, user);
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  updateMyself: async (user: User) => {
    try {
      const response = await smbAPI.put("/users/myself", user);
      return response.data as User | Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  deleteById: async (id: string) => {
    try {
      const response = await smbAPI.delete(`/users/id/${id}`);
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  deleteByEmail: async (email: string) => {
    try {
      const response = await smbAPI.delete(`/users/email/${email}`);
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  deleteMyself: async () => {
    try {
      const response = await smbAPI.delete("/users/myself");
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  register: async (user: User) => {
    try {
      const response = await smbAPI.post("/users/reigster", user);
      return response.data as Message | TokenResponse;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  login: async (user: User) => {
    try {
      const response = await smbAPI.post("/users/login", user);
      return response.data as TokenResponse;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  verify: async (token: string) => {
    try {
      const response = await smbAPI.post("/users/verify" + token);
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  resendTokenVerification: async () => {
    try {
      const response = await smbAPI.post("/users/resendVericationToken");
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  forgotPassword: async (email: string) => {
    try {
      const response = await smbAPI.post("/users/forgotPassword", { email });
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  resendForgotPasswordToken: async (email: string) => {
    try {
      const response = await smbAPI.post(
        "/users/resendForgotPasswordToken",
        email
      );
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
  resetPassword: async (email: string, token: string, password: string) => {
    try {
      const response = await smbAPI.post(
        "/users/resetPassword" + email + token,
        { password }
      );
      return response.data as Message;
    } catch (error: any) {
      return error.response.data as CatchError;
    }
  },
};
