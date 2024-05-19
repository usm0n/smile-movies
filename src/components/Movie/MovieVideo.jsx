import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { language } from "../../utilities/defaultFunctions";
import { t } from "i18next";

function MovieVideo({ movie }) {
  const [toggleValue, setToggleValue] = useState({
    movie: !movie.movie[language]
      ? movie.movie.uz
        ? "uz"
        : movie.movie.ru
        ? "ru"
        : movie.movie.en
        ? "en"
        : ""
      : language,
    video: "movie",
  });
  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };
  return (
    <div className="movie-video">
      {toggleValue.video == "movie" && (
        <div className="movie-video-language">
          <h1 className="movie-video-language-text">{t("languageText")}</h1>
          <ToggleButtonGroup
            color="info"
            value={toggleValue.movie}
            name="movie"
            onChange={(e) => handleToggleValue(e, "movie")}
            sx={{
              backgroundColor: "#fff",
            }}
            exclusive
            aria-label="Platform"
          >
            <ToggleButton disabled={!movie.movie.uz} value="uz">
              O'zbekcha
            </ToggleButton>
            <ToggleButton disabled={!movie.movie.ru} value="ru">
              Русский
            </ToggleButton>
            <ToggleButton disabled={!movie.movie.en} value="en">
              English
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}
      <div className="movie-movie-container">
        <ToggleButtonGroup
          color="info"
          value={toggleValue.video}
          name="video"
          onChange={(e) => handleToggleValue(e, "video")}
          sx={{
            backgroundColor: "#fff",
          }}
          exclusive
          aria-label="Platform"
        >
          <ToggleButton value="movie">{t("movieText")}</ToggleButton>
          <ToggleButton value="trailer">{t("trailerText")}</ToggleButton>
        </ToggleButtonGroup>
        <iframe
          src={
            toggleValue.video == "movie"
              ? movie.movie[toggleValue.movie]
              : movie.trailer
          }
          width="100%"
          className="movie-iframe"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default MovieVideo;
