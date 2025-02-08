import {
  Box,
  Card,
  CardContent,
  CardCover,
  CardOverflow,
  IconButton,
  Typography,
} from "@mui/joy";
import { ymdToDmy } from "../../utilities/defaults";
import { ArrowBackIos, ArrowForwardIos, Star } from "@mui/icons-material";
import BlurImage from "../../utilities/blurImage";
import { movieCredits, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { useNavigate } from "react-router-dom";

function TVSeasonsComponent({
  tvSeriesData,
  tvSeasonsData,
  tvSeasonsCreditsDataArr,
}: {
  tvSeriesData: tvDetails;
  tvSeasonsData: tvSeasonsDetails;
  tvSeasonsCreditsDataArr: movieCredits;
}) {
  const navigate = useNavigate();
  return (
    <Box>
      <Card>
        <CardCover sx={{ filter: "brightness(0.4)" }}>
          <img
            className="movie-backdrop"
            src={`https://image.tmdb.org/t/p/w200${tvSeriesData?.backdrop_path}`}
          />
        </CardCover>
        <CardContent>
          <Box width={"95%"} margin={"100px auto"} display={"flex"} flexDirection={"column"} gap={3} alignItems={"start"}>
            <IconButton onClick={() => navigate(`/tv/${tvSeriesData?.id}`)}>
              <ArrowBackIos /> {tvSeriesData?.name}
            </IconButton>
            <Box
              display={"flex"}
              width={"100%"}
              gap={5}
              sx={{
                "@media (max-width: 700px)": {
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                },
              }}
            >
              {BlurImage({
                highQualitySrc: `https://image.tmdb.org/t/p/original${tvSeasonsData?.poster_path}`,
                lowQualitySrc: `https://image.tmdb.org/t/p/w200${tvSeasonsData?.poster_path}`,
                className: "movie-poster",
                style: {
                  borderRadius: "10px",
                  width: "300px",
                  height: "450px",
                },
              })}
              <Box gap={"3px"} display={"flex"} flexDirection={"column"}>
                <Typography
                  sx={{
                    "@media (max-width: 700px)": {
                      fontSize: "25px",
                    },
                  }}
                  level="h1"
                  textColor={"common.white"}
                >
                  {tvSeasonsData?.name}{" "}
                  <Typography
                    sx={{
                      "@media (max-width: 700px)": {
                        fontSize: "25px",
                      },
                    }}
                    level="h1"
                    textColor={"neutral.300"}
                    fontWeight={300}
                  >{`(${tvSeasonsData?.air_date?.slice(0, 4)})`}</Typography>
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {`${tvSeasonsData?.episodes.length} episodes`}
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {ymdToDmy(tvSeasonsData?.air_date)}
                  {" • "}
                  <Typography startDecorator={<Star />}>
                    {tvSeasonsData?.vote_average}
                  </Typography>
                </Typography>
                <Box margin={"20px 0"}>
                  <Typography textColor={"neutral.300"} level="h3">
                    Overview
                  </Typography>
                  <Typography textColor={"neutral.200"} fontWeight={300}>
                    {tvSeasonsData?.overview}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          margin: "50px auto",
          width: "95%",
        }}
      >
        {tvSeasonsData?.season_number !== 1 ? (
          <IconButton
            onClick={() =>
              navigate(
                `/tv/${tvSeriesData?.id}/season/${
                  tvSeasonsData?.season_number - 1
                }`
              )
            }
          >
            <ArrowBackIos />
            Season {tvSeasonsData?.season_number - 1}
          </IconButton>
        ) : (
          <IconButton disabled></IconButton>
        )}
        {tvSeasonsData?.season_number !== tvSeriesData?.number_of_seasons ? (
          <IconButton
            onClick={() =>
              navigate(
                `/tv/${tvSeriesData?.id}/season/${
                  tvSeasonsData?.season_number + 1
                }`
              )
            }
          >
            Season {tvSeasonsData?.season_number + 1}
            <ArrowForwardIos />
          </IconButton>
        ) : (
          <IconButton disabled></IconButton>
        )}
      </Box>
      <Box
        gap={2}
        display={"flex"}
        flexDirection={"column"}
        width={"90%"}
        margin={"100px auto"}
      >
        <Typography level="h2">
          Episodes{" "}
          <Typography
            textColor={"neutral.400"}
          >{`(${tvSeasonsData?.episodes.length})`}</Typography>
        </Typography>
        <Box display={"flex"} gap={2} flexDirection={"column"}>
          {tvSeasonsData?.episodes?.map((episode, index) => {
            return (
              <Card
                sx={{
                  width: "90%",
                  margin: "0 auto",
                  cursor: "pointer",
                  "@media (max-width: 700px)": {
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  },
                  ":hover": {
                    filter: "brightness(0.8)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}
                orientation="horizontal"
                key={index}
              >
                <CardOverflow>
                  {BlurImage({
                    highQualitySrc: `https://image.tmdb.org/t/p/original${episode?.still_path}`,
                    lowQualitySrc: `https://image.tmdb.org/t/p/w200${episode?.still_path}`,
                    style: {
                      borderRadius: "5px",
                      width: "200px",
                      height: "118px",
                    },
                  })}
                </CardOverflow>
                <CardContent>
                  <Typography
                    level="h3"
                    sx={{
                      "@media (max-width: 700px)": {
                        fontSize: "20px",
                        fontWeight: 500,
                      },
                    }}
                  >
                    {episode.episode_number}.{" "}
                    <Typography fontWeight={300}>{episode?.name}</Typography>
                  </Typography>
                  <Typography level="body-md" textColor={"neutral.300"}>
                    {new Date(episode?.air_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • {episode?.runtime} minutes
                  </Typography>
                  <Typography
                    sx={{
                      "@media (max-width: 700px)": {
                        display: "none",
                      },
                    }}
                    level="body-md"
                    textColor={"neutral.300"}
                  >
                    {episode?.overview}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
      <Box
        gap={2}
        display={"flex"}
        flexDirection={"column"}
        width={"90%"}
        margin={"100px auto"}
      >
        <Typography level="h2">Cast</Typography>
        <Box display={"flex"} gap={5} overflow={"scroll"}>
          {tvSeasonsCreditsDataArr?.cast?.map((cast, index) => {
            return (
              <Card key={index}>
                <CardOverflow>
                  <img
                    width={100}
                    height={150}
                    src={
                      cast?.profile_path
                        ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
                        : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg"
                    }
                  />
                </CardOverflow>
                <CardContent>
                  <Typography level="title-md">{cast.name}</Typography>
                  <Typography level="body-sm">{cast.character}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default TVSeasonsComponent;
