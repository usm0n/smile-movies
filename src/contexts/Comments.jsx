import { createContext, useContext, useState } from "react";
import comments from "../service/api/comments.api.service";
import { useUser } from "./User";

const CommentsContext = createContext({
  allComments: {
    isLoading: false,
    isError: false,
    isEmpty: false,
    comments: [],
  },
  postCommentStatus: {
    buttonLoading: false,
    isError: false,
    isSuccess: false,
  },
  deleteCommentStatus: {
    buttonLoading: false,
    isError: false,
    isSuccess: false,
  },
  updateCommentStatus: {
    loading: false,
    isError: false,
    isSuccess: false,
  },
  ratingLoading: false,
  getComments: (movieId) => {},
  postComment: (movieId, firstname, comment) => {},
  deleteComment: (movieId, commentId) => {},
  updateComment: (movieId, commentId, data) => {},
  likeComment: (movieId, commentId, comment) => {},
  dislikeComment: (movieId, commentId, comment) => {},
});

export const useComments = () => useContext(CommentsContext);
const CommentsProvider = ({ children }) => {
  const { isAdmin } = useUser();
  const [allComments, setAllComments] = useState({
    isLoading: false,
    isError: false,
    isEmpty: false,
    comments: [],
  });
  const [deleteCommentStatus, setDeleteCommentStatus] = useState({
    buttonLoading: false,
    isError: false,
    isSuccess: false,
  });
  const [postCommentStatus, setPostCommentStatus] = useState({
    buttonLoading: false,
    isError: false,
    isSuccess: false,
  });
  const [updateCommentStatus, setUpdateCommentStatus] = useState({
    loading: false,
    isError: false,
    isSuccess: false,
  });
  const [ratingLoading, setRatingLoading] = useState();

  const getComments = async (movieId) => {
    setAllComments({
      isLoading: true,
      isError: false,
      isEmpty: false,
      comments: [],
    });
    comments
      .getComments(movieId)
      .then((comment) => {
        if (!comment.data) {
          if (comment.response.data.message == "Comments not found") {
            setAllComments({
              isLoading: false,
              isError: false,
              isEmpty: true,
              comments: [],
            });
          } else {
            setAllComments({
              isLoading: false,
              isError: true,
              isEmpty: false,
              comments: [],
            });
          }
        } else {
          setAllComments({
            isLoading: false,
            isError: false,
            isEmpty: false,
            comments: comment.data,
          });
        }
      })
      .catch(() => {
        setAllComments({
          isLoading: false,
          isError: true,
          isEmpty: false,
          comments: [],
        });
      });
  };

  const postComment = async (movieId, firstname, comment) => {
    setPostCommentStatus({
      buttonLoading: true,
      isError: false,
      isSuccess: false,
    });
    await comments
      .postComment(movieId, {
        firstname: firstname,
        comment: comment,
        isAdmin: isAdmin.result,
      })
      .then((res) => {
        setPostCommentStatus({
          buttonLoading: false,
          isError: false,
          isSuccess: true,
        });
        localStorage.setItem(`comment${res.data.comment._id}`, "posted");
      })
      .catch(() => {
        setPostCommentStatus({
          buttonLoading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  const deleteComment = async (movieId, commentId) => {
    setDeleteCommentStatus({
      buttonLoading: true,
      isError: false,
      isSuccess: false,
    });
    await comments
      .deleteComment(movieId, commentId)
      .then(() => {
        setDeleteCommentStatus({
          buttonLoading: false,
          isError: false,
          isSuccess: true,
        });
        localStorage.removeItem(`comment${commentId}`);
        window.location.reload();
      })
      .catch(() => {
        setDeleteCommentStatus({
          buttonLoading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  const updateComment = async (movieId, commentId, data) => {
    setUpdateCommentStatus({
      loading: true,
      isError: false,
      isSuccess: false,
    });
    await comments
      .updateComment(movieId, commentId, data)
      .then(() => {
        setUpdateCommentStatus({
          loading: false,
          isError: false,
          isSuccess: true,
        });
      })
      .catch(() => {
        setUpdateCommentStatus({
          loading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  const likeComment = async (movieId, commentId, comment) => {
    setRatingLoading(true);
    await comments
      .updateComment(movieId, commentId, {
        firstname: comment.firstname,
        comment: comment.comment,
        isAdmin: comment.isAdmin,
        like: localStorage.getItem(`likeComment${commentId}`)
          ? comment.like - 1
          : comment.like + 1,
        dislike: localStorage.getItem(`dislikeComment${commentId}`)
          ? comment.dislike - 1
          : comment.dislike,
      })
      .then(() => {
        localStorage.getItem(`likeComment${commentId}`)
          ? localStorage.removeItem(`likeComment${commentId}`)
          : localStorage.setItem(`likeComment${commentId}`, true);
        localStorage.getItem(`dislikeComment${commentId}`)
          ? localStorage.removeItem(`dislikeComment${commentId}`)
          : null;
        setRatingLoading(false);
        window.location.reload();
      });
  };

  const dislikeComment = async (movieId, commentId, comment) => {
    setRatingLoading(true);
    await comments
      .updateComment(movieId, commentId, {
        firstname: comment.firstname,
        comment: comment.comment,
        isAdmin: comment.isAdmin,
        like: localStorage.getItem(`likeComment${commentId}`)
          ? comment.like - 1
          : comment.like,
        dislike: localStorage.getItem(`dislikeComment${commentId}`)
          ? comment.dislike - 1
          : comment.dislike + 1,
      })
      .then(() => {
        localStorage.getItem(`likeComment${commentId}`)
          ? localStorage.removeItem(`likeComment${commentId}`)
          : null;
        localStorage.getItem(`dislikeComment${commentId}`)
          ? localStorage.removeItem(`dislikeComment${commentId}`)
          : localStorage.setItem(`dislikeComment${commentId}`, true);
        setRatingLoading(false);
        window.location.reload();
      });
  };

  return (
    <CommentsContext.Provider
      value={{
        allComments,
        postComment,
        postCommentStatus,
        deleteComment,
        deleteCommentStatus,
        updateComment,
        updateCommentStatus,
        dislikeComment,
        likeComment,
        ratingLoading,
        getComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export default CommentsProvider;
