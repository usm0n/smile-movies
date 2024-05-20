import { createContext, useContext, useEffect, useState } from "react";
import users from "../service/api/users.api.service";

const UsersContext = createContext({
  allUsers: {
    isLoading: false,
    isError: false,
    users: [],
  },
});
UsersContext.displayName = "UsersContext";

export const useAllUsers = () => useContext(UsersContext);

const UsersProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState({
    isLoading: false,
    isError: false,
    users: [],
  });

  const getAllUsers = async () => {
    setAllUsers({
      isLoading: true,
      isError: false,
      users: [],
    });

    await users
      .getAllUsers()
      .then((result) =>
        setAllUsers({
          isLoading: false,
          isError: false,
          users: result.data,
        })
      )
      .catch((err) =>
        setAllUsers({ isLoading: false, users: [], isError: true })
      );
  };

  useEffect(() => {
    getAllUsers();
  }, []);
  return (
    <UsersContext.Provider value={{ allUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;
