import { Box, Skeleton } from "@mui/material";
import React from "react";

function SmallMovieCardSkeleton() {
  return (
      <Box className="new-movie_card">
        <Skeleton
          sx={{
            width: "110px",
            height: "175px",
            borderRadius: "10px",
            backgroundColor: "#ffffff2f",
          }}
          variant="rectangular"
          className="new-movie_img"
        />
        <Box
          sx={{
            display: "flex",
            gap: "0px",
          }}
          className="new-movie_info"
        >
          <Skeleton
            sx={{
              width: "130px",
              height: "30px",
              backgroundColor: "#ffffff2f",
            }}
            className="new-movie_name"
          ></Skeleton>
          <Box className="new-movie_parts">
            <Skeleton
              sx={{
                width: "20px",
                height: "20px",
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded"
            />{" "}
            <Skeleton
              sx={{
                width: "85px",
                height: "30px",
                backgroundColor: "#ffffff2f",
              }}
            />
          </Box>
          <Box className="new-movie_date">
            <Skeleton
              sx={{
                width: "20px",
                height: "20px",
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded"
            />{" "}
            <Skeleton
              sx={{
                width: "85px",
                height: "30px",
                backgroundColor: "#ffffff2f",
              }}
            />
          </Box>
        </Box>
      </Box>

  );
}

export default SmallMovieCardSkeleton;
