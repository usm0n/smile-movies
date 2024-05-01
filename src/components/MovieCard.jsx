import React from "react";
import { Link } from "react-router-dom";

function MovieCard({ movie, language }) {
  return (
    <Link to={`/${movie._id}`}>
      <div className="movies-card" key={movie._id}>
        <img
          src={movie.image.portrait}
          className="movies-img"
          alt={movie.title[language] + "image"}
        />
        <div className="movies-info">
          <h1 className="movies-name">
            {movie.title[language].substring(0, 25)}
          </h1>
          <span className="movies-date">
            <span className="movies-movie">{movie.releaseDate.year}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
