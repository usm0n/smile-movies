import { createContext, useContext, useEffect, useState } from "react";
import users from "../service/api/users.api.service";
import { userId } from "../utilities/defaultFunctions";
import { useNavigate } from "react-router-dom";

const WatchLaterContext = createContext({
  watchlater: {
    loading: false,
    isEmpty: false,
    isError: false,
    result: [],
  },
  statusAddWatchLater: {
    loading: false,
    isSuccess: false,
    isError: false,
    isAlreadyIn: false,
  },
  statusRemoveWatchLater: {
    loading: false,
    isSuccess: false,
    isError: false,
    isNotFound: false,
  },
  addWatchLater: (movieId) => {},
  removeWatchLater: (movieId) => {},
});

export const useWatchLater = () => useContext(WatchLaterContext);

const WatchLaterProvider = ({ children }) => {
  const [watchlater, setWatchLater] = useState({
    loading: false,
    isEmpty: false,
    isError: false,
    result: [],
  });
  const [statusAddWatchLater, setStatusAddWatchLater] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
    isAlreadyIn: false,
  });
  const [statusRemoveWatchLater, setStatusRemoveWatchLater] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
    isNotFound: false,
  });

  const addWatchLater = (movieId) => {
    setStatusAddWatchLater({
      loading: true,
      isSuccess: false,
      isError: false,
      isAlreadyIn: false,
    });
    users
      .addMovieToWatchLater(userId, movieId)
      .then((res) => {
        if (!res.data) {
          setStatusAddWatchLater({
            loading: false,
            isSuccess: false,
            isError: false,
            isAlreadyIn: true,
          });
        } else {
          setStatusAddWatchLater({
            loading: false,
            isSuccess: true,
            isError: false,
            isAlreadyIn: false,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setStatusAddWatchLater({
          loading: false,
          isSuccess: false,
          isError: true,
          isAlreadyIn: false,
        });
      });
  };

  const removeWatchLater = (movieId) => {
    setStatusRemoveWatchLater({
      loading: true,
      isSuccess: false,
      isError: false,
      isNotFound: false,
    });
    users
      .removeMovieFromWatchLater(userId, movieId)
      .then((res) => {
        console.log(res);
        if (res.response) {
          setStatusRemoveWatchLater({
            loading: false,
            isSuccess: false,
            isError: false,
            isNotFound: true,
          });
        } else {
          setStatusRemoveWatchLater({
            loading: false,
            isSuccess: true,
            isError: false,
            isNotFound: false,
          });
        }
      })
      .catch(() => {
        setStatusRemoveWatchLater({
          loading: false,
          isSuccess: false,
          isError: true,
          isNotFound: false,
        });
      });
  };

  useEffect(() => {
    setWatchLater({
      loading: true,
      isEmpty: false,
      isError: false,
      result: [],
    });
    users
      .getWatchLater(userId)
      .then((result) => {
        if (result.response) {
          setWatchLater({
            loading: false,
            isEmpty: false,
            isError: true,
            result: [],
          });
        } else {
          setWatchLater({
            loading: false,
            isEmpty: false,
            isError: false,
            result: result.data.movies,
          });
        }
      })
      .catch((res) => {
        setWatchLater({
          loading: false,
          isEmpty: false,
          isError: true,
          result: [],
        });
      });
  }, []);
  return (
    <WatchLaterContext.Provider
      value={{
        watchlater,
        addWatchLater,
        removeWatchLater,
        statusAddWatchLater,
        statusRemoveWatchLater,
      }}
    >
      {children}
    </WatchLaterContext.Provider>
  );
};

export default WatchLaterProvider;
