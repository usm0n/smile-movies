import React from "react";
import img from "../assets/images/movie.jpeg";
import header from "../assets/images/header.jpeg";
import Calendar from "../assets/icons/CalendarIcon";
import Clock from "../assets/icons/ClockIcon";
import Like from "../assets/icons/Like";
import DisLike from "../assets/icons/DisLike";
import Favourite from "../assets/icons/SolidStarIcon";
import { Link } from "react-router-dom";
import VideoPlayerIcon from "../assets/icons/VideoPlayerIcon";
import User from "../assets/images/user.png";

function Movie() {
  return (
    <section className="movie">
      <div className="movie-container">
        <div className="movie-content">
          <img src={img} alt="movie photo" className="movie-img" />
          <div className="movie-info">
            <div className="movie-text">
              <h1 className="movie-name">Silo</h1>
              <div className="movie-number_info">
                <span className="movie-info_title">
                  <Calendar />
                  2023
                </span>

                <span className="movie-info_title">
                  <Clock />
                  50:38
                </span>

                <span className="movie-info_title">
                  <span className="movie-info_icon">
                    <Favourite />
                  </span>
                  8.5
                </span>
              </div>

              <p className="movie-subtitle">
                In a ruined and toxic future, a community exists in a giant
                underground silo that plunges hundreds of stories deep. There,
                men and women live in a society full of regulations they believe
                are meant to protect them.
              </p>
            </div>
            <div className="movie-btns">
              <button className="movie-btn">+ Add to Favourite</button>
              <button className="movie-btn">+ Add to Watch Later</button>
            </div>
          </div>
        </div>

        <div className="movie-video">
          <img src={header} className="movie-video_image" alt="" />
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
