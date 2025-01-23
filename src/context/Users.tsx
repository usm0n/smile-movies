import { createContext, useContext } from "react";

const UsersContext = createContext({})

export const useUsers = () => useContext(UsersContext)

const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UsersContext.Provider value={{}}>
      {children}
    </UsersContext.Provider>
  )
}

export default UsersProvider