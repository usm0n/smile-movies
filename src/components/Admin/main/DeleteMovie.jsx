import React, { useEffect, useState } from "react";
import { dialog, snackbar } from "../../../utilities/defaultFunctions";
import { useNavigate, useParams } from "react-router-dom";
import { useMovie } from "../../../contexts/Movie";
import { Backdrop, CircularProgress } from "@mui/material";

function DeleteMovie() {
  const [openDialog, setOpenDialog] = useState(true);
  const { deleteMovie, statusDeleteMovie } = useMovie();
  const { movieId } = useParams();

  const navigate = useNavigate();

  const handleClose = () => {
    setOpenDialog(false);
    navigate(-1);
  };

  const handleClick = () => {
    setOpenDialog(false);
    deleteMovie(movieId);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return !statusDeleteMovie.loading ? (
    <div>
      {statusDeleteMovie.isSuccess &&
        snackbar("success", "Movie deleted successfully")}
      {statusDeleteMovie.isError &&
        snackbar("danger", "Error at deleting the movie")}
      {dialog(
        "Do you want to delete this movie?",
        "If you delete this movie then you can't return it",
        openDialog,
        handleClose,
        handleClick
      )}
    </div>
  ) : (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default DeleteMovie;
