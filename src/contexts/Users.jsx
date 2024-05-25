import { createContext, useContext, useEffect, useState } from "react";
import users from "../service/api/users.api.service";

const UsersContext = createContext({
  allUsers: {
    isLoading: false,
    isError: false,
    users: [],
  },
  statusDeleteAllUsers: {
    isLoading: false,
    isError: false,
    isSuccess: false,
  },
  deleteAllUsers: () => {},
});
UsersContext.displayName = "UsersContext";

export const useAllUsers = () => useContext(UsersContext);

const UsersProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState({
    isLoading: false,
    isError: false,
    users: [],
  });
  const [statusDeleteAllUsers, setStatusDeleteAllUsers] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
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

  const deleteAllUsers = async () => {
    setStatusDeleteAllUsers({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    await users
      .deleteAllUsers()
      .then(() => {
        setStatusDeleteAllUsers({
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
        setAllUsers({
          isLoading: false,
          isError: false,
          users: [],
        });
      })
      .catch((err) =>
        setStatusDeleteAllUsers({
          isLoading: false,
          isError: true,
          isSuccess: false,
        })
      );
  };

  useEffect(() => {
    getAllUsers();
  }, []);
  return (
    <UsersContext.Provider
      value={{ allUsers, deleteAllUsers, statusDeleteAllUsers }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;
