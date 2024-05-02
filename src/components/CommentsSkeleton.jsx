import { Box, Grid, Skeleton } from "@mui/material";
import React from "react";
import CommentSkeleton from "./CommentSkeleton";

function CommentsSkeleton() {
  return (
    <Box className="movie-comments">
      <Skeleton
        sx={{
          width: "200px",
          height: "50px",
          backgroundColor: "#ffffff2f",
        }}
        className="movie-comments-title"
      ></Skeleton>
      <Box className="movie-comments-posting">
        <Skeleton
          sx={{
            width: "100%",
            height: "40px",
            backgroundColor: "#ffffff2f",
            border: "none",
          }}
          variant="rectangular"
          className="movie-comments-posting-input"
        />
        <Skeleton
          sx={{
            height: "170px",
            backgroundColor: "#ffffff2f",
            border: "none",
          }}
          variant="rectangular"
          className="movie-comments-posting-area"
        ></Skeleton>
        <Skeleton
          sx={{
            width: "200px",
            height: "50px",
            backgroundColor: "#ffffff2f",
            border: "none",
          }}
          variant="rectangular"
          className={"movie-comments-posting-button"}
        ></Skeleton>
      </Box>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CommentSkeleton />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CommentSkeleton />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CommentSkeleton />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CommentSkeleton />
      </Grid>
    </Box>
  );
}

export default CommentsSkeleton;
