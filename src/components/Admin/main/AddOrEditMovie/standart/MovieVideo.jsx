import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { t } from "i18next";

function MovieVideo({ toggleValue, handleToggleValue, handleExtraInput, handleInput, movieValue }) {
  return (
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
            <ToggleButton value="trailer">{t("trailerText")}</ToggleButton>
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
  );
}

export default MovieVideo;
