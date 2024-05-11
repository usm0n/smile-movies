import React, { useEffect, useState } from "react";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useComments } from "../../contexts/Comments";
import Comment from "../../components/Comment";
import { useUser } from "../../contexts/User";
import {
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Favourite from "../../assets/icons/SolidStarIcon";
import { Link } from "react-router-dom";
import VideoPlayerIcon from "../../assets/icons/VideoPlayerIcon";
import PublicIcon from "@mui/icons-material/Public";
import User from "../../assets/images/user.png";
import Calendar from "../../assets/icons/CalendarIcon";

function AddMovie() {
  const [active, setActive] = useState(false);
  const [toggleValue, setToggleValue] = useState({
    img: "portrait",
    title: "uz",
  });
  const [addMovieValue, setAddMovieValue] = useState({
    image: {
      portrait: "",
      fullscreen: "",
    },
    title: {
      uz: "",
      ru: "",
      en: "",
    },
  });

  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };

  const handleImageInput = (e) => {
    setAddMovieValue({
      ...addMovieValue,
      image: {
        ...addMovieValue.image,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleTitleInput = (e) => {
    setAddMovieValue({
      ...addMovieValue,
      title: {
        ...addMovieValue.title,
        [e.target.name]: e.target.value,
      },
    });
  };

  const watchActive = () => {
    setActive(true);
  };
  
  return (
    <section className="movie">
      <div className="movie-container">
        <div className="movie-content">
          <div className="admin-change-img">
            <ToggleButtonGroup
              color="info"
              value={toggleValue.img}
              name="img"
              onChange={(e) => handleToggleValue(e, "img")}
              sx={{
                backgroundColor: "gold",
              }}
              exclusive
              aria-label="Platform"
            >
              <ToggleButton value="portrait">Portrait</ToggleButton>
              <ToggleButton value="fullscreen">Full Screen</ToggleButton>
            </ToggleButtonGroup>
            {toggleValue.img == "portrait" && (
              <textarea
                onChange={handleImageInput}
                name="portrait"
                value={addMovieValue.image.portrait}
                placeholder="Portrait photo link"
                className="admin-input"
              />
            )}
            {toggleValue.img == "fullscreen" && (
              <textarea
                name="fullscreen"
                onChange={handleImageInput}
                value={addMovieValue.image.fullscreen}
                placeholder="Full Screen photo link"
                className="admin-input"
              />
            )}
          </div>
          <div className="movie-info">
            <div className="movie-text">
              <div
                style={{
                  gap: "20px",
                }}
                className="movie-first-section"
              >
                <div className="admin-change-title">
                  <ToggleButtonGroup
                    color="info"
                    value={toggleValue.title}
                    name="title"
                    onChange={(e) => handleToggleValue(e, "title")}
                    sx={{
                      backgroundColor: "gold",
                    }}
                    exclusive
                    aria-label="Platform"
                  >
                    <ToggleButton value="uz">Uzbek</ToggleButton>
                    <ToggleButton value="ru">Russian</ToggleButton>
                    <ToggleButton value="en">English</ToggleButton>
                  </ToggleButtonGroup>
                  {toggleValue.title === "uz" && (
                    <input
                      value={addMovieValue.title.uz}
                      name="uz"
                      type="text"
                      onChange={handleTitleInput}
                      placeholder={`${toggleValue.title.toUpperCase()} Movie Title`}
                      className={
                        active ? "admin-name_input active" : "admin-name_input"
                      }
                    />
                  )}
                  {toggleValue.title === "ru" && (
                    <input
                      value={addMovieValue.title.ru}
                      name="ru"
                      type="text"
                      onChange={handleTitleInput}
                      placeholder={`${toggleValue.title.toUpperCase()} Movie Title`}
                      className={
                        active ? "admin-name_input active" : "admin-name_input"
                      }
                    />
                  )}
                  {toggleValue.title === "en" && (
                    <input
                      value={addMovieValue.title.en}
                      name="en"
                      type="text"
                      onChange={handleTitleInput}
                      placeholder={`${toggleValue.title.toUpperCase()} Movie Title`}
                      className={
                        active ? "admin-name_input active" : "admin-name_input"
                      }
                    />
                  )}
                </div>
                <div className="movie-like-dislike">
                  <button className="movie-like">
                    <ThumbUpOffAltIcon />0
                  </button>
                  <button className="movie-dislike">
                    <ThumbDownOffAltIcon />0
                  </button>
                </div>
              </div>
              <div className="movie-number_info">
                <span className="movie-info_title">
                  <Calendar />
                  <input
                    type="text"
                    className={
                      active ? "admin-check_input active" : "admin-check_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <WatchLaterIcon />
                  <input
                    type="text"
                    className={
                      active ? "admin-check_input active" : "admin-check_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <span className="movie-info_icon">
                    <Favourite />
                  </span>
                  <input
                    type="text"
                    className={
                      active ? "admin-grade_input active" : "admin-grade_input"
                    }
                  />
                  <span className="movie-info_icon"></span>
                </span>

                <span className="movie-info_title">
                  <span className="movie-info_icon">
                    <PublicIcon />
                  </span>
                  <input
                    type="text"
                    className={
                      active
                        ? "admin-country_input active"
                        : "admin-country_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <CheckIcon />
                  <input
                    type="text"
                    className={active ? "admin-check active" : "admin-check"}
                  />
                </span>
              </div>
            </div>
            <p className="movie-subtitle">
              {/* <area
                className={active ? "admin-subtitle active" : "admin-subtitle"}
                type="text"
              /> */}
              <textarea
                name=""
                id=""
                className={active ? "admin-subtitle active" : "admin-subtitle"}
              ></textarea>
            </p>
            <div className="movie-btns">
              <button className="movie-btn">
                <StarBorderIcon /> Add to Favourite
              </button>
              <button className="movie-btn">
                <AccessTimeIcon /> Add to Watch Later
              </button>

              <button className="movie-btn" onClick={watchActive}>
                Watch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddMovie;
