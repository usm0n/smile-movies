import { createContext, useContext, useEffect, useState } from "react";

const CommentsContext = createContext({
  comments: {
    isLoading: false,
    isError: false,
    isEmpty: false,
    comments: [],
  },
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

  const getCommentId = (commentId) => {
    setCommentId(commentId);
  };

  useEffect(() => {
    setAllComments({
        isLoading: true,
        isError: false,
        isEmpty: false,
        comments: [],
    })
  }, [])

  return (
    <CommentsContext.Provider value={{ getCommentId, allComments }}>
      {children}
    </CommentsContext.Provider>
  );
};
