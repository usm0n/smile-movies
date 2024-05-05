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
  },
  statusRemoveWatchLater: {
    loading: false,
    isSuccess: false,
    isError: false,
  },
  addWatchLater: (movieId) => {},
  removeWatchLater: () => {},
});

export const useWatchLater = useContext(WatchLaterContext);

const WatchLaterProvider = ({ children }) => {
  const navigate = useNavigate();
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
  });
  const [statusRemoveWatchLater, setStatusRemoveWatchLater] = useState({
    loading: false,
    isSuccess: false,
    isError: false,
  });

  const addWatchLater = (movieId) => {
    setStatusAddWatchLater({
      loading: true,
      isSuccess: false,
      isError: false,
    });
    users
      .addMovieToWatchLater(userId, movieId)
      .then(() => {
        setStatusAddWatchLater({
          loading: false,
          isSuccess: true,
          isError: false,
        });
      })
      .catch(() => {
        setStatusAddWatchLater({
          loading: false,
          isSuccess: false,
          isError: true,
        });
      });
  };

  const removeWatchLater = (movieId) => {
    setStatusRemoveWatchLater({
      loading: true,
      isSuccess: false,
      isError: false,
    });
    users
      .removeMovieFromWatchLater(userId, movieId)
      .then(() => {
        setStatusRemoveWatchLater({
          loading: false,
          isSuccess: true,
          isError: false,
        });
      })
      .catch(() => {
        setStatusRemoveWatchLater({
          loading: false,
          isSuccess: false,
          isError: true,
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
        if (result.data.length == 0) {
          setWatchLater({
            loading: false,
            isEmpty: true,
            isError: false,
            result: [],
          });
        } else if (result.response.data) {
          setWatchLater({
            loading: false,
            isEmpty: false,
            isError: false,
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
      .catch(() => {
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
