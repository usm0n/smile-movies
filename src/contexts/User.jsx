import { createContext, useContext, useEffect, useState } from "react";
import { removeUserId, setUserId, userId } from "../utilities/defaultFunctions";
import users from "../service/api/users.api.service";
import auth from "../service/api/auth.api.service";
import { useNavigate } from "react-router-dom";

const UserContext = createContext({
  isLoggedIn: false,
  isVerified: false,
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
  statusLogout: {
    loading: false,
  },
  user: {},
  loginUser: (e, email, password) => {},
  registerUser: () => {},
  logoutUser: () => {},
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [statusLogin, setStatusLogin] = useState({
    isEmpty: false,
    buttonLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [statusRegister, setStatusRegister] = useState({
    isEmpty: false,
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
  const [user, setUser] = useState({});

  const loginUser = async (e, email, password) => {
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
          if (res.data.message == "Login successful") {
            setStatusLogin({
              buttonLoading: false,
              isSuccess: true,
              isError: false,
            });
            setTimeout(() => {
              setIsLoggedIn(true);
              setUser(res.data.user);
              setUserId(res.data.user._id);
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
              isError: false,
            });
            setIsVerified(false);
          }
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

  const registerUser = async (firstname, email, password, cpassword) => {};

  const logoutUser = async () => {
    setStatusLogout({
      loading: true,
    });
    setTimeout(() => {
      setIsLoggedIn(false);
      setUser({});
      removeUserId();
      window.location.reload();
    }, 2000);
  };

  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
      setIsRealUser({
        loading: true,
        result: false,
      });
      users.getUserById(userId).then((user) => {
        if (user.data) {
          setIsRealUser({
            loading: false,
            result: true,
          });
          setUser(user.data);
          if (!user.data.isVerified) {
            setIsVerified(false);
            navigate("/verify-email");
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
        logoutUser,
        statusLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
