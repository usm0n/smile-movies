import React, { useState } from "react";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Favourite from "@mui/icons-material/Star";
import PublicIcon from "@mui/icons-material/Public";
import Calendar from "@mui/icons-material/CalendarMonth";
import {
  currentDay,
  currentMonth,
  currentYear,
} from "../../../../../utilities/defaultFunctions";
import { t } from "i18next";

function MovieContent({
  handleToggleValue,
  handleExtraInput,
  toggleValue,
  movieValue,
}) {
  const [active, setActive] = useState(false);
  return (
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
          <ToggleButton value="portrait">{t("Portrait")}</ToggleButton>
          <ToggleButton value="fullscreen">{t("FullScreen")}</ToggleButton>
        </ToggleButtonGroup>
        <textarea
          onChange={(e) => handleExtraInput(e, "image")}
          name={toggleValue.image}
          value={movieValue.image[toggleValue.image]}
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
                <ToggleButton value="uz">O'zbekcha</ToggleButton>
                <ToggleButton value="ru">Русский</ToggleButton>
                <ToggleButton value="en">English</ToggleButton>
              </ToggleButtonGroup>
              <input
                value={movieValue.title[toggleValue.title]}
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
                  value={movieValue.rating.like}
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
                  value={movieValue.rating.dislike}
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
                value={movieValue.releaseDate.day}
                name="day"
                type="text"
                onChange={(e) => handleExtraInput(e, "releaseDate")}
                placeholder={currentDay}
                className={
                  active ? "admin-month_input active" : "admin-month_input"
                }
              />
              <input
                value={movieValue.releaseDate.month}
                name="month"
                type="text"
                onChange={(e) => handleExtraInput(e, "releaseDate")}
                placeholder={currentMonth}
                className={
                  active ? "admin-month_input active" : "admin-month_input"
                }
              />
              <input
                value={movieValue.releaseDate.year}
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
                value={movieValue.duration.hour}
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
                value={movieValue.duration.min}
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
                value={movieValue.rating.imdb}
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
                value={movieValue.country[toggleValue.title]}
                name={toggleValue.title}
                placeholder={toggleValue.title.toUpperCase()}
                type="text"
                className={
                  active ? "admin-country_input active" : "admin-country_input"
                }
              />
            </span>

            <span className="movie-info_title">
              <CheckIcon />
              <input
                onChange={(e) => handleExtraInput(e, "credit")}
                placeholder={`${toggleValue.title.toUpperCase()} credit`}
                value={movieValue.credit[toggleValue.title]}
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
            value={movieValue.description[toggleValue.title]}
            name={toggleValue.title}
            placeholder={`${toggleValue.title.toUpperCase()} description`}
            id=""
            className={active ? "admin-subtitle active" : "admin-subtitle"}
          ></textarea>
        </p>
        <div className="movie-btns">
          <button disabled className="movie-btn disabled">
            <StarBorderIcon /> {t("AddToFavourites")}
          </button>
          <button disabled className="movie-btn disabled">
            <AccessTimeIcon /> {t("MenuWatchLaterText")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieContent;
