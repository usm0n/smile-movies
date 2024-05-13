import { Autocomplete, TextField } from "@mui/material";
import React, { useState } from "react";
import { useAllMovies } from "../../../contexts/Movies";
import { language } from "../../../utilities/defaultFunctions";
import { useNavigate } from "react-router-dom";
import SearchEditMovie from "../../Search/EditMovie";

function EditMovie() {
  const { allMovies } = useAllMovies();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/admin/edit-movie/search/${searchValue}`);
  };

  return (
    <div className="admin-edit-movie">
      <form onSubmit={handleSubmit} className="admin-edit-movie-search-bar">
        <h1 className="admin-edit-movie-search-bar-title">
          Search for edit movie:
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
  );
}

export default EditMovie;
