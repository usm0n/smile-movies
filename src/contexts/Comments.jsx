import { createContext, useContext, useEffect, useState } from "react";
import comments from "../service/api/comments.api.service";

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
  getCommentId: (commentId) => {},
  getMovieId: (movieId) => {},
  postComment: (firstname, comment) => {},
  deleteComment: () => {},
});

export const useComments = () => useContext(CommentsContext);
const CommentsProvider = ({ children }) => {
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
  const [commentId, setCommentId] = useState();
  const [movieId, setMovieId] = useState();

  const getCommentId = (commentId) => {
    setCommentId(commentId);
  };

  const getMovieId = (movieId) => {
    setMovieId(movieId);
  };

  const postComment = async (firstname, comment) => {
    setPostCommentStatus({
      buttonLoading: true,
      isError: false,
      isSuccess: false,
    });
    await comments
      .postComment(movieId, { firstname: firstname, comment: comment })
      .then((res) => {
        console.log(res);
        setPostCommentStatus({
          buttonLoading: false,
          isError: false,
          isSuccess: true,
        });
      })
      .catch(() => {
        setPostCommentStatus({
          buttonLoading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  const deleteComment = async () => {
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
      })
      .catch(() => {
        setDeleteCommentStatus({
          buttonLoading: false,
          isError: true,
          isSuccess: false,
        });
      });
  };

  useEffect(() => {
    setAllComments({
      isLoading: true,
      isError: false,
      isEmpty: false,
      comments: [],
    });
    comments
      .getComments(movieId)
      .then((comment) => {
        console.log(comment);
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
  }, [movieId]);

  return (
    <CommentsContext.Provider
      value={{
        getCommentId,
        allComments,
        getMovieId,
        postComment,
        postCommentStatus,
        deleteComment,
        deleteCommentStatus,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export default CommentsProvider;
