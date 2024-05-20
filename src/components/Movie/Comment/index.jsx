import React, { useEffect } from "react";
import Like from "../../../assets/icons/Like";
import DisLike from "../../../assets/icons/DisLike";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import logo from "../../../assets/images/logo.png";
import { useComments } from "../../../contexts/Comments";
import {
  Alert,
  Avatar,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";

function Comment({ comment, index }) {
  const { getCommentId, deleteComment, deleteCommentStatus } = useComments();

  useEffect(() => {
    // getCommentId(comment._id);
  }, []);
  return (
    <div key={index} className="movie-comment">
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
          <button className="movie-like_btn">
            <Like />
            {comment.like}
          </button>

          <button className="movie-like_btn">
            <DisLike />
            {comment.dislike}
          </button>

          {/* <button onClick={() => deleteComment()} className="movie-delete_btn">
            {deleteCommentStatus.buttonLoading ? (
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={open}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            ) : (
              <DeleteOutlineIcon />
            )}
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Comment;
