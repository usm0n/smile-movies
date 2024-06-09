import React from "react";
import MovieContent from "./MovieContent";
import MovieVideo from "./MovieVideo";

function AddOrEditMovieStandard({
  toggleValue,
  handleToggleValue,
  handleExtraInput,
  movieValue,
  handleInput,
}) {
  return (
    toggleValue.page == "standart" && (
      <div className="movie-container">
        <MovieContent
          handleExtraInput={handleExtraInput}
          handleToggleValue={handleToggleValue}
          toggleValue={toggleValue}
          movieValue={movieValue}
        />
        <MovieVideo
          handleExtraInput={handleExtraInput}
          handleInput={handleInput}
          handleToggleValue={handleToggleValue}
          movieValue={movieValue}
          toggleValue={toggleValue}
        />
      </div>
    )
  );
}

export default AddOrEditMovieStandard;
