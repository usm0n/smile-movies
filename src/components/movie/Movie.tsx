import {
  AspectRatio,
  Box,
  Card,
  CardContent,
  CardCover,
  CardOverflow,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/joy";
import { DiscoverMovie, movieCredits, movieDetails } from "../../tmdb-res";
import { minuteToHour, ymdToDmy } from "../../utilities/defaults";
import { BookmarkBorderOutlined, FavoriteBorder } from "@mui/icons-material";
import EventMC from "../../components/cards/EventMC";
import BlurImage from "../../utilities/blurImage";

function MovieComponent({
  movieData,
  movieCreditsDataArr,
  movieRecommendationsDataArr,
  movieId,
}: {
  movieData: movieDetails;
  movieCreditsDataArr: movieCredits;
  movieRecommendationsDataArr: DiscoverMovie;
  movieId: string | number;
}) {
  return (
    <Box>
      <Card>
        <CardCover sx={{ filter: "brightness(0.4)" }}>
          <img
            className="movie-backdrop"
            src={`https://image.tmdb.org/t/p/w200${movieData?.backdrop_path}`}
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
            {BlurImage({
              highQualitySrc: `https://image.tmdb.org/t/p/original${movieData?.poster_path}`,
              lowQualitySrc: `https://image.tmdb.org/t/p/w200${movieData?.poster_path}`,
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
                >{`(${movieData?.release_date?.slice(0, 4)})`}</Typography>
              </Typography>
              <Typography textColor={"neutral.100"} level="h3">
                {movieData?.original_title !== movieData?.title &&
                  movieData?.original_title}
              </Typography>
              <Typography textColor={"neutral.200"}>
                {ymdToDmy(movieData?.release_date)}
                {` (${movieData?.origin_country})`} •{" "}
                {minuteToHour(movieData?.runtime)}
                {` (${movieData?.runtime}m)`} •{" "}
                {movieData?.genres?.map((genre) => genre.name).join(", ")}
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
              {movieData?.tagline && (
                <Typography textColor={"neutral.300"} fontWeight={300}>
                  <i>"{movieData?.tagline}"</i>
                </Typography>
              )}
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
      <Box width={"90%"} margin={"100px auto"}>
        <AspectRatio ratio="16/9">
          <iframe
            src={`https://vidsrc.cc/v2/embed/movie/${movieId}?autoPlay=false`}
            style={{ border: "1px solid gray", borderRadius: "10px" }}
            allowFullScreen
          />
        </AspectRatio>
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
          {movieCreditsDataArr?.cast?.map((cast, index) => {
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
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        width={"90%"}
        margin={"100px auto"}
      >
        <Typography level="h2">Details</Typography>
        <Box
          display={"flex"}
          flexDirection={"column"}
          gap={3}
          overflow={"scroll"}
        >
          <Box>
            <Typography level="h4">Status</Typography>
            <Typography level="body-md">{movieData?.status}</Typography>
          </Box>
          {movieData?.release_date && (
            <Box>
              <Typography level="h4">Release Date</Typography>
              <Typography level="body-md">
                {new Date(movieData?.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          )}
          {movieData?.runtime && (
            <Box>
              <Typography level="h4">Runtime</Typography>
              <Typography level="body-md">
                {minuteToHour(movieData?.runtime)}
                {` (${movieData?.runtime} minutes)`}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography level="h4">Genres</Typography>
            <Typography level="body-md">
              {movieData?.genres?.map((genre) => genre.name).join(", ")}
            </Typography>
          </Box>
          <Box>
            <Typography level="h4">Production Companies</Typography>
            <Typography level="body-md">
              {movieData?.production_companies
                ?.map((company) => company.name)
                .join(", ")}
            </Typography>
          </Box>
          <Box>
            <Typography level="h4">Production Countries</Typography>
            <Typography level="body-md">
              {movieData?.production_countries
                ?.map((country) => country.name)
                .join(", ")}
            </Typography>
          </Box>
          <Box>
            <Typography level="h4">Spoken Languages</Typography>
            <Typography level="body-md">
              {movieData?.spoken_languages
                ?.map(
                  (language) =>
                    `${language.english_name} ${
                      language.english_name !== language.name
                        ? `(${language.name})`
                        : ""
                    }`
                )
                .join(", ")}
            </Typography>
          </Box>
          {movieData?.budget && (
            <Box>
              <Typography level="h4">Budget</Typography>
              <Typography level="body-md">
                {movieData?.budget.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
          )}
          {movieData?.revenue && (
            <Box>
              <Typography level="h4">Revenue</Typography>
              <Typography level="body-md">
                {movieData?.revenue.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            </Box>
          )}
          {movieData?.homepage && (
            <Box>
              <Typography level="h4">Homepage</Typography>
              <Typography level="body-md">
                <Link href={movieData?.homepage} target="_blank">
                  {movieData?.homepage}
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        width={"90%"}
        margin={"100px auto"}
      >
        <Typography level="h2">Recommendations</Typography>
        <Box display={"flex"} overflow={"scroll"} gap={3}>
          {movieRecommendationsDataArr?.results?.map((rec, index) => {
            return (
              <EventMC
                eventDate={rec.release_date}
                eventTitle={rec.title}
                eventId={rec.id}
                eventPoster={rec.poster_path}
                eventType={"movie"}
                eventRating={rec.vote_average}
                eventOriginalTitle={rec.original_title}
                key={index}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default MovieComponent;
