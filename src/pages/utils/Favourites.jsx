import React, { useEffect } from "react";
import { useUser } from "../../contexts/User";
import { useNavigate } from "react-router-dom";
import RowMovieCard from "../../components/MovieCard/RowMovieCard";
import RowMovieCardSkeleton from "../../components/MovieCard/Skeleton/RowMovieCardSkeleton";
import { Skeleton } from "@mui/material";
import { useFavourites } from "../../contexts/Favourites";

function Favorites() {
  const { user, isLoggedIn, isRealUser } = useUser();
  const { favourites } = useFavourites();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      return navigate("/");
    }
  });
  return (
    <div className="watch-later">
      <div className="watch-later-info">
        <h1 className="watch-later-info_title">Favourites</h1>
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
          {favourites.loading ? (
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
                width: "100px",
              }}
            />
          ) : favourites.result.length == 0 ? (
            "No movies"
          ) : favourites.result.length == 1 ? (
            <>{favourites.result.length} movie</>
          ) : (
            <>{favourites.result.length} movies</>
          )}
        </h1>
      </div>
      <div className="watch-later-movies">
        {!favourites.loading ? (
          favourites.result.map((movie, index) => {
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

export default Favorites;
