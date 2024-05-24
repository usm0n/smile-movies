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
  });
  const handleToggleValue = (e, name) => {
    setToggleValue({
      ...toggleValue,
      [name]: e.target.value,
    });
  };

  const iframe = (
    <iframe
      src={movie.movie[toggleValue.movie]}
      width="100%"
      className="movie-iframe"
      allowFullScreen
    ></iframe>
  );
  return (
    <div className="movie-video">
      <div className="movie-video-language">
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
      <div className="movie-movie-container">
        {toggleValue.movie == "uz" && iframe}
        {toggleValue.movie == "ru" && iframe}
        {toggleValue.movie == "en" && iframe}
      </div>
    </div>
  );
}

export default MovieVideo;
