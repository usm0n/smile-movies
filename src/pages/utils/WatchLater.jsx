import React, { useEffect } from "react";
import { useUser } from "../../contexts/User";
import { useWatchLater } from "../../contexts/WatchLater";
import { useNavigate } from "react-router-dom";
import RowMovieCard from "../../components/MovieCard/RowMovieCard";
import RowMovieCardSkeleton from "../../components/MovieCard/Skeleton/RowMovieCardSkeleton";
import { Skeleton } from "@mui/material";

function WatchLater() {
  const { user, isLoggedIn, isRealUser } = useUser();
  const { watchlater } = useWatchLater();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      return navigate("/");
    }
  });
  return (
    <div className="watch-later">
      <div className="watch-later-info">
        <h1 className="watch-later-info_title">Watch Later</h1>
        <h1 className="watch-later-info_fullname">
          {isRealUser.loading ? (
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
                width: "150px",
              }}
            ></Skeleton>
          ) : (
            <>
              {user.firstname} {user.lastname}
            </>
          )}
        </h1>
        <h1 className="watch-later-info_count-of-videos">
          {watchlater.loading ? (
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
                width: "100px",
              }}
            />
          ) : watchlater.result.length == 0 ? (
            "No movies"
          ) : watchlater.result.length == 1 ? (
            <>{watchlater.result.length} movie</>
          ) : (
            <>{watchlater.result.length} movies</>
          )}
        </h1>
      </div>
      <div className="watch-later-movies">
        {!watchlater.loading ? (
          watchlater.result.map((movie, index) => {
            return <RowMovieCard movie={movie} key={index} />;
          })
        ) : (
          <>
            <RowMovieCardSkeleton />
            <RowMovieCardSkeleton />
            <RowMovieCardSkeleton />
            <RowMovieCardSkeleton />
          </>
        )}
      </div>
    </div>
  );
}

export default WatchLater;
