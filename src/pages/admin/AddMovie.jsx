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
import AddIcon from "@mui/icons-material/Add";
import {
  currentDate,
  currentDay,
  currentMonth,
  currentTime,
  currentYear,
} from "../../utilities/defaultFunctions";

function AddMovie() {
  const [active, setActive] = useState(false);
  const [toggleValue, setToggleValue] = useState({
    image: "portrait",
    title: "uz",
  });
  const [addMovieValue, setAddMovieValue] = useState({
    title: {
      uz: "",
      ru: "",
      en: "",
    },
    notes: {
      uz: "",
      ru: "",
      en: "",
    },
    description: {
      uz: "",
      ru: "",
      en: "",
    },
    releaseDate: {
      day: "",
      month: "",
      year: "",
    },
    duration: {
      hour: "",
      min: "",
    },
    rating: {
      like: 0,
      dislike: 0,
      imdb: "N/A",
    },
    country: {
      uz: "",
      ru: "",
      en: "",
    },
    credit: {
      uz: "",
      ru: "",
      en: "",
    },
    image: {
      portrait: "",
      fullscreen: "",
    },
    status: {
      isNew: false,
      isTrending: false,
      type: "movie",
    },
    movie: "",
    trailer: "",
  });

  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };

  const handleExtraInput = (e, parent) => {
    setAddMovieValue({
      ...addMovieValue,
      [parent]: {
        ...addMovieValue[parent],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleInput = (e) => {
    setAddMovieValue({
      ...addMovieValue,
      [e.target.name]: e.target.value,
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
              value={toggleValue.image}
              name="image"
              onChange={(e) => handleToggleValue(e, "image")}
              sx={{
                backgroundColor: "gold",
              }}
              exclusive
              aria-label="Platform"
            >
              <ToggleButton value="portrait">Portrait</ToggleButton>
              <ToggleButton value="fullscreen">Full Screen</ToggleButton>
            </ToggleButtonGroup>
            <textarea
              onChange={(e) => handleExtraInput(e, "image")}
              name={toggleValue.image}
              value={addMovieValue.image[toggleValue.image]}
              placeholder={`${toggleValue.image} photo link`}
              className="admin-input"
            />
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
                  <input
                    value={addMovieValue.title[toggleValue.title]}
                    name={toggleValue.title}
                    type="text"
                    onChange={(e) => handleExtraInput(e, "title")}
                    placeholder={`${toggleValue.title.toUpperCase()} Movie Title`}
                    className={
                      active ? "admin-name_input active" : "admin-name_input"
                    }
                  />
                </div>
                <div className="movie-like-dislike">
                  <button className="movie-like">
                    <ThumbUpOffAltIcon />
                    <input
                      value={addMovieValue.rating.like}
                      name="like"
                      type="text"
                      onChange={(e) => handleExtraInput(e, "rating")}
                      placeholder={"Likes"}
                      className="admin-grade_input"
                    />
                  </button>
                  <button className="movie-dislike">
                    <ThumbDownOffAltIcon />
                    <input
                      value={addMovieValue.rating.dislike}
                      name="dislike"
                      type="text"
                      onChange={(e) => handleExtraInput(e, "rating")}
                      placeholder={"Dislikes"}
                      className="admin-grade_input"
                    />
                  </button>
                </div>
              </div>
              <div className="movie-number_info">
                <span className="movie-info_title">
                  <Calendar />
                  <input
                    value={addMovieValue.releaseDate.day}
                    name="day"
                    type="text"
                    onChange={(e) => handleExtraInput(e, "releaseDate")}
                    placeholder={currentDay}
                    className={
                      active ? "admin-month_input active" : "admin-month_input"
                    }
                  />
                  <input
                    value={addMovieValue.releaseDate.month}
                    name="month"
                    type="text"
                    onChange={(e) => handleExtraInput(e, "releaseDate")}
                    placeholder={currentMonth}
                    className={
                      active ? "admin-month_input active" : "admin-month_input"
                    }
                  />
                  <input
                    value={addMovieValue.releaseDate.year}
                    name="year"
                    type="text"
                    onChange={(e) => handleExtraInput(e, "releaseDate")}
                    placeholder={currentYear}
                    className={
                      active ? "admin-year_input active" : "admin-year_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <WatchLaterIcon />
                  <input
                    value={addMovieValue.duration.hour}
                    name="hour"
                    type="text"
                    onChange={(e) => handleExtraInput(e, "duration")}
                    placeholder={"hour"}
                    className={
                      active ? "admin-month_input active" : "admin-month_input"
                    }
                  />
                  :
                  <input
                    value={addMovieValue.duration.min}
                    name="min"
                    type="text"
                    onChange={(e) => handleExtraInput(e, "duration")}
                    placeholder={"min"}
                    className={
                      active ? "admin-month_input active" : "admin-month_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <span className="movie-info_icon">
                    <Favourite />
                  </span>
                  <input
                    onChange={(e) => handleExtraInput(e, "rating")}
                    value={addMovieValue.rating.imdb}
                    name="imdb"
                    placeholder="imdb"
                    type="text"
                    className={
                      active ? "admin-grade_input active" : "admin-grade_input"
                    }
                  />
                </span>

                <span className="movie-info_title">
                  <span className="movie-info_icon">
                    <PublicIcon />
                  </span>
                  <input
                    onChange={(e) => handleExtraInput(e, "country")}
                    value={addMovieValue.country[toggleValue.title]}
                    name={toggleValue.title}
                    placeholder={toggleValue.title.toUpperCase()}
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
                    onChange={(e) => handleExtraInput(e, "credit")}
                    placeholder={`${toggleValue.title.toUpperCase()} credit`}
                    value={addMovieValue.credit[toggleValue.title]}
                    name={toggleValue.title}
                    type="text"
                    className={active ? "admin-check active" : "admin-check"}
                  />
                </span>
              </div>
            </div>
            <p className="movie-subtitle">
              <textarea
                onChange={(e) => handleExtraInput(e, "description")}
                value={addMovieValue.description[toggleValue.title]}
                name={toggleValue.title}
                placeholder={`${toggleValue.title.toUpperCase()} description`}
                id=""
                className={active ? "admin-subtitle active" : "admin-subtitle"}
              ></textarea>
            </p>
            <div className="movie-btns">
              <button disabled className="movie-btn disabled">
                <StarBorderIcon /> Add to Favourite
              </button>
              <button disabled className="movie-btn disabled">
                <AccessTimeIcon /> Add to Watch Later
              </button>
            </div>
            <button className="admin-addmovie-btn">
              <AddIcon /> Add Movie
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddMovie;
