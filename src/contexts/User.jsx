import { createContext, useContext, useEffect, useState } from "react";
import {
  currentDateTime,
  removeUserId,
  setLocalUserId,
  setSessionUserId,
  userId,
} from "../utilities/defaultFunctions";
import users from "../service/api/users.api.service";
import auth from "../service/api/auth.api.service";
import { useNavigate } from "react-router-dom";

const UserContext = createContext({
  isLoggedIn: false,
  isVerified: {
    loading: false,
    result: false,
  },
  isRealUser: {
    loading: false,
    result: false,
  },
  setStatusLogin: {
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
  },
  statusLogin: {
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
  },
  statusRegister: {
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
    isConflict: false,
    confirmPassword: false,
  },
  setStatusRegister: {
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
    isConflict: false,
    confirmPassword: false,
  },
  statusVerifyUser: {
    loading: false,
    isError: false,
    isIncorrect: false,
    isSuccess: false,
  },
  setStatusVerifyUser: {
    loading: false,
    isError: false,
    isIncorrect: false,
    isSuccess: false,
  },
  statusResendCode: {
    loading: false,
    isError: false,
    isSuccess: false,
  },
  statusLogout: {
    loading: false,
  },
  isAdmin: {
    loading: false,
    result: false,
  },
  statusGetUserByEmail: {
    loading: false,
    isError: false,
    isSuccess: false,
    result: {},
  },
  statusUpdateUserByEmail: {
    loading: false,
    isError: false,
    isSuccess: false,
  },
  user: {},
  resendToken: () => {},
  verifyUser: (token) => {},
  loginUser: (e, email, password, typeUserId) => {},
  registerUser: (e, firstname, email, password, cpassword, typeUserId) => {},
  logoutUser: () => {},
  getUserByEmail: (email) => {},
  updateUserByEmail: (email, value) => {},
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState({
    loading: false,
    result: false,
  });
  const [isAdmin, setIsAdmin] = useState({
    loading: false,
    result: false,
  });
  const [statusLogin, setStatusLogin] = useState({
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [statusRegister, setStatusRegister] = useState({
    isEmpty: false,
    confirmPassword: false,
    isConflict: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [statusLogout, setStatusLogout] = useState({
    loading: false,
  });
  const [isRealUser, setIsRealUser] = useState({
    loading: false,
    result: false,
  });
  const [statusVerifyUser, setStatusVerifyUser] = useState({
    loading: false,
    isError: false,
    isIncorrect: false,
    isSuccess: false,
  });
  const [statusResendCode, setStatusResendCode] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
  });
  const [statusGetUserByEmail, setStatusGetUserByEmail] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
    result: {},
  });
  const [statusUpdateUserByEmail, setStatusUpdateUserByEmail] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [user, setUser] = useState({});

  const loginUser = async (e, email, password, typeUserId) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatusLogin({
        isEmpty: true,
        buttonLoading: false,
        isSuccess: false,
        isError: false,
      });
    } else {
      setStatusLogin({
        isEmpty: false,
        buttonLoading: true,
        isSuccess: false,
        isError: false,
      });
      await auth.loginUser({ email, password }).then((res) => {
        if (res.data) {
          setStatusLogin({
            buttonLoading: false,
            isSuccess: true,
            isError: false,
          });
          setTimeout(() => {
            setIsLoggedIn(true);
            setUser(res.data.user);
            if (typeUserId == "local") {
              setLocalUserId(res.data.user._id);
            } else {
              setSessionUserId(res.data.user._id);
            }
            setIsRealUser({
              loading: false,
              result: true,
            });
            navigate("/");
            window.location.reload();
          }, 3000);
        } else {
          setStatusLogin({
            buttonLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
      });
    }
  };

  const registerUser = async (
    e,
    firstname,
    email,
    password,
    cpassword,
    typeUserId
  ) => {
    e.preventDefault();
    if (
      !firstname.trim() ||
      !email.trim() ||
      !password.trim() ||
      !cpassword.trim()
    ) {
      setStatusRegister({
        isEmpty: true,
        confirmPassword: false,
        buttonLoading: false,
        isSuccess: false,
        isError: false,
      });
    } else if (password !== cpassword) {
      setStatusRegister({
        isEmpty: false,
        confirmPassword: true,
        buttonLoading: false,
        isSuccess: false,
        isError: false,
      });
    } else {
      setStatusRegister({
        isEmpty: false,
        confirmPassword: false,
        buttonLoading: true,
        isSuccess: false,
        isError: false,
      });
      await auth
        .registerUser({ firstname, email, password })
        .then((res) => {
          if (res.response) {
            setStatusRegister({
              isConflict: true,
              buttonLoading: false,
              isSuccess: false,
              isError: false,
            });
          } else {
            if (res.data) {
              setStatusRegister({
                buttonLoading: false,
                isSuccess: true,
                isError: false,
              });
              setTimeout(() => {
                setIsVerified({
                  loading: false,
                  result: false,
                });
                if (typeUserId == "local") {
                  setLocalUserId(res.data.user._id);
                } else {
                  setSessionUserId(res.data.user._id);
                }
                setUser(res.data.user);
                window.location.reload();
              }, 2500);
            } else {
              setStatusRegister({
                buttonLoading: false,
                isSuccess: false,
                isError: true,
              });
            }
          }
        })
        .catch((err) => {
          setStatusRegister({
            buttonLoading: false,
            isSuccess: false,
            isError: true,
          });
        });
    }
  };

  const logoutUser = async () => {
    setStatusLogout({
      loading: true,
    });
    setTimeout(() => {
      setIsLoggedIn(false);
      setUser({});
      removeUserId();
      window.location.reload();
    }, 1500);
  };

  const verifyUser = async (token) => {
    setStatusVerifyUser({
      loading: true,
      isError: false,
      isSuccess: false,
      isIncorrect: false,
    });
    await users
      .verifyUser(userId, token)
      .then((res) => {
        if (res.data) {
          setStatusVerifyUser({
            loading: false,
            isError: false,
            isSuccess: true,
            isIncorrect: false,
          });
          setTimeout(() => {
            setIsVerified({
              loading: false,
              result: true,
            });
            window.location.reload();
          }, 2000);
        } else {
          setStatusVerifyUser({
            loading: false,
            isError: false,
            isSuccess: false,
            isIncorrect: true,
          });
        }
      })
      .catch(() => {
        setStatusVerifyUser({
          loading: false,
          isError: true,
          isSuccess: false,
          isIncorrect: false,
        });
      });
  };

  const resendToken = async () => {
    setStatusResendCode({
      loading: true,
      isSuccess: false,
      isError: false,
    });
    await users
      .resendToken(userId)
      .then((res) => {
        if (res.data) {
          setStatusResendCode({
            loading: false,
            isSuccess: true,
            isError: false,
          });
        } else {
          setStatusResendCode({
            loading: false,
            isSuccess: false,
            isError: true,
          });
        }
      })
      .catch(() => {
        setStatusResendCode({
          loading: false,
          isSuccess: false,
          isError: true,
        });
      });
  };

  const getUserByEmail = async (email) => {
    setStatusGetUserByEmail({
      loading: true,
      isError: false,
      isSuccess: false,
      result: {},
    });
    await users
      .getUserByEmail(email)
      .then((res) => {
        if (res.data) {
          setStatusGetUserByEmail({
            loading: false,
            isError: false,
            isSuccess: true,
            result: res.data,
          });
        } else {
          setStatusGetUserByEmail({
            loading: false,
            isError: true,
            isSuccess: false,
            result: {},
          });
        }
      })
      .catch(() => {
        setStatusGetUserByEmail({
          loading: false,
          isError: true,
          isSuccess: false,
          result: {},
        });
      });
  };

  const updateUserByEmail = async (email, value) => {
    setStatusUpdateUserByEmail({
      loading: true,
      isError: false,
      isSuccess: false,
    });
    await users
      .updateUserByEmail(email, value)
      .then((res) => {
        if (res.data) {
          setStatusUpdateUserByEmail({
            loading: false,
            isError: false,
            isSuccess: true,
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setStatusUpdateUserByEmail({
            loading: false,
            isError: true,
            isSuccess: false,
          });
        }
      })
      .catch(() => {
        setStatusUpdateUserByEmail({
          loading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
      setIsRealUser({
        loading: true,
        result: false,
      });
      setIsAdmin({
        loading: true,
        result: false,
      });
      users.getUserById(userId).then((user) => {
        if (user.data) {
          users.updateUserById(userId, { lastLogin: currentDateTime });
          setIsRealUser({
            loading: false,
            result: true,
          });
          setUser(user.data);
          if (user.data.isAdmin) {
            setIsAdmin({
              loading: false,
              result: true,
            });
          } else {
            setIsAdmin({
              loading: false,
              result: false,
            });
          }
          if (!user.data.isVerified) {
            setIsVerified(false);
          } else {
            setIsVerified(true);
          }
        } else {
          setIsRealUser({
            loading: false,
            result: false,
          });
        }
      });
    } else {
      setIsLoggedIn(false);
      setIsRealUser({
        loading: false,
        result: false,
      });
      setUser({});
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        isRealUser,
        isVerified,
        user,
        statusLogin,
        setStatusLogin,
        loginUser,
        registerUser,
        statusRegister,
        setStatusRegister,
        logoutUser,
        statusLogout,
        isAdmin,
        statusVerifyUser,
        verifyUser,
        setStatusVerifyUser,
        resendToken,
        statusResendCode,
        getUserByEmail,
        statusGetUserByEmail,
        statusUpdateUserByEmail,
        updateUserByEmail,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
