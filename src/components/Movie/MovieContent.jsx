import React, { useState } from "react";
import { backdropLoading, dialog, language, snackbar } from "../../utilities/defaultFunctions";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
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
import { useNavigate, useParams } from "react-router-dom";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";

function MovieContent({ movie, user, isLoggedIn, likeMovie, dislikeMovie, ratingLoading }) {
  const { movieId } = useParams();
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
      {backdropLoading(ratingLoading)}
      {dialog(
        t("PleaseSignIn"),
        t("ToAddWatchLaterSignIn"),
        watchlaterDialog,
        handleCloseWatchLaterDialog,
        handleOpenWatchLaterDialog
      )}
      {dialog(
        t("PleaseSignIn"),
        t("ToAddFavouritesSignIn"),
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
              <button
                onClick={() => {
                  likeMovie(movie.rating.like, movie.rating.dislike);
                }}
                className="movie-like"
              >
                {localStorage.getItem(`likeMovie${movieId}`) ? (
                  <ThumbUpIcon />
                ) : (
                  <ThumbUpOffAltIcon />
                )}
                {movie.rating.like}
              </button>
              <button
                onClick={() => {
                  dislikeMovie(movie.rating.like, movie.rating.dislike);
                }}
                className="movie-dislike"
              >
                {localStorage.getItem(`dislikeMovie${movieId}`) ? (
                  <ThumbDownIcon />
                ) : (
                  <ThumbDownOffAltIcon />
                )}
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
          <button
            onClick={() => (window.location.href = movie.trailer)}
            disabled={!movie.trailer}
            className={!movie.trailer ? "movie-btn disabled" : "movie-btn"}
          >
            <PlayCircleFilledOutlinedIcon /> {t("trailerText")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieContent;
