import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAllMovies } from "../../../contexts/Movies";
import { language } from "../../../utilities/defaultFunctions";
import { useNavigate, useParams } from "react-router-dom";
import SearchEditMovie from "../../Search/EditMovie";
import EditMovieComp from "../../../components/EditMovie";
import { useMovie } from "../../../contexts/Movie";

function EditMovie() {
  const { allMovies } = useAllMovies();
  const { getMovieId, movieById } = useMovie();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState();

  const { movieId } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.length > 3) {
      navigate(`/admin/edit-movie/search/${searchValue}`);
    }
  };

  useEffect(() => {
    getMovieId(movieId);
  }, []);

  return !movieId ? (
    <div className="admin-edit-movie">
      <form onSubmit={handleSubmit} className="admin-edit-movie-search-bar">
        <h1 className="admin-edit-movie-search-bar-title">
          Enter Movie Name that you want to edit
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
              placeholder="Search"
              type="text"
              className="nav-search_bar_down-input"
            />
          )}
        />
      </form>
    </div>
  ) : (
    !movieById.isLoading && movieById.movie && (
      <EditMovieComp movie={movieById.movie} />
    )
  );
}

export default EditMovie;
