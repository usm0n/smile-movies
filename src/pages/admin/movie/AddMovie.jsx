import React, { Children, useState } from "react";
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
import { LoadingButton } from "@mui/lab";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Favourite from "../../../assets/icons/SolidStarIcon";
import PublicIcon from "@mui/icons-material/Public";
import Calendar from "../../../assets/icons/CalendarIcon";
import AddIcon from "@mui/icons-material/Add";
import {
  currentDay,
  currentMonth,
  currentYear,
  removeLocalDraft,
  setUserId,
  snackbar,
} from "../../../utilities/defaultFunctions";
import { useMovie } from "../../../contexts/Movie";

function AddMovie() {
  const [active, setActive] = useState(false);
  const [toggleValue, setToggleValue] = useState({
    image: "portrait",
    title: "uz",
    video: "movie",
    page: "standart",
    notes: "uz",
  });
  const [addMovieValue, setAddMovieValue] = useState({
    title: {
      uz: localStorage.getItem("titleDraft uz") || "",
      ru: localStorage.getItem("titleDraft ru") || "",
      en: localStorage.getItem("titleDraft en") || "",
    },
    notes: {
      uz: localStorage.getItem("notesDraft uz") || "",
      ru: localStorage.getItem("notesDraft ru") || "",
      en: localStorage.getItem("notesDraft en") || "",
    },
    description: {
      uz: localStorage.getItem("descriptionDraft uz") || "",
      ru: localStorage.getItem("descriptionDraft ru") || "",
      en: localStorage.getItem("descriptionDraft en") || "",
    },
    releaseDate: {
      day: localStorage.getItem("releaseDateDraft day") || "",
      month: localStorage.getItem("releaseDateDraft month") || "",
      year: localStorage.getItem("releaseDateDraft year") || "",
    },
    duration: {
      hour: localStorage.getItem("durationDraft hour") || "",
      min: localStorage.getItem("durationDraft min") || "",
    },
    rating: {
      like: localStorage.getItem("ratingDraft like") || 0,
      dislike: localStorage.getItem("ratingDraft dislike") || 0,
      imdb: localStorage.getItem("ratingDraft imdb") || "N/A",
    },
    country: {
      uz: localStorage.getItem("countryDraft uz") || "",
      ru: localStorage.getItem("countryDraft ru") || "",
      en: localStorage.getItem("countryDraft en") || "",
    },
    credit: {
      uz: localStorage.getItem("creditDraft uz") || "",
      ru: localStorage.getItem("creditDraft ru") || "",
      en: localStorage.getItem("creditDraft en") || "",
    },
    image: {
      portrait: localStorage.getItem("imageDraft portrait") || "",
      fullscreen: localStorage.getItem("imageDraft fullscreen") || "",
    },
    status: {
      isNew: localStorage.getItem("statusDraft isNew") || "",
      isTrending: localStorage.getItem("statusDraft isTrending") || "",
      type: localStorage.getItem("statusDraft type") || "",
    },
    movie: localStorage.getItem("movieDraft") || "",
    trailer: localStorage.getItem("trailerDraft") || "",
  });

  const [status, setStatus] = useState({
    isEmpty: false,
  });

  const { addMovie, statusAddMovie } = useMovie();

  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };

  const handleExtraInput = (e, parent) => {
    setStatus({ isEmpty: false });
    setAddMovieValue({
      ...addMovieValue,
      [parent]: {
        ...addMovieValue[parent],
        [e.target.name]: e.target.value,
      },
    });
    localStorage.setItem(`${parent}Draft ${e.target.name}`, e.target.value);
  };

  const handleInput = (e) => {
    setStatus({ isEmpty: false });
    setAddMovieValue({
      ...addMovieValue,
      [e.target.name]: e.target.value,
    });
    localStorage.setItem(`${e.target.name}Draft`, e.target.value);
  };

  const isNotTrim =
    !addMovieValue.country.en.trim() ||
    !addMovieValue.country.ru.trim() ||
    !addMovieValue.country.uz.trim() ||
    !addMovieValue.credit.en.trim() ||
    !addMovieValue.credit.ru.trim() ||
    !addMovieValue.credit.uz.trim() ||
    !addMovieValue.description.en.trim() ||
    !addMovieValue.description.ru.trim() ||
    !addMovieValue.description.uz.trim() ||
    !addMovieValue.image.fullscreen.trim() ||
    !addMovieValue.image.portrait.trim() ||
    !addMovieValue.movie.trim() ||
    !addMovieValue.title.en.trim() ||
    !addMovieValue.title.ru.trim() ||
    !addMovieValue.title.uz.trim() ||
    !addMovieValue.releaseDate.day.trim() ||
    !addMovieValue.releaseDate.month.trim() ||
    !addMovieValue.releaseDate.year.trim() ||
    !addMovieValue.trailer.trim() ||
    !addMovieValue.duration.hour.trim() ||
    !addMovieValue.duration.min.trim() ||
    addMovieValue.rating.like < 0 ||
    addMovieValue.rating.dislike < 0 ||
    !addMovieValue.rating.imdb.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ isEmpty: false });
    if (isNotTrim) {
      setStatus({ isEmpty: true });
    } else {
      addMovie(addMovieValue);
      removeLocalDraft();
    }
  };

  return (
    <section className="movie">
      {status.isEmpty && snackbar("warning", "Please fill all fields")}
      {statusAddMovie.isSuccess &&
        snackbar("success", "Movie added successfully")}
      {statusAddMovie.isError && snackbar("error", "Something went wrong")}
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
          <ToggleButton value="standart">Standart</ToggleButton>
          <ToggleButton value="extra">Extra</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <button
        onClick={(e) => handleSubmit(e)}
        disabled={
          isNotTrim || statusAddMovie.isSuccess || statusAddMovie.loading
        }
        className={
          isNotTrim || statusAddMovie.isSuccess || statusAddMovie.loading
            ? "admin-addmovie-btn disabled"
            : "admin-addmovie-btn"
        }
      >
        {statusAddMovie.loading ? (
          "Loading..."
        ) : (
          <>
            <AddIcon /> Add Movie
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
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
                      }
                    />
                    <input
                      value={addMovieValue.releaseDate.month}
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
                        active
                          ? "admin-month_input active"
                          : "admin-month_input"
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
                      value={addMovieValue.rating.imdb}
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
                  className={
                    active ? "admin-subtitle active" : "admin-subtitle"
                  }
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
                  <ToggleButton value="movie">Movie</ToggleButton>
                  <ToggleButton value="trailer">Trailer</ToggleButton>
                </ToggleButtonGroup>
                <textarea
                  onChange={(e) => handleInput(e)}
                  name={toggleValue.video}
                  value={
                    toggleValue.video == "movie"
                      ? addMovieValue.movie
                      : addMovieValue.trailer
                  }
                  placeholder={
                    toggleValue.video == "movie" ? "Movie Link" : "Trailer Link"
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
              <h1 className="admin-extra-status-title">Status:</h1>
              <div className="admin-extra-status-props">
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">isNew:</h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">isNew</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="isNew"
                      value={addMovieValue.status.isNew}
                      label="isNew"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"true"}>True</MenuItem>
                      <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">isTrending:</h1>
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
                      isTrending
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="isTrending"
                      value={addMovieValue.status.isTrending}
                      label="isTrending"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"true"}>True</MenuItem>
                      <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="admin-extra-status-prop">
                  <h1 className="admin-extra-status-prop-title">Type:</h1>
                  <FormControl
                    variant="filled"
                    sx={{
                      m: 1,
                      minWidth: 120,
                      backgroundColor: "#fff",
                      borderRadius: "5px",
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">Type</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="type"
                      value={addMovieValue.status.type}
                      label="type"
                      onChange={(e) => handleExtraInput(e, "status")}
                    >
                      <MenuItem value={"movie"}>Movie</MenuItem>
                      <MenuItem value={"series"}>Series</MenuItem>
                      <MenuItem value={"cartoon"}>Cartoon</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className="admin-extra-notes">
              <h1 className="admin-extra-notes-title">Notes:</h1>
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
                  <ToggleButton value="uz">Uzbek</ToggleButton>
                  <ToggleButton value="ru">Russian</ToggleButton>
                  <ToggleButton value="en">English</ToggleButton>
                </ToggleButtonGroup>
                <textarea
                  onChange={(e) => handleExtraInput(e, "notes")}
                  value={addMovieValue.notes[toggleValue.notes]}
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

export default AddMovie;
