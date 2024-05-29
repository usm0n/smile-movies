import React, { useEffect } from "react";
import Like from "@mui/icons-material/ThumbUpAltOutlined";
import DisLike from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ClearIcon from "@mui/icons-material/Clear";
import logo from "../../../assets/images/logo.png";
import { useComments } from "../../../contexts/Comments";
import { Avatar } from "@mui/material";
import { backdropLoading } from "../../../utilities/defaultFunctions";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";

function Comment({
  comment,
  index,
  isAdmin,
  likeComment,
  dislikeComment,
  setPostCommentComment,
  setEditComment,
}) {
  const { getCommentId, deleteComment, deleteCommentStatus } = useComments();

  useEffect(() => {
    getCommentId(comment._id);
  }, []);
  return (
    <div key={index} className="movie-comment">
      {backdropLoading(deleteCommentStatus.buttonLoading)}
      {/* {deleteCommentStatus.isSuccess && (
        <Snackbar open={open} autoHideDuration={6000}>
          <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
            Comment deleted successfully
          </Alert>
        </Snackbar>
      )}
      {deleteCommentStatus.isError && (
        <Snackbar open={open} autoHideDuration={6000}>
          <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
            Error at deleting comment
          </Alert>
        </Snackbar>
      )} */}
      {comment.isAdmin ? (
        <div className="movie-admin_img">
          <img className="movie-admin_image" src={logo} alt="" />
        </div>
      ) : (
        <Avatar
          sx={{
            width: 56,
            height: 56,
          }}
          className="movie-user_image"
        >
          {comment.firstname.slice(0, 1)}
        </Avatar>
      )}

      <div className="movie-comment_items">
        <div className="movie-comment-names">
          <h1 className="movie-comment_name">
            {comment.isAdmin ? "Admin" : comment.firstname}
          </h1>
          {comment.isAdmin && (
            <h1 className="movie-comment_name-admin">
              ( {comment.firstname} )
            </h1>
          )}
        </div>
        <p className="movie-comment_text">{comment.comment}</p>
        <div className="movie-buttons">
          <button
            onClick={() => likeComment(comment._id, comment)}
            className="movie-like"
          >
            {localStorage.getItem(`likeComment${comment._id}`) ? (
              <ThumbUp />
            ) : (
              <Like />
            )}
            {comment.like}
          </button>

          <button
            onClick={() => dislikeComment(comment._id, comment)}
            className="movie-dislike"
          >
            {localStorage.getItem(`dislikeComment${comment._id}`) ? (
              <ThumbDown />
            ) : (
              <DisLike />
            )}
            {comment.dislike}
          </button>
          {!localStorage.getItem(`comment${comment._id}`) && (
            <button
              onClick={() => setPostCommentComment(`${comment.firstname}, `)}
              className="movie-like"
            >
              <ReplyIcon />
            </button>
          )}
          {localStorage.getItem(`comment${comment._id}`) && (
            <button
              onClick={() => deleteComment()}
              className="movie-delete_btn"
            >
              <DeleteOutlineIcon />
            </button>
          )}
          {localStorage.getItem(`comment${comment._id}`) && (
            <button
              onClick={() => {
                setEditComment({
                  open: true,
                  commentId: comment._id,
                  firstname: comment.firstname,
                  comment: comment.comment,
                  isAdmin: comment.isAdmin,
                  like: comment.like,
                  dislike: comment.dislike,
                });
              }}
              className="movie-like"
            >
              <EditIcon />
            </button>
          )}
          {isAdmin.result && (
            <button
              onClick={() => deleteComment()}
              className="movie-delete_btn"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
