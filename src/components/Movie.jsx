import React, { useEffect, useState } from "react";
import Calendar from "../assets/icons/CalendarIcon";
import Clock from "../assets/icons/ClockIcon";
import Like from "../assets/icons/Like";
import DisLike from "../assets/icons/DisLike";
import Favourite from "../assets/icons/SolidStarIcon";
import { Link, useNavigate } from "react-router-dom";
import VideoPlayerIcon from "../assets/icons/VideoPlayerIcon";
import User from "../assets/images/user.png";
import PublicIcon from "@mui/icons-material/Public";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useComments } from "../contexts/Comments";
import Comment from "./Comment";
import { useUser } from "../contexts/User";
import { useWatchLater } from "../contexts/WatchLater";
import { dialog, snackbar } from "../utilities/defaultFunctions";
import { useFavourites } from "../contexts/Favourites";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { language } from "../utilities/defaultFunctions";
import { Helmet } from "react-helmet";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { t } from "i18next";

function Movie({ movie }) {
  const { getMovieId, allComments, postComment, postCommentStatus } =
    useComments();
  const {
    addWatchLater,
    removeWatchLater,
    statusAddWatchLater,
    statusRemoveWatchLater,
  } = useWatchLater();
  const { isLoggedIn, user } = useUser();
  const {
    addFavourites,
    favourites,
    removeFavourites,
    statusAddFavourites,
    statusRemoveFavourites,
  } = useFavourites();
  const navigate = useNavigate();

  const [postCommentComment, setPostCommentComment] = useState();
  const [postCommentName, setPostCommentName] = useState(user.firstname);
  const [watchlaterDialog, setWatchlaterDialog] = useState();
  const [favouritesDialog, setFavouritesDialog] = useState();

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
  const handleOpenWatchLaterDialog = () => {
    navigate("/login");
  };
  const handleCloseWatchLaterDialog = () => {
    setWatchlaterDialog(false);
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
  const handleOpenFavouritesDialog = () => {
    navigate("/login");
  };
  const handleCloseFavouritesDialog = () => {
    setFavouritesDialog(false);
  };

  const iframe = (
    <iframe
      src={movie.movie}
      width="100%"
      className="movie-iframe"
      allowFullScreen
    ></iframe>
  );

  useEffect(() => {
    getMovieId(movie._id);
  }, []);

  return (
    <section key={movie._id} className="movie">
      <Helmet>
        <title>Smile Movie | {movie.title[language]}</title>
      </Helmet>
      <Button
        onClick={() => navigate(-1)}
        sx={{
          position: "fixed",
          top: "90px",
          left: "20px",
          zIndex: "1000",
          color: "black",
          backgroundColor: "gold",
          borderRadius: "50px",
          transition: "ease-in-out 0.2s",
          "&:hover": {
            backgroundColor: "gold",
            opacity: "0.8",
          },
        }}
      >
        <ArrowBack />
      </Button>
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
        snackbar("error", t("ErrorAtAddWatchLater"))}
      {statusAddWatchLater.isAlreadyIn &&
        snackbar("warning", t("AlreadyInWatchLater"))}
      {statusRemoveWatchLater.isSuccess &&
        snackbar("success", t("RemovedFromWatchLater"))}
      {statusRemoveWatchLater.isError &&
        snackbar("error", t("ErrorAtRemoveWatchLater"))}
      {statusRemoveWatchLater.isNotFound &&
        snackbar("warning", t("NotFoundWatchLater"))}

      {statusAddFavourites.isSuccess &&
        snackbar("success", t("AddedToFavourites"))}
      {statusAddFavourites.isError &&
        snackbar("error", t("ErrorAtAddFavourites"))}
      {statusAddFavourites.isAlreadyIn &&
        snackbar("warning", t("AlreadyInFavourites"))}
      {statusRemoveFavourites.isSuccess &&
        snackbar("success", t("RemovedFromFavourites"))}
      {statusRemoveFavourites.isError &&
        snackbar("error", t("ErrorAtRemoveFavourites"))}
      {statusRemoveFavourites.isNotFound &&
        snackbar("warning", t("NotFoundFavourites"))}
      <img
        src={movie.image.fullscreen}
        alt=""
        className="movie-img-fullscreen"
      />
      <div className="movie-container">
        <div className="movie-content">
          <img
            src={movie.image.portrait}
            alt="movie photo"
            className="movie-img"
          />
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

        <div className="movie-video">
          <div className="movie-movie-container">{iframe}</div>
        </div>

        <div className="movie-comments">
          <h1 className="movie-comments-title">{t("CommentsTitle")}</h1>
          <div className="movie-comments-posting">
            {postCommentStatus.isSuccess &&
              snackbar("success", "Your comment posted successfully")}
            {postCommentStatus.isError &&
              snackbar("error", "An error has occurred")}
            {!isLoggedIn && (
              <input
                onChange={(e) => setPostCommentName(e.target.value)}
                value={postCommentName}
                className="movie-comments-posting-input"
                placeholder={t("CommentsNameInputPlaceholder")}
                type="text"
              />
            )}
            <textarea
              onChange={(e) => setPostCommentComment(e.target.value)}
              value={postCommentComment}
              className="movie-comments-posting-area"
              placeholder={t("CommentInputPlaceholder")}
            ></textarea>
            <button
              disabled={
                !postCommentComment ||
                !postCommentName ||
                postCommentStatus.buttonLoading ||
                postCommentStatus.isSuccess
              }
              onClick={() => {
                postComment(postCommentName, postCommentComment);
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }}
              className={
                !postCommentComment ||
                !postCommentName ||
                postCommentStatus.buttonLoading ||
                postCommentStatus.isSuccess
                  ? "movie-comments-posting-button disabled"
                  : "movie-comments-posting-button"
              }
            >
              {postCommentStatus.buttonLoading && "Loading..."}
              {!postCommentStatus.buttonLoading && t("SendCommentButtonText")}
            </button>
          </div>
          {allComments.isEmpty ? (
            <h1 className="movie-comments-empty-text">
              {t("NoComments")}
            </h1>
          ) : (
            !allComments.isLoading &&
            allComments.comments &&
            allComments.comments.map((comment, index) => {
              return <Comment comment={comment} index={index} />;
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default Movie;
