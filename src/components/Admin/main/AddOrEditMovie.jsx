import React, { useState } from "react";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Favourite from "../../../assets/icons/SolidStarIcon";
import PublicIcon from "@mui/icons-material/Public";
import Calendar from "../../../assets/icons/CalendarIcon";
import {
  backButton,
  currentDay,
  currentMonth,
  currentYear,
  removeLocalDraft,
  snackbar,
} from "../../../utilities/defaultFunctions";
import { useMovie } from "../../../contexts/Movie";
import { useNavigate } from "react-router-dom";
import Edit from "@mui/icons-material/Edit";
import { t } from "i18next";
import AddIcon from "@mui/icons-material/Add";

function AddOrEditMovie({ movie, type }) {
  const { editMovie, statusEditMovie, addMovie, statusAddMovie } = useMovie();

  const [active, setActive] = useState(false);
  const [toggleValue, setToggleValue] = useState({
    image: "portrait",
    title: "uz",
    video: "movie",
    page: "standart",
    notes: "uz",
    movie: "uz",
  });
  const [movieValue, setMovieValue] = useState({
    title: {
      uz:
        type == "add"
          ? localStorage.getItem("titleDraft uz") || ""
          : movie.title.uz,
      ru:
        type == "add"
          ? localStorage.getItem("titleDraft ru") || ""
          : movie.title.ru,
      en:
        type == "add"
          ? localStorage.getItem("titleDraft en") || ""
          : movie.title.en,
    },
    notes: {
      uz:
        type == "add"
          ? localStorage.getItem("notesDraft uz") || ""
          : movie.notes.uz,
      ru:
        type == "add"
          ? localStorage.getItem("notesDraft ru") || ""
          : movie.notes.ru,
      en:
        type == "add"
          ? localStorage.getItem("notesDraft en") || ""
          : movie.notes.en,
    },
    description: {
      uz:
        type == "add"
          ? localStorage.getItem("descriptionDraft uz") || ""
          : movie.description.uz,
      ru:
        type == "add"
          ? localStorage.getItem("descriptionDraft ru") || ""
          : movie.description.ru,
      en:
        type == "add"
          ? localStorage.getItem("descriptionDraft en") || ""
          : movie.description.en,
    },
    releaseDate: {
      day:
        type == "add"
          ? localStorage.getItem("releaseDateDraft day") || ""
          : movie.releaseDate.day,
      month:
        type == "add"
          ? localStorage.getItem("releaseDateDraft month") || ""
          : movie.releaseDate.month,
      year:
        type == "add"
          ? localStorage.getItem("releaseDateDraft year") || ""
          : movie.releaseDate.year,
    },
    duration: {
      hour:
        type == "add"
          ? localStorage.getItem("durationDraft hour") || ""
          : movie.duration.hour,
      min:
        type == "add"
          ? localStorage.getItem("durationDraft min") || ""
          : movie.duration.min,
    },
    rating: {
      like:
        type == "add"
          ? localStorage.getItem("ratingDraft like") || 0
          : movie.rating.like,
      dislike:
        type == "add"
          ? localStorage.getItem("ratingDraft dislike") || 0
          : movie.rating.dislike,
      imdb:
        type == "add"
          ? localStorage.getItem("ratingDraft imdb") || ""
          : movie.rating.imdb,
    },
    country: {
      uz:
        type == "add"
          ? localStorage.getItem("countryDraft uz") || ""
          : movie.country.uz,
      ru:
        type == "add"
          ? localStorage.getItem("countryDraft ru") || ""
          : movie.country.ru,
      en:
        type == "add"
          ? localStorage.getItem("countryDraft en") || ""
          : movie.country.en,
    },
    credit: {
      uz:
        type == "add"
          ? localStorage.getItem("creditDraft uz") || ""
          : movie.credit.uz,
      ru:
        type == "add"
          ? localStorage.getItem("creditDraft ru") || ""
          : movie.credit.ru,
      en:
        type == "add"
          ? localStorage.getItem("creditDraft en") || ""
          : movie.credit.en,
    },
    image: {
      portrait:
        type == "add"
          ? localStorage.getItem("imageDraft portrait") || ""
          : movie.image.portrait,
      fullscreen:
        type == "add"
          ? localStorage.getItem("imageDraft fullscreen") || ""
          : movie.image.fullscreen,
    },
    status: {
      isNew:
        type == "add"
          ? localStorage.getItem("statusDraft isNew") || false
          : movie.status.isNew,
      isTrending:
        type == "add"
          ? localStorage.getItem("statusDraft isTrending") || false
          : movie.status.isTrending,
      type:
        type == "add"
          ? localStorage.getItem("statusDraft type") || ""
          : movie.status.type,
      isAvailable:
        type == "add"
          ? localStorage.getItem("statusDraft isAvailable") || true
          : movie.status.isAvailable,
    },
    movie: {
      uz:
        type == "add"
          ? localStorage.getItem("movieDraft uz") || ""
          : movie.movie.uz,
      ru:
        type == "add"
          ? localStorage.getItem("movieDraft ru") || ""
          : movie.movie.ru,
      en:
        type == "add"
          ? localStorage.getItem("movieDraft en") || ""
          : movie.movie.en,
    },
    trailer:
      type == "add"
        ? localStorage.getItem("trailerDraft") || ""
        : movie.trailer,
  });

  const [status, setStatus] = useState({
    isEmpty: false,
  });
  const navigate = useNavigate();

  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };

  const handleExtraInput = (e, parent) => {
    setStatus({ isEmpty: false });
    setMovieValue({
      ...movieValue,
      [parent]: {
        ...movieValue[parent],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleInput = (e) => {
    setStatus({ isEmpty: false });
    setMovieValue({
      ...movieValue,
      [e.target.name]: e.target.value,
    });
  };

  const isNotTrim =
    !movieValue.country.en.trim() ||
    !movieValue.country.ru.trim() ||
    !movieValue.country.uz.trim() ||
    !movieValue.credit.en.trim() ||
    !movieValue.credit.ru.trim() ||
    !movieValue.credit.uz.trim() ||
    !movieValue.description.en.trim() ||
    !movieValue.description.ru.trim() ||
    !movieValue.description.uz.trim() ||
    !movieValue.image.fullscreen.trim() ||
    !movieValue.image.portrait.trim() ||
    !movieValue.title.en.trim() ||
    !movieValue.title.ru.trim() ||
    !movieValue.title.uz.trim() ||
    !movieValue.releaseDate.day.trim() ||
    !movieValue.releaseDate.month.trim() ||
    !movieValue.releaseDate.year.trim() ||
    !movieValue.duration.hour.trim() ||
    !movieValue.duration.min.trim() ||
    movieValue.rating.like < 0 ||
    movieValue.rating.dislike < 0 ||
    !movieValue.rating.imdb.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ isEmpty: false });
    if (isNotTrim) {
      setStatus({ isEmpty: true });
    } else {
      if (type == "add") {
        addMovie(movieValue);
        removeLocalDraft();
      }
      editMovie(movie._id, movieValue);
    }
  };

  return (
    <section className="movie">
      {backButton(() => navigate(-1))}
      {status.isEmpty && snackbar("warning", t("pleaseFillFields"))}
      {statusEditMovie.isSuccess &&
        snackbar("success", t("MovieEditedSuccessfully"))}
      {statusEditMovie.isError && snackbar("danger", t("somethingWentWrong"))}
      {statusAddMovie.isSuccess &&
        snackbar("success", t("MovieAddedSuccessfully"))}
      {statusAddMovie.isError && snackbar("danger", t("somethingWentWrong"))}
      <div
        style={{
          position: "fixed",
          top: "80px",
          width: "100%",
          display: "flex",
          zIndex: "999",
        }}
      >
        <ToggleButtonGroup
          color="info"
          value={toggleValue.page}
          name="page"
          onChange={(e) => handleToggleValue(e, "page")}
          sx={{
            backgroundColor: "#fff",
            margin: "0 auto",
          }}
          exclusive
          aria-label="Platform"
        >
          <ToggleButton value="standart">{t("Standard")}</ToggleButton>
          <ToggleButton value="extra">{t("Extra")}</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <button
        onClick={(e) => handleSubmit(e)}
        disabled={
          isNotTrim ||
          statusEditMovie.isSuccess ||
          statusEditMovie.loading ||
          statusAddMovie.isSuccess ||
          statusAddMovie.loading
        }
        className={
          isNotTrim ||
          statusEditMovie.isSuccess ||
          statusEditMovie.loading ||
          statusAddMovie.isSuccess ||
          statusAddMovie.loading
            ? "admin-addmovie-btn disabled"
            : "admin-addmovie-btn"
        }
      >
        {statusEditMovie.loading || statusAddMovie.loading ? (
          "Loading..."
        ) : type == "edit" ? (
          <>
            <Edit />
            {t("Edit")}
          </>
        ) : (
          <>
            <AddIcon /> {t("Film qo'shish")}
          </>
        )}
      </button>
      {toggleValue.page == "standart" && (
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
                <ToggleButton value="portrait">{t("Portrait")}</ToggleButton>
                <ToggleButton value="fullscreen">
                  {t("FullScreen")}
                </ToggleButton>
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
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
                      }
                    />
                    <input
                      value={movieValue.releaseDate.month}
                      name="month"
                      type="text"
                      onChange={(e) => handleExtraInput(e, "releaseDate")}
                      placeholder={currentMonth}
                      className={
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
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
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
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
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
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
                        active
                          ? "admin-grade_input active"
                          : "admin-grade_input"
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
                  className={
                    active ? "admin-subtitle active" : "admin-subtitle"
                  }
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
          <div className="movie-video">
            <div className="movie-movie-container">
              <div className="admin-video">
                <ToggleButtonGroup
                  color="info"
                  value={toggleValue.video}
                  name="video"
                  onChange={(e) => handleToggleValue(e, "video")}
                  sx={{
                    backgroundColor: "gold",
                  }}
                  exclusive
                  aria-label="Platform"
                >
                  <ToggleButton value="movie">{t("movieText")}</ToggleButton>
                  <ToggleButton value="trailer">
                    {t("trailerText")}
                  </ToggleButton>
                </ToggleButtonGroup>
                {toggleValue.video == "movie" && (
                  <ToggleButtonGroup
                    color="info"
                    value={toggleValue.movie}
                    name="movie"
                    onChange={(e) => handleToggleValue(e, "movie")}
                    sx={{
                      backgroundColor: "#fff",
                      margin: "0 auto",
                    }}
                    exclusive
                    aria-label="Platform"
                  >
                    <ToggleButton value="uz">O'zbekcha</ToggleButton>
                    <ToggleButton value="ru">Русский</ToggleButton>
                    <ToggleButton value="en">English</ToggleButton>
                  </ToggleButtonGroup>
                )}
                <textarea
                  onChange={(e) =>
                    toggleValue.video == "movie"
                      ? handleExtraInput(e, "movie")
                      : handleInput(e)
                  }
                  name={
                    toggleValue.video == "movie"
                      ? toggleValue.movie
                      : toggleValue.video
                  }
                  value={
                    toggleValue.video == "movie"
                      ? movieValue.movie[toggleValue.movie]
                      : movieValue.trailer
                  }
                  placeholder={
                    toggleValue.video == "movie"
                      ? `Movie Link ${toggleValue.movie}`
                      : "Trailer Link"
                  }
                  width="100%"
                  className="movie-iframe admin-video-area"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
      {toggleValue.page == "extra" && (
        <div className="movie-container">
          <div className="admin-extra">
            <div className="admin-extra-status">
              <h1 className="admin-extra-status-title">{t("Status")}:</h1>
              <div className="admin-extra-status-props">
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">
                    {t("isNew")}:
                  </h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">
                      {t("isNew")}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="isNew"
                      value={movieValue.status.isNew}
                      label="isNew"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"true"}>True</MenuItem>
                      <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">
                    {t("isTrending")}:
                  </h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">
                      {t("isTrending")}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="isTrending"
                      value={movieValue.status.isTrending}
                      label="isTrending"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"true"}>True</MenuItem>
                      <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">
                    {t("type")}:
                  </h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">
                      {t("type")}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="type"
                      value={movieValue.status.type}
                      label="type"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"movie"}>{t("movieText")}</MenuItem>
                      <MenuItem value={"series"}>{t("SeriesTitle")}</MenuItem>
                      <MenuItem value={"cartoon"}>
                        {t("CartoonsTitle")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">
                    {t("isAvailable")}:
                  </h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">
                      {t("isAvailable")}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="isAvailable"
                      value={movieValue.status.isAvailable}
                      label="isAvailable"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"true"}>True</MenuItem>
                      <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className="admin-extra-notes">
              <h1 className="admin-extra-notes-title">{t("Notes")}:</h1>
              <div className="admin-extra-notes-main">
                <ToggleButtonGroup
                  color="info"
                  value={toggleValue.notes}
                  name="notes"
                  onChange={(e) => handleToggleValue(e, "notes")}
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
                <textarea
                  onChange={(e) => handleExtraInput(e, "notes")}
                  value={movieValue.notes[toggleValue.notes]}
                  name={toggleValue.notes}
                  placeholder={`Note for ${toggleValue.notes}`}
                  width="100%"
                  className="admin-extra-notes-area"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AddOrEditMovie;
