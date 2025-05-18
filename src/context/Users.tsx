import { createContext, useContext, useEffect, useState } from "react";
import * as userType from "../user";
import { users } from "../service/api/smb/users.api.service";
import {
  deleteCookie,
  deviceId,
  isLoggedIn,
  setCookie,
} from "../utilities/defaults";

const UsersContext = createContext({
  usersData: null as userType.ResponseType | null,
  userByIdData: null as userType.ResponseType | null,
  userByEmailData: null as userType.ResponseType | null,
  myselfData: null as userType.ResponseType | null,
  updatedUserByIdData: null as userType.ResponseType | null,
  updatedUserByEmailData: null as userType.ResponseType | null,
  updatedMyselfData: null as userType.ResponseType | null,
  deletedUserByIdData: null as userType.ResponseType | null,
  deletedUserByEmailData: null as userType.ResponseType | null,
  deletedMyselfData: null as userType.ResponseType | null,
  registerData: null as userType.ResponseType | null,
  loginData: null as userType.ResponseType | null,
  verifyData: null as userType.ResponseType | null,
  resendTokenVerificationData: null as userType.ResponseType | null,
  forgotPasswordData: null as userType.ResponseType | null,
  resendForgotPasswordData: null as userType.ResponseType | null,
  resetPasswordData: null as userType.ResponseType | null,
  addToWatchlistData: null as userType.ResponseType | null,
  removeFromWatchlistData: null as userType.ResponseType | null,
  addToFavoritesData: null as userType.ResponseType | null,
  removeFromFavoritesData: null as userType.ResponseType | null,
  addToRecentlyWatchedData: null as userType.ResponseType | null,
  removeFromRecentlyWatchedData: null as userType.ResponseType | null,
  addDeviceData: null as userType.ResponseType | null,
  deleteDeviceData: null as userType.ResponseType | null,
  signedInWithGoogle: null as boolean | null,
  getUsers: async () => {},
  getUserById: async (id: string) => {
    id;
  },
  getUserByEmail: async (email: string) => {
    email;
  },
  getMyself: async () => {},
  updateUserById: async (id: string, user: userType.User) => {
    id;
    user;
  },
  updateUserByEmail: async (email: string, user: userType.User) => {
    email;
    user;
  },
  updateMyself: async (user: userType.User) => {
    user;
  },
  deleteUserById: async (id: string) => {
    id;
  },
  deleteUserByEmail: async (email: string) => {
    email;
  },
  deleteMyself: async () => {},
  register: async (user: userType.UserRegister) => {
    user;
  },
  login: async (
    user: userType.UserLogin,
    type: "email" | "google",
    registerUser?: userType.UserRegister
  ) => {
    user;
    type;
    registerUser;
  },
  logout: () => {},
  verify: async (token: string) => {
    token;
  },
  resendTokenVerification: async (email: string) => {
    email;
  },
  forgotPassword: async (email: string) => {
    email;
  },
  resendForgotPasswordToken: async (email: string) => {
    email;
  },
  resetPassword: async (email: string, token: string, password: string) => {
    email;
    token;
    password;
  },
  addToWatchlist: async (type: string, id: string, poster: string) => {
    type;
    id;
    poster;
  },
  removeFromWatchlist: async (type: string, id: string) => {
    type;
    id;
  },
  addToFavorites: async (type: string, id: string, poster: string) => {
    type;
    id;
    poster;
  },
  removeFromFavorites: async (type: string, id: string) => {
    type;
    id;
  },
  addToRecentlyWatched: async (type: string, id: string, poster: string) => {
    type;
    id;
    poster;
  },
  removeFromRecentlyWatched: async (type: string, id: string) => {
    type;
    id;
  },
  addDevice: async (
    deviceId: string,
    deviceName: string,
    deviceType: string
  ) => {
    deviceId;
    deviceName;
    deviceType;
  },
  deleteDevice: async (deviceId: string) => {
    deviceId;
  },
});

export const useUsers = () => useContext(UsersContext);

const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [usersData, setUsersData] = useState<userType.ResponseType | null>(
    null
  );
  const [userByIdData, setUserByIdData] =
    useState<userType.ResponseType | null>(null);
  const [userByEmailData, setUserByEmailData] =
    useState<userType.ResponseType | null>(null);
  const [myselfData, setMyselfData] = useState<userType.ResponseType | null>(
    null
  );
  const [updatedUserByIdData, setUpdatedUserByIdData] =
    useState<userType.ResponseType | null>(null);
  const [updatedUserByEmailData, setUpdatedUserByEmailData] =
    useState<userType.ResponseType | null>(null);
  const [updatedMyselfData, setUpdatedMyselfData] =
    useState<userType.ResponseType | null>(null);
  const [deletedUserByIdData, setDeletedUserByIdData] =
    useState<userType.ResponseType | null>(null);
  const [deletedUserByEmailData, setDeletedUserByEmailData] =
    useState<userType.ResponseType | null>(null);
  const [deletedMyselfData, setDeletedMyselfData] =
    useState<userType.ResponseType | null>(null);
  const [registerData, setRegisterData] =
    useState<userType.ResponseType | null>(null);
  const [loginData, setLoginData] = useState<userType.ResponseType | null>(
    null
  );
  const [verifyData, setVerifyData] = useState<userType.ResponseType | null>(
    null
  );
  const [resendTokenVerificationData, setResendTokenVerificationData] =
    useState<userType.ResponseType | null>(null);
  const [forgotPasswordData, setForgotPasswordData] =
    useState<userType.ResponseType | null>(null);
  const [resendForgotPasswordData, setResendForgotPasswordData] =
    useState<userType.ResponseType | null>(null);
  const [resetPasswordData, setResetPasswordData] =
    useState<userType.ResponseType | null>(null);
  const [addToWatchlistData, setAddToWatchlistData] =
    useState<userType.ResponseType | null>(null);
  const [removeFromWatchlistData, setRemoveFromWatchlistData] =
    useState<userType.ResponseType | null>(null);
  const [addToFavoritesData, setAddToFavoritesData] =
    useState<userType.ResponseType | null>(null);
  const [removeFromFavoritesData, setRemoveFromFavoritesData] =
    useState<userType.ResponseType | null>(null);
  const [addToRecentlyWatchedData, setAddToRecentlyWatchedData] =
    useState<userType.ResponseType | null>(null);
  const [removeFromRecentlyWatchedData, setRemoveFromRecentlyWatchedData] =
    useState<userType.ResponseType | null>(null);
  const [addDeviceData, setAddDeviceData] =
    useState<userType.ResponseType | null>(null);
  const [deleteDeviceData, setDeleteDeviceData] =
    useState<userType.ResponseType | null>(null);
  const getUsers = async () => {
    try {
      setUsersData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.getAll();
      if (response) {
        setUsersData({
          isLoading: false,
          isError: false,
          data: response as userType.User[],
          errorResponse: null,
        });
      }
    } catch (error) {
      setUsersData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const getUserById = async (id: string) => {
    try {
      setUserByIdData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.getById(id);
      setUserByIdData({
        isLoading: false,
        isError: false,
        data: response as userType.User,
        errorResponse: null,
      });
    } catch (error) {
      setUserByIdData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const getUserByEmail = async (email: string) => {
    try {
      setUserByEmailData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.getByEmail(email);
      if (response) {
        setUserByEmailData({
          isLoading: false,
          isError: false,
          data: response as userType.User,
          errorResponse: null,
        });
      }
    } catch (error) {
      setUserByEmailData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const getMyself = async () => {
    try {
      setMyselfData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.getMyself();
      if (response) {
        setMyselfData({
          isLoading: false,
          isError: false,
          data: response as userType.User,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMyselfData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const updateUserById = async (id: string, user: userType.User) => {
    try {
      setUpdatedUserByIdData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.updateById(id, user);
      if (response) {
        setUpdatedUserByIdData({
          isLoading: false,
          isError: false,
          data: response as userType.User,
          errorResponse: null,
        });
      }
    } catch (error) {
      setUpdatedUserByIdData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const updateUserByEmail = async (email: string, user: userType.User) => {
    try {
      setUpdatedUserByEmailData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.updateByEmail(email, user);
      if (response) {
        setUpdatedUserByEmailData({
          isLoading: false,
          isError: false,
          data: response as userType.User,
          errorResponse: null,
        });
      }
    } catch (error) {
      setUpdatedUserByEmailData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const updateMyself = async (user: userType.User) => {
    try {
      setUpdatedMyselfData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.updateMyself(user);
      if (!("message" in response)) {
        setUpdatedMyselfData({
          isLoading: false,
          isError: false,
          data: response as userType.User,
          errorResponse: null,
        });
        getMyself();
      } else {
        setUpdatedMyselfData({
          isLoading: false,
          isError: false,
          data: null,
          errorResponse: response,
          isConflict: true,
        });
      }
    } catch (error) {
      setUpdatedMyselfData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const deleteUserById = async (id: string) => {
    try {
      setDeletedUserByIdData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.deleteById(id);
      if (response) {
        setDeletedUserByIdData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDeletedUserByIdData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const deleteUserByEmail = async (email: string) => {
    try {
      setDeletedUserByEmailData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.deleteByEmail(email);
      if (response) {
        setDeletedUserByEmailData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDeletedUserByEmailData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const deleteMyself = async () => {
    try {
      setDeletedMyselfData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.deleteMyself();
      if (response) {
        setDeletedMyselfData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDeletedMyselfData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const register = async (user: userType.UserRegister) => {
    try {
      setRegisterData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.register(user);

      if (!("message" in response)) {
        setRegisterData({
          isLoading: false,
          isError: false,
          data: response as userType.TokenResponse,
          errorResponse: null,
        });
        if ("token" in response) {
          setCookie("authToken", response.token);
        }
      } else {
        setRegisterData({
          isLoading: false,
          isError: true,
          data: null,
          errorResponse: response,
          isSuccess: false,
          isConflict: true,
        });
      }
    } catch (error) {
      setRegisterData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const login = async (
    user: userType.UserLogin,
    type: "email" | "google",
    registerUser?: userType.UserRegister
  ) => {
    setLoginData({
      isLoading: true,
      isError: false,
      data: null,
      errorResponse: null,
    });
    try {
      const response = await users.login(user);

      if (!("message" in response)) {
        setLoginData({
          isLoading: false,
          isError: false,
          data: response as userType.TokenResponse,
          errorResponse: null,
          isSuccess: true,
        });

        if ("token" in response) {
          setCookie("authToken", response.token);
        }
      } else {
        if (type == "google") {
          setLoginData({
            isLoading: false,
            isError: true,
            data: null,
            errorResponse: "Invalid email or password",
            isSuccess: false,
            isIncorrect: false,
          });
          register(registerUser as userType.UserRegister);
        } else {
          setLoginData({
            isLoading: false,
            isError: true,
            data: null,
            errorResponse: "Invalid email or password",
            isSuccess: false,
            isIncorrect: true,
          });
        }
      }
    } catch (error) {
      setLoginData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const logout = () => {
    deleteDevice(deviceId()).then(() => {
      deleteCookie("authToken");
    });
  };

  const signedInWithGoogle = (myselfData?.data as userType.User)?.profilePic
    ? true
    : false;

  const verify = async (token: string) => {
    try {
      setVerifyData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.verify(token);
      if (response) {
        setVerifyData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setVerifyData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const resendTokenVerification = async () => {
    try {
      setResendTokenVerificationData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.resendTokenVerification();
      if (response) {
        setResendTokenVerificationData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setResendTokenVerificationData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const forgotPassword = async (email: string) => {
    try {
      setForgotPasswordData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.forgotPassword(email);
      if (response) {
        setForgotPasswordData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setForgotPasswordData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const resendForgotPasswordToken = async (email: string) => {
    try {
      setResendForgotPasswordData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.resendForgotPasswordToken(email);
      if (response) {
        setResendForgotPasswordData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setResendForgotPasswordData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const resetPassword = async (
    email: string,
    token: string,
    password: string
  ) => {
    try {
      setResetPasswordData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.resetPassword(email, token, password);
      if (response) {
        setResetPasswordData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setResetPasswordData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const addToWatchlist = async (type: string, id: string, poster: string) => {
    try {
      setAddToWatchlistData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.addToWatchlist(type, id, poster);
      if (response) {
        setAddToWatchlistData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setAddToWatchlistData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const removeFromWatchlist = async (type: string, id: string) => {
    try {
      setRemoveFromWatchlistData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.removeFromWatchlist(type, id);
      if (response) {
        setRemoveFromWatchlistData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setRemoveFromWatchlistData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const addToFavorites = async (type: string, id: string, poster: string) => {
    try {
      setAddToFavoritesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.addToFavorites(type, id, poster);
      if (response) {
        setAddToFavoritesData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setAddToFavoritesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const removeFromFavorites = async (type: string, id: string) => {
    try {
      setRemoveFromFavoritesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.removeFromFavorites(type, id);
      if (response) {
        setRemoveFromFavoritesData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setRemoveFromFavoritesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const addToRecentlyWatched = async (
    type: string,
    id: string,
    poster: string
  ) => {
    try {
      setAddToRecentlyWatchedData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.addToRecentlyWatched(type, id, poster);
      if (response) {
        setAddToRecentlyWatchedData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setAddToRecentlyWatchedData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const removeFromRecentlyWatched = async (type: string, id: string) => {
    try {
      setRemoveFromRecentlyWatchedData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.removeFromRecentlyWatched(type, id);
      if (response) {
        setRemoveFromRecentlyWatchedData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setRemoveFromRecentlyWatchedData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const addDevice = async (
    deviceId: string,
    deviceType: string,
    deviceName: string
  ) => {
    try {
      setAddDeviceData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.addDevice(deviceId, deviceType, deviceName);
      if (response) {
        setAddDeviceData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setAddDeviceData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      setDeleteDeviceData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await users.deleteDevice(deviceId);
      if (response) {
        setDeleteDeviceData({
          isLoading: false,
          isError: false,
          data: response as userType.Message,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDeleteDeviceData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getMyself();
    }
  }, [isLoggedIn]);
  useEffect(() => {
    if (isLoggedIn) {
      if (
        (myselfData?.data as userType.User)?.devices?.length === 0 ||
        (myselfData?.data as userType.User)?.devices?.filter(
          (device: userType.Device) => device?.deviceId === deviceId()
        ).length === 0
      ) {
        logout();
      } else {
        setInterval(() => {
          users?.lastLogin(deviceId());
        }, 60000);
      }
    }
  }, [isLoggedIn, myselfData]);
  return (
    <UsersContext.Provider
      value={{
        signedInWithGoogle,
        usersData,
        userByIdData,
        verifyData,
        resendTokenVerificationData,
        forgotPasswordData,
        resendForgotPasswordData,
        resetPasswordData,
        deletedMyselfData,
        deletedUserByEmailData,
        deletedUserByIdData,
        deleteMyself,
        deleteUserByEmail,
        deleteUserById,
        forgotPassword,
        getMyself,
        getUserByEmail,
        getUserById,
        getUsers,
        login,
        loginData,
        logout,
        myselfData,
        register,
        registerData,
        resendForgotPasswordToken,
        resendTokenVerification,
        resetPassword,
        updatedMyselfData,
        updatedUserByEmailData,
        updatedUserByIdData,
        updateMyself,
        updateUserByEmail,
        updateUserById,
        userByEmailData,
        verify,
        addToFavorites,
        addToFavoritesData,
        addToWatchlist,
        addToWatchlistData,
        removeFromFavorites,
        removeFromFavoritesData,
        removeFromWatchlist,
        removeFromWatchlistData,
        addDevice,
        addDeviceData,
        addToRecentlyWatched,
        addToRecentlyWatchedData,
        deleteDevice,
        deleteDeviceData,
        removeFromRecentlyWatched,
        removeFromRecentlyWatchedData,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;
