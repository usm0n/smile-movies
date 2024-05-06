import React, { useEffect } from "react";
import { useUser } from "../../contexts/User";
import { useWatchLater } from "../../contexts/WatchLater";
import { useNavigate } from "react-router-dom";
import RowMovieCard from "../../components/RowMovieCard";

function WatchLater() {
  const { user, isLoggedIn } = useUser();
  const { watchlater } = useWatchLater();

  const navigate = useNavigate();

  return (
    <div className="watch-later">
      <div className="watch-later-info">
        <h1 className="watch-later-info_title">Watch Later</h1>
        <h1 className="watch-later-info_fullname">
          {user.firstname} {user.lastname}
        </h1>
        <h1 className="watch-later-info_count-of-videos">
          {watchlater.isEmpty ? (
            "No movies"
          ) : watchlater.result.length == 1 ? (
            <>{watchlater.result.length} movie</>
          ) : (
            <>{watchlater.result.length} movies</>
          )}
        </h1>
      </div>
      <div className="watch-later-movies">
        {!watchlater.loading &&
          watchlater.result.map((movie, index) => {
            return <RowMovieCard movie={movie} key={index} />;
          })}
      </div>
    </div>
  );
}

export default WatchLater;
