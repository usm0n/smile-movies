import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Link } from "react-router-dom";
import WatchLater from "@mui/icons-material/WatchLater";
import { language } from "../../utilities/defaultFunctions";

function SmallMovieCard({ movie, linkTo }) {
  return (
    <Link to={linkTo} className="new-movie_card">
      <img
        src={movie.image.portrait}
        className="new-movie_img"
        alt="Flash Movie"
      />
      <div className="new-movie_info">
        <h1 className="new-movie_name">
          {movie.title[language].substring(0, 20)}
          {movie.title[language].length > 20 ? "..." : ""}
        </h1>
        <p className="new-movie_parts">
          <WatchLater /> {movie.duration.hour}:{movie.duration.min}:00
        </p>
        <p className="new-movie_date">
          <CalendarMonthIcon />
          {movie.releaseDate.day}.{movie.releaseDate.month}.
          {movie.releaseDate.year}
        </p>
      </div>
    </Link>
  );
}

export default SmallMovieCard;
