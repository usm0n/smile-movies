import React from "react";
import { Box, Skeleton } from "@mui/material";

function RowMovieCardSkeleton() {
  return (
    <Box className="row-movie-card">
      <Skeleton
        sx={{
          backgroundColor: "#ffffff2f",
          height: "250px",
        }}
        variant="rounded"
        className="row-movie-card_img"
      />
      <Box className="row-movie-card_info">
        <Skeleton
          sx={{
            backgroundColor: "#ffffff2f",
            height: "40px",
            width: "200px",
          }}
          variant="text"
          className="row-movie-card_info-title"
        />
        <Box className="row-movie-card_info_information">
          <h1>
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
                width: "50%",
              }}
            />
          </h1>
          <h1>
            <Skeleton sx={{
              backgroundColor: "#ffffff2f",
              width: "60%",
            }}/>
          </h1>
          <h1>
            <Skeleton sx={{
              backgroundColor: "#ffffff2f",
              width: "30%",
            }}/>
          </h1>
          <h1>
            <Skeleton sx={{
              backgroundColor: "#ffffff2f",
              width: "35%",
            }}/>
          </h1>
        </Box>
      </Box>
    </Box>
  );
}

export default RowMovieCardSkeleton;
