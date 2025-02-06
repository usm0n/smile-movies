import {
  Box,
  Card,
  CardContent,
  CardCover,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useEffect } from "react";
import { movieDetails } from "../../tmdb-res";
import { minuteToHour, ymdToDmy } from "../../utilities/defaults";
import {
  BookmarkBorderOutlined,
  FavoriteBorder,
} from "@mui/icons-material";

function Movie() {
  const { movieId } = useParams();
  const { movieDetailsData, movie } = useTMDB();

  const movieData = movieDetailsData?.data as movieDetails;
  useEffect(() => {
    if (movieId) {
      movie(movieId);
    }
  }, [movieId]);
  return (
    <Card>
      <CardCover sx={{ filter: "brightness(0.4)" }}>
        <img
          className="movie-backdrop"
          src={`https://image.tmdb.org/t/p/w400${movieData?.backdrop_path}`}
        />
      </CardCover>
      <CardContent>
        <Box
          display={"flex"}
          width={"95%"}
          margin={"100px auto"}
          gap={5}
          sx={{
            "@media (max-width: 700px)": {
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            },
          }}
        >
          <img
            src={`https://image.tmdb.org/t/p/original${movieData?.poster_path}`}
            width={300}
            height={450}
            className="movie-poster"
            style={{
              borderRadius: "10px",
            }}
          />
          <Box>
            <Typography
              sx={{
                "@media (max-width: 700px)": {
                  fontSize: "25px",
                },
              }}
              level="h1"
              textColor={"common.white"}
            >
              {movieData?.title}{" "}
              <Typography
                sx={{
                  "@media (max-width: 700px)": {
                    fontSize: "25px",
                  },
                }}
                level="h1"
                textColor={"neutral.300"}
                fontWeight={300}
              >{`(${movieData?.release_date.slice(0, 4)})`}</Typography>
            </Typography>
            <Typography textColor={"neutral.200"}>
              {ymdToDmy(movieData?.release_date)} •{" "}
              {minuteToHour(movieData?.runtime)}
              {`(${movieData?.runtime}m)`} •{" "}
              {movieData?.genres.map((genre) => genre.name).join(", ")}
            </Typography>
            <Box margin={"20px 0"} display={"flex"} gap={2}>
              <Tooltip title="Add to watchlist">
                <IconButton
                  sx={{
                    borderRadius: "50%",
                    background: "rgb(255, 200, 0)",
                    border: "none",
                    padding: "10px",
                    ":hover": {
                      opacity: 0.8,
                      background: "rgb(255, 200, 0)",
                      transition: "all 0.2s",
                    },
                  }}
                  variant="outlined"
                  color="neutral"
                >
                  <BookmarkBorderOutlined sx={{ color: "white" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add to favorites">
                <IconButton
                  sx={{
                    borderRadius: "50%",
                    background: "rgb(255, 200, 0)",
                    border: "none",
                    padding: "10px",
                    ":hover": {
                      opacity: 0.8,
                      background: "rgb(255, 200, 0)",
                      transition: "all 0.2s",
                    },
                  }}
                  variant="outlined"
                  color="neutral"
                >
                  <FavoriteBorder sx={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography textColor={"neutral.300"} fontWeight={300}>
              <i>"{movieData?.tagline}"</i>
            </Typography>
            <Box margin={"20px 0"}>
              <Typography textColor={"neutral.300"} level="h3">
                Overview
              </Typography>
              <Typography textColor={"neutral.200"} fontWeight={300}>
                {movieData?.overview}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Movie;
