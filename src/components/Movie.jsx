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
import ClockIcon from "../assets/icons/ClockIcon";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

function Movie({ movie, language }) {
  const [movieLanguage, setMovieLanguage] = useState(language);
  console.log(movieLanguage);

  const hanldeChangeLang = (e) => {
    setMovieLanguage(e.target.value)
  }

  // useEffect(() => {
  //   const lang = prompt("Choose language")
  //   setMovieLanguage(lang)
  // }, [])
  return (
    <section key={movie._id} className="movie">
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
                <ClockIcon /> Add to Watch Later
              </button>
            </div>
          </div>
        </div>

        <div className="movie-video">
          <select
            onChange={(e) => hanldeChangeLang(e)}
            className="movie-parts_select"
          >
            <option value={"uz"} className="movie-parts_option">
              Uzbek
            </option>
            <option value={"en"} className="movie-parts_option">
              English
            </option>
            <option value={"ru"} className="movie-parts_option">
              Russian
            </option>
          </select>
          {movieLanguage == "uz" &&
            <video poster={movie.image.fullscreen} controls width="100%">
              <source src={movie.movie[movieLanguage]} type="video/mp4" />
              <source src={movie.movie[movieLanguage]} type="video/ogg" />
              <source src={movie.movie[movieLanguage]} type="video/webm" />
              <p>Your browser does not support HTML5 video.</p>
            </video>}
            {movieLanguage == "en" &&
            <video poster={movie.image.fullscreen} controls width="100%">
              <source src={movie.movie[movieLanguage]} type="video/mp4" />
              <source src={movie.movie[movieLanguage]} type="video/ogg" />
              <source src={movie.movie[movieLanguage]} type="video/webm" />
              <p>Your browser does not support HTML5 video.</p>
            </video>}
            {movieLanguage == "ru" &&
            <video poster={movie.image.fullscreen} controls width="100%">
              <source src={movie.movie[movieLanguage]} type="video/mp4" />
              <source src={movie.movie[movieLanguage]} type="video/ogg" />
              <source src={movie.movie[movieLanguage]} type="video/webm" />
              <p>Your browser does not support HTML5 video.</p>
            </video>}
        </div>

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

        <div className="movie-commets">
          <div className="movie-comment">
            <img src={User} className="movie-user_image" alt="Commet's user" />

            <div className="movie-comment_items">
              <h1 className="movie-comment_name">Usmon</h1>
              <span className="movie-comment_date">12/06/2020</span>
              <p className="movie-comment_text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo con
              </p>
              <div className="movie-buttons">
                <button className="movie-like_btn">
                  <Like />
                  11
                </button>

                <button className="movie-like_btn">
                  <DisLike />
                  11
                </button>
              </div>
            </div>
          </div>

          <div className="movie-comment">
            <img src={User} className="movie-user_image" alt="Commet's user" />

            <div className="movie-comment_items">
              <h1 className="movie-comment_name">Usmon</h1>
              <span className="movie-comment_date">12/06/2020</span>
              <p className="movie-comment_text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo con
              </p>
              <div className="movie-buttons">
                <button className="movie-like_btn">
                  <Like />
                  11
                </button>

                <button className="movie-like_btn">
                  <DisLike />
                  11
                </button>
              </div>
            </div>
          </div>

          <div className="movie-comment">
            <img src={User} className="movie-user_image" alt="Commet's user" />

            <div className="movie-comment_items">
              <h1 className="movie-comment_name">Usmon</h1>
              <span className="movie-comment_date">12/06/2020</span>
              <p className="movie-comment_text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo con
              </p>
              <div className="movie-buttons">
                <button className="movie-like_btn">
                  <Like />
                  11
                </button>

                <button className="movie-like_btn">
                  <DisLike />
                  11
                </button>
              </div>
            </div>
          </div>

          <div className="movie-comment">
            <img src={User} className="movie-user_image" alt="Commet's user" />

            <div className="movie-comment_items">
              <h1 className="movie-comment_name">Usmon</h1>
              <span className="movie-comment_date">12/06/2020</span>
              <p className="movie-comment_text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo con
              </p>
              <div className="movie-buttons">
                <button className="movie-like_btn">
                  <Like />
                  11
                </button>

                <button className="movie-like_btn">
                  <DisLike />
                  11
                </button>
              </div>
            </div>
          </div>

          <div className="movie-comment">
            <img src={User} className="movie-user_image" alt="Commet's user" />

            <div className="movie-comment_items">
              <h1 className="movie-comment_name">Usmon</h1>
              <span className="movie-comment_date">12/06/2020</span>
              <p className="movie-comment_text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo con
              </p>
              <div className="movie-buttons">
                <button className="movie-like_btn">
                  <Like />
                  11
                </button>

                <button className="movie-like_btn">
                  <DisLike />
                  11
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Movie;
