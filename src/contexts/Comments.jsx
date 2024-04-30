import { createContext, useContext, useEffect, useState } from "react";
import comments from "../service/api/comments.api.service";

const CommentsContext = createContext({
  allComments: {
    isLoading: false,
    isError: false,
    isEmpty: false,
    comments: [],
  },
  getCommentId: () => {},
  getMovieId: () => {},
});

export const useComments = () => useContext(CommentsContext);

const CommentsProvider = ({ children }) => {
  const [allComments, setAllComments] = useState({
    isLoading: false,
    isError: false,
    isEmpty: false,
    comments: [],
  });
  const [commentId, setCommentId] = useState();
  const [movieId, setMovieId] = useState();

  const getCommentId = (commentId) => {
    setCommentId(commentId);
  };

  const getMovieId = (movieId) => {
    setMovieId(movieId);
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
    <CommentsContext.Provider value={{ getCommentId, allComments, getMovieId }}>
      {children}
    </CommentsContext.Provider>
  );
};

export default CommentsProvider;
