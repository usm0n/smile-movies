import { Box, Skeleton } from "@mui/material";
import React from "react";

function MovieSkeleton() {
  return (
    <Box className="movie">
      <Box className="movie-container">
        <Box className="movie-content">
          <Skeleton
            variant="rectangular"
            animation="pulse"
            sx={{
              backgroundColor: "#ffffff2f",
              width: "350px",
              height: "550px",
            }}
            alt="movie photo"
            className="movie-img"
          />
          <Box className="movie-info">
            <Box className="movie-text">
              <Box className="movie-first-section">
                <Skeleton
                  variant="text"
                  sx={{
                    width: "350px",
                    height: "70px",
                    backgroundColor: "#ffffff2f",
                  }}
                  className="movie-name"
                ></Skeleton>
                <Box className="movie-like-dislike">
                  <Skeleton
                    variant="rounded"
                    sx={{
                      width: "25px",
                      height: "30px",
                      backgroundColor: "#ffffff2f",
                    }}
                    className="movie-like"
                  ></Skeleton>
                  <Skeleton
                    variant="rounded"
                    sx={{
                      width: "25px",
                      height: "30px",
                      backgroundColor: "#ffffff2f",
                    }}
                    className="movie-dislike"
                  ></Skeleton>
                </Box>
              </Box>
              <Box className="movie-number_info">
                <Box className="movie-info_title">
                  <Skeleton
                    sx={{
                      width: "120px",
                      height: "35px",
                      backgroundColor: "#ffffff2f",
                    }}
                  ></Skeleton>
                </Box>

                <Box className="movie-info_title">
                  <Skeleton
                    sx={{
                      width: "110px",
                      height: "35px",
                      backgroundColor: "#ffffff2f",
                    }}
                  ></Skeleton>
                </Box>

                <Box className="movie-info_title">
                  <Skeleton
                    sx={{
                      width: "80px",
                      height: "35px",
                      backgroundColor: "#ffffff2f",
                    }}
                  ></Skeleton>
                </Box>
                <Box className="movie-info_title">
                  <Skeleton
                    sx={{
                      width: "90px",
                      height: "35px",
                      backgroundColor: "#ffffff2f",
                    }}
                  ></Skeleton>
                </Box>
                <Box className="movie-info_title">
                  <Skeleton
                    sx={{
                      width: "120px",
                      height: "35px",
                      backgroundColor: "#ffffff2f",
                    }}
                  ></Skeleton>
                </Box>
              </Box>

              <Box className="movie-subtitle">
                <Skeleton
                  sx={{
                    width: "100%",
                    height: "30px",
                    backgroundColor: "#ffffff2f",
                  }}
                ></Skeleton>
                <Skeleton
                  sx={{
                    width: "100%",
                    height: "30px",
                    backgroundColor: "#ffffff2f",
                  }}
                ></Skeleton>
                <Skeleton
                  sx={{
                    width: "60%",
                    height: "30px",
                    backgroundColor: "#ffffff2f",
                  }}
                ></Skeleton>
              </Box>
            </Box>
            <Box className="movie-btns">
              <Skeleton
                sx={{
                  width: "200px",
                  height: "50px",
                  backgroundColor: "#ffffff2f",
                }}
                variant="rectangular"
                className="movie-btn"
              ></Skeleton>
              <Skeleton
                sx={{
                  width: "200px",
                  height: "50px",
                  backgroundColor: "#ffffff2f",
                }}
                variant="rectangular"
                className="movie-btn"
              ></Skeleton>
            </Box>
          </Box>
        </Box>

        <Box className="movie-video">
          <Skeleton
            sx={{
              width: "200px",
              height: "30px",
              backgroundColor: "#ffffff2f",
            }}
            variant="rounded"
            // className="movie-parts_select"
          ></Skeleton>
          <Box className="movie-movie-container">
            <Skeleton
              sx={{
                width: "85%",
                margin: "0 auto",
                height: "500px",
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded"
              className="movie-movie"
            ></Skeleton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MovieSkeleton;
