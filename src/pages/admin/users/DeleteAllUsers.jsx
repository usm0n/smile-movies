import React, { useState } from "react";
import {
  backdropLoading,
  formDialog,
  snackbar,
} from "../../../utilities/defaultFunctions";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useUser } from "../../../contexts/User";
import { useAllUsers } from "../../../contexts/Users";

function DeleteAllUsers() {
  const { deleteAllUsers, statusDeleteAllUsers } = useAllUsers();
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
      deleteAllUsers();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(true);
    }
  };
  return !statusDeleteAllUsers.isLoading ? (
    <>
      {statusDeleteAllUsers.isSuccess &&
        snackbar("success", t("DeleteAllUsersSuccess"))}
      {statusDeleteAllUsers.isError &&
        snackbar("danger", t("somethingWentWrong"))}
      {error && snackbar("danger", t("IncorrectVerificationCode"))}
      {formDialog(
        openDialog,
        handleClose,
        t("DeleteAllUsersConfirm"),
        t("DeleteAllUsersDesc"),
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

export default DeleteAllUsers;
