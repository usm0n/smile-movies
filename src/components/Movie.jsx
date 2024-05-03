import React, { useEffect, useState } from "react";
import Calendar from "../assets/icons/CalendarIcon";
import Clock from "../assets/icons/ClockIcon";
import Like from "../assets/icons/Like";
import DisLike from "../assets/icons/DisLike";
import Favourite from "../assets/icons/SolidStarIcon";
import { Link } from "react-router-dom";
import VideoPlayerIcon from "../assets/icons/VideoPlayerIcon";
import User from "../assets/images/user.png";
import PublicIcon from "@mui/icons-material/Public";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useComments } from "../contexts/Comments";
import Comment from "./Comment";
import { useUser } from "../contexts/User";
import { Alert, Snackbar } from "@mui/material";

function Movie({ movie, language }) {
  const [movieLanguage, setMovieLanguage] = useState(language);
  const [postCommentComment, setPostCommentComment] = useState();
  const [postCommentName, setPostCommentName] = useState();

  const { getMovieId, allComments, postComment, postCommentStatus } =
    useComments();
  const { isLoggedIn, isRealUser } = useUser();

  const hanldeChangeLang = (e) => {
    setMovieLanguage(e.target.value);
  };

  const iframe = (
    <iframe
      src={movie.movie[movieLanguage]}
      width="100%"
      className="movie-iframe"
      allowFullScreen
    ></iframe>
  );

  useEffect(() => {
    getMovieId(movie._id);
    if (!movie.movie[language]) {
      setMovieLanguage("uz");
    }
  }, []);

  return (
    <section key={movie._id} className="movie">
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
              <button className="movie-btn">
                <StarBorderIcon /> Add to Favourite
              </button>
              <button className="movie-btn">
                <AccessTimeIcon /> Add to Watch Later
              </button>
            </div>
          </div>
        </div>

        <div className="movie-video">
          <div className="movie-video-language">
            <h1 className="movie-video-language-text">Language:</h1>
            <select
              onChange={(e) => hanldeChangeLang(e)}
              className="movie-parts_select"
            >
              {movie.movie[language] && (
                <option className="movie-parts_option" value={language}>
                  {language && language.toUpperCase()}
                </option>
              )}
              {movie.movie.uz && language !== "uz" && (
                <option value={"uz"} className="movie-parts_option">
                  UZ
                </option>
              )}
              {movie.movie.en && language !== "en" && (
                <option value={"en"} className="movie-parts_option">
                  EN
                </option>
              )}
              {movie.movie.ru && language !== "ru" && (
                <option value={"ru"} className="movie-parts_option">
                  RU
                </option>
              )}
            </select>
          </div>
          <div className="movie-movie-container">
            {movieLanguage == "uz" && iframe}
            {movieLanguage == "en" && iframe}
            {movieLanguage == "ru" && iframe}
          </div>
        </div>
        {movie.status.type == "series" && (
          <div className="movie-parts">
            <select className="movie-parts_select">
              <option className="movie-parts_option">Season 1</option>
              <option className="movie-parts_option">mustafo</option>
              <option className="movie-parts_option">mustafo</option>
              <option className="movie-parts_option">mustafo</option>
              <option className="movie-parts_option">mustafo</option>
            </select>

            <div className="movie-parts_box">
              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 1: Freedom Day
              </Link>

              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 2: Freedom Day
              </Link>

              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 3: Freedom Day
              </Link>

              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 4: Freedom Day
              </Link>

              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 5: Freedom Day
              </Link>

              <Link className="movie-parts_part">
                <VideoPlayerIcon />
                Episode 6: Freedom Day
              </Link>
            </div>
          </div>
        )}

        <div className="movie-comments">
          <h1 className="movie-comments-title">Comments:</h1>
          <div className="movie-comments-posting">
            {postCommentStatus.isSuccess && (
              <Snackbar open={open} autoHideDuration={6000}>
                <Alert
                  severity="success"
                  variant="filled"
                  sx={{ width: "100%" }}
                >
                  Comment posted successfully
                </Alert>
              </Snackbar>
            )}
            {postCommentStatus.isError && (
              <Snackbar open={open} autoHideDuration={6000}>
                <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
                  Error at posting comment
                </Alert>
              </Snackbar>
            )}
            {!isLoggedIn && !isRealUser.result && (
              <input
                onChange={(e) => setPostCommentName(e.target.value)}
                value={postCommentName}
                className="movie-comments-posting-input"
                placeholder="Your name"
                type="text"
              />
            )}
            <textarea
              onChange={(e) => setPostCommentComment(e.target.value)}
              value={postCommentComment}
              className="movie-comments-posting-area"
              placeholder="Write your comment"
            ></textarea>
            <button
              disabled={
                !postCommentComment ||
                !postCommentName ||
                postCommentStatus.buttonLoading ||
                postCommentStatus.isSuccess
              }
              onClick={() => postComment(postCommentName, postCommentComment)}
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
              {!postCommentStatus.buttonLoading && "Post Comment"}
            </button>
          </div>
          {allComments.isEmpty ? (
            <h1 className="movie-comments-empty-text">
              No one has commented on this movie!
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
