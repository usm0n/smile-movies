import { createContext, useContext, useEffect, useState } from "react";
import * as userType from "../user";
import { users } from "../service/api/smb/users.api.service";
import {
  deviceId,
  isLoggedIn,
  reload,
  setIsLoggedIn,
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
  addDeviceData: null as userType.ResponseType | null,
  deleteDeviceData: null as userType.ResponseType | null,
  signedInWithGoogle: null as boolean | null,
  isVerified: null as boolean | null,
  logoutData: null as userType.ResponseType | null,
  activateDeviceData: null as userType.ResponseType | null,
  requestActivateDeviceData: null as userType.ResponseType | null,
  verifyDeviceData: null as userType.ResponseType | null,
  setIsVerified: (_isVerified: boolean) => {},
  getUsers: async () => {},
  getUserById: async (_id: string) => {},
  getUserByEmail: async (_email: string) => {},
  getMyself: async () => {},
  updateUserById: async (_id: string, _user: userType.User) => {},
  updateUserByEmail: async (_email: string, _user: userType.User) => {},
  updateMyself: async (_user: userType.User) => {},
  deleteUserById: async (_id: string) => {},
  deleteUserByEmail: async (_email: string) => {},
  deleteMyself: async () => {},
  register: async (_user: userType.UserRegister) => {},
  login: async (
    _user: userType.UserLogin,
    _type: "email" | "google",
    _registerUser?: userType.UserRegister,
  ) => {},
  logout: () => {},
  verify: async (_token: string) => {},
  resendTokenVerification: async (_email: string) => {},
  forgotPassword: async (_email: string) => {},
  resendForgotPasswordToken: async (_email: string) => {},
  resetPassword: async (
    _email: string,
    _token: string,
    _password: string,
  ) => {},
  addToWatchlist: async (
    _type: string,
    _id: string,
    _poster: string,
    _status: string,
    _duration: number,
    _currentTime: number,
    _season: number,
    _episode: number,
  ) => {},
  removeFromWatchlist: async (_type: string, _id: string) => {},
  addDevice: async (
    _deviceId: string,
    _deviceName: string,
    _deviceType: string,
  ) => {},
  deleteDevice: async (_deviceId: string) => {},
  activateDevice: async (_deviceId: string) => {},
  requestActivateDevice: async (_email: string, _deviceId: string) => {},
  verifyDevice: async (_email: string, _deviceId: string, _token: string) => {},
});

export const useUsers = () => useContext(UsersContext);

const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [usersData, setUsersData] = useState<userType.ResponseType | null>(
    null,
  );
  const [userByIdData, setUserByIdData] =
    useState<userType.ResponseType | null>(null);
  const [userByEmailData, setUserByEmailData] =
    useState<userType.ResponseType | null>(null);
  const [myselfData, setMyselfData] = useState<userType.ResponseType | null>(
    null,
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
    null,
  );
  const [logoutData, setLogoutData] = useState<userType.ResponseType | null>(
    null,
  );
  const [verifyData, setVerifyData] = useState<userType.ResponseType | null>(
    null,
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
  const [addDeviceData, setAddDeviceData] =
    useState<userType.ResponseType | null>(null);
  const [deleteDeviceData, setDeleteDeviceData] =
    useState<userType.ResponseType | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [activateDeviceData, setActivateDeviceData] =
    useState<userType.ResponseType | null>(null);
  const [requestActivateDeviceData, setRequestActivateDeviceData] =
    useState<userType.ResponseType | null>(null);
  const [verifyDeviceData, setVerifyDeviceData] =
    useState<userType.ResponseType | null>(null);

  const getUsers = async () => {
    setUsersData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.getAll();
      setUsersData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setUsersData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const getUserById = async (id: string) => {
    setUserByIdData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.getById(id);
      setUserByIdData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setUserByIdData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const getUserByEmail = async (email: string) => {
    setUserByEmailData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.getByEmail(email);
      if (response) {
        setUserByEmailData({
          isLoading: false,
          isError: false,
          isSuccess: true,
          data: response.data,
          code: response.status,
        });
      }
    } catch (error: unknown) {
      setUserByEmailData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const getMyself = async () => {
    setMyselfData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.getMyself();
      setMyselfData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      setIsLoggedIn(true);
    } catch (error: unknown) {
      setMyselfData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const updateUserById = async (id: string, user: userType.User) => {
    setUpdatedUserByIdData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.updateById(id, user);
      setUpdatedUserByIdData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setUpdatedUserByIdData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const updateUserByEmail = async (email: string, user: userType.User) => {
    setUpdatedUserByEmailData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.updateByEmail(email, user);
      setUpdatedUserByEmailData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setUpdatedUserByEmailData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const updateMyself = async (user: userType.User) => {
    setUpdatedMyselfData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.updateMyself(user);
      setUpdatedMyselfData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      getMyself();
    } catch (error: unknown) {
      setUpdatedMyselfData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const deleteUserById = async (id: string) => {
    setDeletedUserByIdData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.deleteById(id);
      setDeletedUserByIdData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setDeletedUserByIdData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const deleteUserByEmail = async (email: string) => {
    setDeletedUserByEmailData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.deleteByEmail(email);
      setDeletedUserByEmailData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setDeletedUserByEmailData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const deleteMyself = async () => {
    setDeletedMyselfData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.deleteMyself();
      setDeletedMyselfData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setDeletedMyselfData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const register = async (user: userType.UserRegister) => {
    setRegisterData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.register(user);
      setRegisterData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      reload();
    } catch (error: unknown) {
      setRegisterData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const login = async (
    user: userType.UserLogin,
    _type: "email" | "google",
    _registerUser?: userType.UserRegister,
  ) => {
    setLoginData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.login(user);
      setLoginData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      reload();
    } catch (error: unknown) {
      setLoginData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const logout = async () => {
    setLogoutData((prev) => ({ ...prev, isLoading: true }));
    try {
      deleteDevice(deviceId());
      const response = await users.logout();
      setLogoutData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      reload();
    } catch (error: unknown) {
      setLogoutData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const signedInWithGoogle = (myselfData?.data as userType.User)?.profilePic
    ? true
    : false;

  const verify = async (token: string) => {
    setVerifyData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.verify(token);
      setVerifyData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setVerifyData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const resendTokenVerification = async () => {
    setResendTokenVerificationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.resendTokenVerification();
      setResendTokenVerificationData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setResendTokenVerificationData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };
  const forgotPassword = async (email: string) => {
    setForgotPasswordData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.forgotPassword(email);
      setForgotPasswordData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setForgotPasswordData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const resendForgotPasswordToken = async (email: string) => {
    setResendForgotPasswordData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.resendForgotPasswordToken(email);
      setResendForgotPasswordData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setResendForgotPasswordData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const resetPassword = async (
    email: string,
    token: string,
    password: string,
  ) => {
    setResetPasswordData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.resetPassword(email, token, password);
      setResetPasswordData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setResetPasswordData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const addToWatchlist = async (
    type: string,
    id: string,
    poster: string,
    status: string,
    duration: number,
    currentTime: number,
    season: number,
    episode: number,
  ) => {
    setAddToWatchlistData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.addToWatchlist(
        type,
        id,
        poster,
        status,
        duration,
        currentTime,
        season,
        episode,
      );
      setAddToWatchlistData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      getMyself();
    } catch (error: unknown) {
      setAddToWatchlistData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const removeFromWatchlist = async (type: string, id: string) => {
    setRemoveFromWatchlistData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.removeFromWatchlist(type, id);
      setRemoveFromWatchlistData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
      getMyself();
    } catch (error: unknown) {
      setRemoveFromWatchlistData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const addDevice = async (
    deviceId: string,
    deviceType: string,
    deviceName: string,
  ) => {
    setAddDeviceData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.addDevice(deviceId, deviceType, deviceName);
      setAddDeviceData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setAddDeviceData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const deleteDevice = async (deviceId: string) => {
    setDeleteDeviceData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.deleteDevice(deviceId);
      setDeleteDeviceData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error: unknown) {
      setDeleteDeviceData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const activateDevice = async (deviceId: string) => {
    setActivateDeviceData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.activateDevice(deviceId);
      setActivateDeviceData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error) {
      setActivateDeviceData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const requestActivateDevice = async (email: string, deviceId: string) => {
    setRequestActivateDeviceData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.requestActivateDevice(email, deviceId);
      setRequestActivateDeviceData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error) {
      setRequestActivateDeviceData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  const verifyDevice = async (
    email: string,
    deviceId: string,
    token: string,
  ) => {
    setVerifyDeviceData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await users.verifyDevice(email, deviceId, token);
      setVerifyDeviceData({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: response.data,
        code: response.status,
      });
    } catch (error) {
      setVerifyDeviceData({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: (error as userType.ErrorResponse)?.data,
        code: (error as userType.ErrorResponse)?.status,
      });
    }
  };

  useEffect(() => {
    getMyself();
  }, []);
  useEffect(() => {
  let intervalId: any;

  if (isLoggedIn && myselfData) {
    const user = myselfData.data as userType.User

    const hasDevices = user?.devices?.length > 0;
    const deviceExists = user?.devices?.some(d => d.deviceId === deviceId());

    if (!hasDevices || !deviceExists) {
      logout();
    } else {
      setIsVerified(!!user?.isVerified);

      intervalId = setInterval(() => {
        users?.lastLogin(deviceId());
      }, 60000);
    }
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [isLoggedIn, myselfData]);
  return (
    <UsersContext.Provider
      value={{
        activateDevice,
        activateDeviceData,
        requestActivateDevice,
        requestActivateDeviceData,
        verifyDevice,
        verifyDeviceData,
        logoutData,
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
        addToWatchlist,
        addToWatchlistData,
        removeFromWatchlist,
        removeFromWatchlistData,
        addDevice,
        addDeviceData,
        deleteDevice,
        deleteDeviceData,
        setIsVerified,
        isVerified,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;
