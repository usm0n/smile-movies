import { Box, Skeleton } from "@mui/material";
import React from "react";

function CommentSkeleton() {
  return (
    <Box className="movie-comment">
      <Skeleton
        variant="rectangular"
        sx={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "#ffffff2f",
        }}
        className="movie-user_image"
        alt="Commet's user"
      />

      <Box className="movie-comment_items">
        <Skeleton
          sx={{
            width: "100px",
            height: "20px",
            backgroundColor: "#ffffff2f",
          }}
          variant="rounded"
          className="movie-comment_name"
        ></Skeleton>
        <Skeleton
          sx={{
            width: "300px",
            height: "20px",
            backgroundColor: "#ffffff2f",
          }}
          variant="text"
          className="movie-comment_text"
        ></Skeleton>
        <Box className="movie-buttons">
          <Skeleton
            sx={{
              width: "20px",
              height: "20px",
              backgroundColor: "#ffffff2f",
            }}
            variant="rectangular"
            className="movie-like_btn"
          ></Skeleton>
          <Skeleton
            sx={{
              width: "20px",
              height: "20px",
              backgroundColor: "#ffffff2f",
            }}
            variant="rectangular"
            className="movie-like_btn"
          ></Skeleton>
        </Box>
      </Box>
    </Box>
  );
}

export default CommentSkeleton;
