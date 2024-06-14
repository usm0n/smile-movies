import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import {
  backButton,
  fullSnackbar,
  language,
} from "../../utilities/defaultFunctions";
import { Helmet } from "react-helmet";
import MovieContent from "./MovieContent";
import MovieVideo from "./MovieVideo";
import MovieComments from "./MovieComments";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Movie({ movie, likeMovie, dislikeMovie, ratingLoading }) {
  const { isLoggedIn, user, isAdmin } = useUser();
  const [noteOpen, setNoteOpen] = useState(true);

  const navigate = useNavigate();

  return (
    <section key={movie._id} className="movie">
      <Helmet>
        <title>{movie.title.uz} - Smile Movies</title>
        <meta
          name="keywords"
          content={`${movie.title.uz}, ${movie.title.ru}, ${movie.title.en}, tomosha qilish, skachat, uzbek tilida`}
        />
        <meta
          name="description"
          content={`${
            movie.title.uz
          }ni faqat Smile filmlarida tomosha qiling. ${movie.description.uz.substring(
            0,
            20
          )}`}
        ></meta>
        <meta name="robots" content="index, follow"></meta>
      </Helmet>
      {backButton(() => navigate("/"))}
      {isAdmin.result && (
        <div className="movie-admin">
          <IconButton
            onClick={() => navigate(`/admin/edit-movie/${movie._id}`)}
            sx={{
              color: "white",
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => navigate(`/admin/delete-movie/${movie._id}`)}
            sx={{
              color: "white",
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )}
      {movie.notes[language] &&
        fullSnackbar("neutral", movie.notes[language], noteOpen == true, () =>
          setNoteOpen(false)
        )}

      <div className="movie-container">
        <MovieContent
          ratingLoading={ratingLoading}
          dislikeMovie={dislikeMovie}
          likeMovie={likeMovie}
          movie={movie}
          user={user}
          isLoggedIn={isLoggedIn}
        />
        <MovieVideo movie={movie} />
        <MovieComments
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          movie={movie}
          user={user}
        />
      </div>
    </section>
  );
}

export default Movie;
