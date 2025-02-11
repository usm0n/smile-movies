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
import {
  tvDetails,
  tvEpisodeCredits,
  tvEpisodeDetails,
  tvSeasonsDetails,
} from "../../tmdb-res";
import { useNavigate } from "react-router-dom";
import Video from "../utils/Video";

function TVEpisodeComponent({
  tvSeriesData,
  tvSeasonsData,
  tvEpisodeCreditsDataArr,
  tvEpisodeData,
}: {
  tvSeriesData: tvDetails;
  tvSeasonsData: tvSeasonsDetails;
  tvEpisodeCreditsDataArr: tvEpisodeCredits;
  tvEpisodeData: tvEpisodeDetails;
}) {
  const navigate = useNavigate();
  return (
    <Box>
      <Card>
        <CardCover sx={{ filter: "brightness(0.4)" }}>
          <img
            className="movie-backdrop"
            src={`https://image.tmdb.org/t/p/w200${tvEpisodeData?.still_path}`}
          />
        </CardCover>
        <CardContent>
          <Box
            width={"95%"}
            margin={"100px auto"}
            display={"flex"}
            flexDirection={"column"}
            gap={3}
            alignItems={"start"}
          >
            <IconButton
              onClick={() =>
                navigate(
                  `/tv/${tvSeriesData?.id}/season/${tvSeasonsData?.season_number}`
                )
              }
            >
              <ArrowBackIos /> Season {tvSeasonsData?.season_number}
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
                  {`S${tvSeasonsData?.season_number}-E${tvEpisodeData?.episode_number}: `}
                  <Typography textColor={"neutral.200"} fontWeight={400}>
                    {tvEpisodeData?.name}
                  </Typography>
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {`${tvEpisodeData?.runtime} minutes`}
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {ymdToDmy(tvEpisodeData?.air_date)}
                  {" • "}
                  <Typography startDecorator={<Star />}>
                    {tvEpisodeData?.vote_average}
                  </Typography>
                </Typography>
                <Box margin={"20px 0"}>
                  <Typography textColor={"neutral.300"} level="h3">
                    Overview
                  </Typography>
                  <Typography textColor={"neutral.200"} fontWeight={300}>
                    {tvEpisodeData?.overview}
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
        {tvEpisodeData?.episode_number == 1 &&
          tvSeasonsData?.season_number !== 1 && (
            <IconButton
              onClick={() =>
                navigate(
                  `/tv/${tvSeriesData?.id}/season/${
                    tvSeasonsData?.season_number - 1
                  }/episode/${
                    tvSeriesData?.seasons[tvSeasonsData?.season_number - 1]
                      .episode_count
                  }`
                )
              }
            >
              <ArrowBackIos />
              Season {tvSeasonsData?.season_number - 1}
            </IconButton>
          )}
        {tvEpisodeData?.episode_number !== 1 ? (
          <IconButton
            onClick={() =>
              navigate(
                `/tv/${tvSeriesData?.id}/season/${
                  tvSeasonsData?.season_number
                }/episode/${tvEpisodeData?.episode_number - 1}`
              )
            }
          >
            <ArrowBackIos />
            Episode {tvEpisodeData?.episode_number - 1}
          </IconButton>
        ) : (
          <IconButton disabled></IconButton>
        )}
        {tvEpisodeData?.episode_number !== tvSeasonsData?.episodes.length ? (
          <IconButton
            onClick={() =>
              navigate(
                `/tv/${tvSeriesData?.id}/season/${
                  tvSeasonsData?.season_number
                }/episode/${tvEpisodeData?.episode_number + 1}`
              )
            }
          >
            Episode {tvEpisodeData?.episode_number + 1}
            <ArrowForwardIos />
          </IconButton>
        ) : (
          <IconButton disabled></IconButton>
        )}
        {tvEpisodeData?.episode_number == tvSeasonsData?.episodes.length &&
          tvSeasonsData?.season_number !== tvSeriesData?.number_of_seasons && (
            <IconButton
              onClick={() =>
                navigate(
                  `/tv/${tvSeriesData?.id}/season/${
                    tvSeasonsData?.season_number + 1
                  }/episode/1`
                )
              }
            >
              Season {tvSeasonsData?.season_number + 1}
              <ArrowForwardIos />
            </IconButton>
          )}
      </Box>
      <Video
        link={`/tv/${tvSeriesData?.id}/${tvSeasonsData?.season_number}/${tvEpisodeData?.episode_number}`}
      />
      <Box
        gap={2}
        display={"flex"}
        flexDirection={"column"}
        width={"90%"}
        margin={"100px auto"}
      >
        <Typography level="h2">Cast</Typography>
        <Box display={"flex"} gap={5} overflow={"scroll"}>
          {tvEpisodeCreditsDataArr?.cast?.map((cast, index) => {
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
        <Typography level="h2">Guest Stars</Typography>
        <Box display={"flex"} gap={5} overflow={"scroll"}>
          {tvEpisodeCreditsDataArr?.guest_stars?.map((cast, index) => {
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

export default TVEpisodeComponent;
