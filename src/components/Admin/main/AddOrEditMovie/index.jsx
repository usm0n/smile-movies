import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  backButton,
  removeLocalDraft,
  snackbar,
} from "../../../../utilities/defaultFunctions";
import { useMovie } from "../../../../contexts/Movie";
import { useNavigate } from "react-router-dom";
import Edit from "@mui/icons-material/Edit";
import { t } from "i18next";
import AddIcon from "@mui/icons-material/Add";
import AddOrEditMovieStandard from "./standart";
import AddOrEditMovieExtra from "./extra";

function AddOrEditMovie({ movie, type }) {
  const { editMovie, statusEditMovie, addMovie, statusAddMovie } = useMovie();

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
    !movieValue.image.portrait.trim() ||
    !movieValue.title.en.trim() ||
    !movieValue.title.ru.trim() ||
    !movieValue.title.uz.trim() ||
    !movieValue.releaseDate.day.trim() ||
    !movieValue.releaseDate.month.trim() ||
    !movieValue.releaseDate.year.trim() ||
    movieValue.rating.like < 0 ||
    movieValue.rating.dislike < 0;

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
      <AddOrEditMovieStandard
        handleExtraInput={handleExtraInput}
        handleToggleValue={handleToggleValue}
        movieValue={movieValue}
        toggleValue={toggleValue}
        handleInput={handleInput}
      />
      <AddOrEditMovieExtra
        movieValue={movieValue}
        toggleValue={toggleValue}
        handleExtraInput={handleExtraInput}
        handleToggleValue={handleToggleValue}
      />
    </section>
  );
}

export default AddOrEditMovie;
