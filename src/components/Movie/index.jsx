import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/User";
import {
  backButton,
  language,
  snackbar,
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

  const navigate = useNavigate();

  return (
    <section key={movie._id} className="movie">
      <Helmet>
        <meta
          name="description"
          content="2024 yilning eng yaxshi yangi kinolari haqida barcha ma'lumotlarni bizning saytimizda toping."
        />
        <meta
          name="keywords"
          content={`${movie.title.uz}, ${movie.title.ru}, ${movie.title.en}`}
        />
        <title>{movie.title[language]} - Smile Movies</title>
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
      {movie.notes[language] && snackbar("info", movie.notes[language])}

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
