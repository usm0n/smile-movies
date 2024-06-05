import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAllMovies } from "../../../contexts/Movies";
import { language } from "../../../utilities/defaultFunctions";
import { useNavigate, useParams } from "react-router-dom";
import AddOrEditMovie from "../../../components/Admin/main/AddOrEditMovie";
import { useMovie } from "../../../contexts/Movie";
import { t } from "i18next";
import MovieSkeleton from "../../../components/Movie/Skeleton/index";

function EditMovie() {
  const { allMovies } = useAllMovies();
  const { movieById, getMovieById } = useMovie();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState();

  const { movieId } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.length) {
      navigate(`/admin/edit-movie/search/${searchValue}`);
    }
  };

  useEffect(() => {
    getMovieById(movieId);
  }, [movieId]);

  return !movieId ? (
    <div className="admin-edit-movie">
      <form onSubmit={handleSubmit} className="admin-edit-movie-search-bar">
        <h1 className="admin-edit-movie-search-bar-title">
          {t("enterMovieNameForEdit")}
        </h1>
        <Autocomplete
          sx={{
            backgroundColor: "#fff",
            width: "300px",
            margin: "0 auto",
            borderRadius: "5px",
          }}
          disableClearable
          freeSolo
          options={allMovies.movies}
          onChange={(e, value) => setSearchValue(value.title[language])}
          getOptionLabel={(option) => `${option.title[language]}`}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                type: "search",
              }}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("SearchPlaceholder")}
              type="text"
              className="nav-search_bar_down-input"
            />
          )}
        />
      </form>
    </div>
  ) : !movieById.isLoading ? (
    movieById.movie && <AddOrEditMovie type={"edit"} movie={movieById.movie} />
  ) : (
    <MovieSkeleton />
  );
}

export default EditMovie;
