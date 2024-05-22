import React, { useState } from "react";
import { dialog, language, snackbar } from "../../utilities/defaultFunctions";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import Calendar from "../../assets/icons/CalendarIcon";
import Favourite from "../../assets/icons/SolidStarIcon";
import PublicIcon from "@mui/icons-material/Public";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useWatchLater } from "../../contexts/WatchLater";
import { useFavourites } from "../../contexts/Favourites";
import { t } from "i18next";
import { useNavigate } from "react-router-dom";

function MovieContent({ movie, user, isLoggedIn }) {
  const {
    addWatchLater,
    removeWatchLater,
    statusAddWatchLater,
    statusRemoveWatchLater,
  } = useWatchLater();
  const {
    addFavourites,
    removeFavourites,
    statusAddFavourites,
    statusRemoveFavourites,
  } = useFavourites();

  const [watchlaterDialog, setWatchlaterDialog] = useState();
  const [favouritesDialog, setFavouritesDialog] = useState();

  const navigate = useNavigate();

  const handleOpenWatchLaterDialog = () => {
    navigate("/login");
  };
  const handleCloseWatchLaterDialog = () => {
    setWatchlaterDialog(false);
  };

  const handleOpenFavouritesDialog = () => {
    navigate("/login");
  };
  const handleCloseFavouritesDialog = () => {
    setFavouritesDialog(false);
  };

  const handleAddToWatchLater = (movieId) => {
    if (!isLoggedIn) {
      setWatchlaterDialog(true);
    } else {
      addWatchLater(movieId);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  const handleRemoveFromWatchLater = (movieId) => {
    removeWatchLater(movieId);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleAddToFavourites = (movieId) => {
    if (!isLoggedIn) {
      setFavouritesDialog(true);
    } else {
      addFavourites(movieId);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  const handleRemoveFromFavourites = (movieId) => {
    removeFavourites(movieId);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  return (
    <div className="movie-content">
      {dialog(
        "Please sign In!",
        "To add to Watch Later you must log in first.",
        watchlaterDialog,
        handleCloseWatchLaterDialog,
        handleOpenWatchLaterDialog
      )}
      {dialog(
        "Please Sign In",
        "To add to Favourites you must log in first",
        favouritesDialog,
        handleCloseFavouritesDialog,
        handleOpenFavouritesDialog
      )}

      {statusAddWatchLater.isSuccess &&
        snackbar("success", t("AddedToWatchLater"))}
      {statusAddWatchLater.isError &&
        snackbar("danger", t("ErrorAtAddWatchLater"))}
      {statusAddWatchLater.isAlreadyIn &&
        snackbar("warning", t("AlreadyInWatchLater"))}
      {statusRemoveWatchLater.isSuccess &&
        snackbar("success", t("RemovedFromWatchLater"))}
      {statusRemoveWatchLater.isError &&
        snackbar("danger", t("ErrorAtRemoveWatchLater"))}
      {statusRemoveWatchLater.isNotFound &&
        snackbar("warning", t("NotFoundWatchLater"))}

      {statusAddFavourites.isSuccess &&
        snackbar("success", t("AddedToFavourites"))}
      {statusAddFavourites.isError &&
        snackbar("danger", t("ErrorAtAddFavourites"))}
      {statusAddFavourites.isAlreadyIn &&
        snackbar("warning", t("AlreadyInFavourites"))}
      {statusRemoveFavourites.isSuccess &&
        snackbar("success", t("RemovedFromFavourites"))}
      {statusRemoveFavourites.isError &&
        snackbar("danger", t("ErrorAtRemoveFavourites"))}
      {statusRemoveFavourites.isNotFound &&
        snackbar("warning", t("NotFoundFavourites"))}
      <img
        src={movie.image.fullscreen}
        alt=""
        className="movie-img-fullscreen"
      />
      <img src={movie.image.portrait} alt="movie photo" className="movie-img" />
      <div className="movie-info">
        <div className="movie-text">
          <div className="movie-first-section">
            <h1 className="movie-name">{movie.title[language]}</h1>
            <div className="movie-like-dislike">
              <button className="movie-like">
                <ThumbUpOffAltIcon />
                {movie.rating.like}
              </button>
              <button className="movie-dislike">
                <ThumbDownOffAltIcon />
                {movie.rating.dislike}
              </button>
            </div>
          </div>
          <div className="movie-number_info">
            <span className="movie-info_title">
              <Calendar />
              {movie.releaseDate.day}.{movie.releaseDate.month}.
              {movie.releaseDate.year}
            </span>

            <span className="movie-info_title">
              <WatchLaterIcon />
              {movie.duration.hour}:{movie.duration.min}:00
            </span>

            <span className="movie-info_title">
              <span className="movie-info_icon">
                <Favourite />
              </span>
              {movie.rating.imdb}
            </span>
            <span className="movie-info_title">
              <span className="movie-info_icon">
                <PublicIcon />
              </span>
              {movie.country[language]}
            </span>
            <span className="movie-info_title">
              <span className="movie-info_icon">
                <CheckIcon />
              </span>
              {movie.credit ? movie.credit[language] : "Smile Movie"}
            </span>
          </div>

          <p className="movie-subtitle">
            {movie.description[language].substring(0, 200)}...
          </p>
        </div>
        <div className="movie-btns">
          {user.favourites && user.favourites.includes(movie._id) ? (
            <button
              onClick={() => handleRemoveFromFavourites(movie._id)}
              disabled={
                statusRemoveFavourites.loading ||
                statusRemoveFavourites.isSuccess
              }
              className={
                statusRemoveFavourites.loading ||
                statusRemoveFavourites.isSuccess
                  ? "movie-btn disabled"
                  : "movie-btn"
              }
            >
              {statusRemoveFavourites.loading ? (
                "Loading..."
              ) : (
                <>
                  <Favourite />
                  {t("InFavourites")}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleAddToFavourites(movie._id)}
              disabled={
                statusAddFavourites.loading || statusAddFavourites.isSuccess
              }
              className={
                statusAddFavourites.loading || statusAddFavourites.isSuccess
                  ? "movie-btn disabled"
                  : "movie-btn"
              }
            >
              {statusAddFavourites.loading ? (
                "Loading..."
              ) : (
                <>
                  <StarBorderIcon /> {t("AddToFavourites")}
                </>
              )}
            </button>
          )}
          {user.watchlater && user.watchlater.includes(movie._id) ? (
            <button
              onClick={() => handleRemoveFromWatchLater(movie._id)}
              disabled={
                statusRemoveWatchLater.loading ||
                statusRemoveWatchLater.isSuccess
              }
              className={
                statusRemoveWatchLater.loading ||
                statusRemoveWatchLater.isSuccess
                  ? "movie-btn disabled"
                  : "movie-btn"
              }
            >
              {statusRemoveWatchLater.loading ? (
                "Loading..."
              ) : (
                <>
                  <WatchLaterIcon /> {t("HeaderInWatchLaterText")}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleAddToWatchLater(movie._id)}
              disabled={
                statusAddWatchLater.loading || statusAddWatchLater.isSuccess
              }
              className={
                statusAddWatchLater.loading || statusAddWatchLater.isSuccess
                  ? "movie-btn disabled"
                  : "movie-btn"
              }
            >
              {statusAddWatchLater.loading ? (
                "Loading..."
              ) : (
                <>
                  <AccessTimeIcon /> {t("MenuWatchLaterText")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieContent;
