import React, { useEffect, useState } from "react";
import { dialog, snackbar } from "../utilities/defaultFunctions";
import { useNavigate, useParams } from "react-router-dom";
import { useMovie } from "../contexts/Movie";
import { Backdrop, CircularProgress } from "@mui/material";

function DeleteMovie() {
  const [open, setOpen] = useState(true);
  const { deleteMovie, statusDeleteMovie } = useMovie();
  const { movieId } = useParams();

  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const handleClick = () => {
    deleteMovie(movieId);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div>
      {statusDeleteMovie.isSuccess &&
        snackbar("success", "Movie deleted successfully")}
      {statusDeleteMovie.isError &&
        snackbar("error", "Error at deleting the movie")}
      {dialog(
        "Do you want to delete this movie?",
        "If you delete this movie then you can't return it",
        open,
        handleClose,
        handleClick
      )}
    </div>
  );
}

export default DeleteMovie;
