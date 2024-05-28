import React, { useState } from "react";
import {
  backdropLoading,
  formDialog,
  snackbar,
} from "../../../utilities/defaultFunctions";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useAllMovies } from "../../../contexts/Movies";
import { useUser } from "../../../contexts/User";

function DeleteAllMovies() {
  const { deleteAllMovies, statusDeleteAllMovies } = useAllMovies();
  const { user } = useUser();
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [openDialog, setOpenDialog] = useState(true);

  const navigate = useNavigate();
  const handleClose = () => {
    setOpenDialog(false);
    navigate(-1);
  };
  const handleClick = () => {
    if (!password) {
      setOpenDialog(true);
      return;
    } else if (password == user.password) {
      setOpenDialog(false);
      deleteAllMovies();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(true);
    }
  };
  return !statusDeleteAllMovies.isLoading ? (
    <>
      {statusDeleteAllMovies.isSuccess &&
        snackbar("success", t("DeleteAllMoviesSuccess"))}
      {statusDeleteAllMovies.isError &&
        snackbar("danger", t("somethingWentWrong"))}
      {error && snackbar("danger", t("IncorrectVerificationCode"))}
      {formDialog(
        openDialog,
        handleClose,
        t("DeleteAllMoviesConfirm"),
        t("DeleteAllMoviesDesc"),
        "password",
        t("password"),
        handleClick,
        (e) => {
          e.preventDefault();
          setPassword(e.target.value);
        }
      )}
    </>
  ) : (
    backdropLoading(open)
  );
}

export default DeleteAllMovies;
