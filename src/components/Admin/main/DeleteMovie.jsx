import React, { useState } from "react";
import { dialog, snackbar } from "../../../utilities/defaultFunctions";
import { useNavigate, useParams } from "react-router-dom";
import { useMovie } from "../../../contexts/Movie";
import { Backdrop, CircularProgress } from "@mui/material";
import { t } from "i18next";

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
        snackbar("success", t("movieDeletedSuccessfully"))}
      {statusDeleteMovie.isError &&
        snackbar("danger", t("somethingWentWrong"))}
      {dialog(
        t("DoYouWantToDeleteThisMovie"),
        t("IfYouDeleteDesc"),
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
