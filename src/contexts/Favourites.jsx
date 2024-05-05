import { createContext, useContext } from "react";

const FavouritesContext = createContext({});

export const useFavourites = useContext(FavouritesContext);

const FavouritesProvider = ({ children }) => {
  return (
    <FavouritesContext.Provider value={{}}>
      {children}
    </FavouritesContext.Provider>
  );
};
