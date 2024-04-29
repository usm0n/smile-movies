import { createContext, useContext, useState } from "react";

const UserContext = createContext({
  isLoggedIn: false,
  isRealUser: {
    loading: false,
    result: false,
  },
  user: {},
  loginUser: () => {},
  registerUser: () => {},
  logoutUser: () => {},
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRealUser, setIsRealUser] = useState({
    loading: false,
    result: false,
  });
  const [user, setUser] = useState({});

  const loginUser = async (email, password) => {
    
  };

  const registerUser = async (email, password) => {
    setIsLoggedIn(true);
  };

  const logoutUser = async () => {
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        isRealUser,
        user,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
