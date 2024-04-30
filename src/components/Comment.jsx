import React from "react";
import User from "../assets/images/user.png";
import Like from "../assets/icons/Like";
import DisLike from "../assets/icons/DisLike";

function Comment({ comment }) {
  return (
    <div className="movie-comment">
      <img src={User} className="movie-user_image" alt="Commet's user" />

      <div className="movie-comment_items">
        <h1 className="movie-comment_name">
          {comment.firstname} {comment.lastname}
        </h1>
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
        </div>
      </div>
    </div>
  );
}

export default Comment;
