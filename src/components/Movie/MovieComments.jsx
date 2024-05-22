import React, { useEffect, useState } from "react";
import { useComments } from "../../contexts/Comments";
import { t } from "i18next";
import { snackbar } from "../../utilities/defaultFunctions";
import Comment from "./Comment/index";

function MovieComments({ movie, user, isLoggedIn}) {
  const { getMovieId, allComments, postComment, postCommentStatus } =
    useComments();

  const [postCommentComment, setPostCommentComment] = useState();
  const [postCommentName, setPostCommentName] = useState(user.firstname);

  useEffect(() => {
    getMovieId(movie._id);
  }, []);
  return (
    <div className="movie-comments">
      <h1 className="movie-comments-title">{t("CommentsTitle")}</h1>
      <div className="movie-comments-posting">
        {postCommentStatus.isSuccess &&
          snackbar("success", "Your comment posted successfully")}
        {postCommentStatus.isError &&
          snackbar("danger", "An error has occurred")}
        {!isLoggedIn && (
          <input
            onChange={(e) => setPostCommentName(e.target.value)}
            value={postCommentName}
            className="movie-comments-posting-input"
            placeholder={t("CommentsNameInputPlaceholder")}
            type="text"
          />
        )}
        <textarea
          onChange={(e) => setPostCommentComment(e.target.value)}
          value={postCommentComment}
          className="movie-comments-posting-area"
          placeholder={t("CommentInputPlaceholder")}
        ></textarea>
        <button
          disabled={
            !postCommentComment ||
            !postCommentName ||
            postCommentStatus.buttonLoading ||
            postCommentStatus.isSuccess
          }
          onClick={() => {
            postComment(postCommentName, postCommentComment);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }}
          className={
            !postCommentComment ||
            !postCommentName ||
            postCommentStatus.buttonLoading ||
            postCommentStatus.isSuccess
              ? "movie-comments-posting-button disabled"
              : "movie-comments-posting-button"
          }
        >
          {postCommentStatus.buttonLoading && "Loading..."}
          {!postCommentStatus.buttonLoading && t("SendCommentButtonText")}
        </button>
      </div>
      {allComments.isEmpty ? (
        <h1 className="movie-comments-empty-text">{t("NoComments")}</h1>
      ) : (
        !allComments.isLoading &&
        allComments.comments &&
        allComments.comments.map((comment, index) => {
          return <Comment comment={comment} index={index}/>;
        })
      )}
    </div>
  );
}

export default MovieComments;
