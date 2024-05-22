import React, { useEffect } from "react";
import { useUser } from "../../contexts/User";
import { useWatchLater } from "../../contexts/WatchLater";
import RowMovieCard from "../../components/MovieCard/RowMovieCard";
import RowMovieCardSkeleton from "../../components/MovieCard/Skeleton/RowMovieCardSkeleton";
import { Skeleton } from "@mui/material";
import { t } from "i18next";
import { language } from "../../utilities/defaultFunctions";
import NotFound from "../error/NotFound";

function WatchLater() {
  const { user, isLoggedIn, isRealUser } = useUser();
  const { watchlater, getWatchLater } = useWatchLater();

  useEffect(() => {
    getWatchLater();
  }, []);

  return isLoggedIn ? (
    <div className="watch-later">
      <div className="watch-later-info">
        <h1 className="watch-later-info_title">{t("MenuWatchLaterText")}</h1>
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
          ) : (
            <>
              {language == "en" &&
                (watchlater.result.length ? watchlater.result.length : "No") +
                  " results found"}
              {language == "uz" &&
                (watchlater.result.length
                  ? watchlater.result.length + " natija topildi"
                  : "Natijalar topilmadi")}
              {language == "ru" &&
                (watchlater.result.length
                  ? "Найдено " + watchlater.result.length + " результатов"
                  : "Результатов не найдено")}
            </>
          )}
        </h1>
        {!watchlater.loading && (
          <h1 className="watch-later-not-found">
            {language == "en" &&
              !watchlater.result.length &&
              "No results found"}
            {language == "uz" &&
              !watchlater.result.length &&
              "Natijalar topilmadi"}
            {language == "ru" &&
              !watchlater.result.length &&
              "Результатов не найдено"}
          </h1>
        )}
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
  ) : (
    <NotFound />
  );
}

export default WatchLater;
