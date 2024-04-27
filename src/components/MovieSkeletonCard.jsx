import { Box, Skeleton } from "@mui/material";
import React from "react";

function MovieSkeletonCard() {
  return (
    <Box className="movies-card" sx={{ width: "250px", height: "470px" }}>
      <Skeleton
        animation="pulse"
        variant="rounded"
        className="movies-img"
        sx={{ width: "250px", height: "350px", backgroundColor: "#ffffff2f" }}
      />
      <Box className="movies-info">
        <Skeleton
          className="movies-name"
          animation="pulse"
          variant="text"
          sx={{ width: "200px", height: "30px", backgroundColor: "#ffffff2f" }}
        />
        <Box className="movies-date">
          <Box className="movies-movie" sx={{ display: "flex", gap: "5px" }}>
            <Skeleton
              className="movies-name"
              animation="pulse"
              variant="text"
              sx={{
                width: "90px",
                height: "30px",
                backgroundColor: "#ffffff2f",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MovieSkeletonCard;
