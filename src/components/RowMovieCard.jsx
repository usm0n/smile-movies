import React from "react";
import { language } from "../utilities/defaultFunctions";
import Calendar from "../assets/icons/CalendarIcon";
import WatchLater from "@mui/icons-material/WatchLater";
import Star from "@mui/icons-material/Star";
import Public from "@mui/icons-material/Public";
import { Link } from "react-router-dom";

function RowMovieCard({ movie }) {
  return (
    <Link to={`/${movie._id}`} className="row-movie-card">
      <img src={movie.image.portrait} alt="" className="row-movie-card_img" />
      <div className="row-movie-card_info">
        <h1 className="row-movie-card_info-title">{movie.title[language]}</h1>
        <div className="row-movie-card_info_information">
          <h1>
            <Calendar /> {movie.releaseDate.year}
          </h1>
          <h1>
            <WatchLater /> {movie.duration.hour}:{movie.duration.min}:00
          </h1>
          <h1>
            <Star /> {movie.rating.imdb}
          </h1>
          <h1>
            <Public /> {movie.country[language]}
          </h1>
        </div>
      </div>
    </Link>
  );
}

export default RowMovieCard;
