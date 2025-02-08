import {
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
  import { ymdToDmy } from "../../utilities/defaults";
  import {
    BookmarkBorderOutlined,
    FavoriteBorder,
    Star,
  } from "@mui/icons-material";
  import EventMC from "../cards/EventMC";
  import BlurImage from "../../utilities/blurImage";
  import { DiscoverTV, movieCredits, tvDetails } from "../../tmdb-res";
  
  function TVSeriesComponent({
    tvSeriesData,
    tvSeriesCreditsDataArr,
    tvSeriesRecommendationsDataArr,
  }: {
    tvSeriesData: tvDetails;
    tvSeriesCreditsDataArr: movieCredits;
    tvSeriesRecommendationsDataArr: DiscoverTV;
  }) {
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
            <Box
              display={"flex"}
              width={"95%"}
              margin={"100px auto"}
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
                highQualitySrc: `https://image.tmdb.org/t/p/original${tvSeriesData?.poster_path}`,
                lowQualitySrc: `https://image.tmdb.org/t/p/w200${tvSeriesData?.poster_path}`,
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
                  {tvSeriesData?.name}{" "}
                  <Typography
                    sx={{
                      "@media (max-width: 700px)": {
                        fontSize: "25px",
                      },
                    }}
                    level="h1"
                    textColor={"neutral.300"}
                    fontWeight={300}
                  >{`(${tvSeriesData?.first_air_date?.slice(0, 4)}${
                    tvSeriesData?.status == "Ended" &&
                    tvSeriesData?.first_air_date?.slice(0, 4) !==
                      tvSeriesData?.last_air_date?.slice(0, 4)
                      ? `-${tvSeriesData?.last_air_date?.slice(0, 4)}`
                      : ""
                  })`}</Typography>
                </Typography>
                <Typography textColor={"neutral.100"} level="h3">
                  {tvSeriesData?.original_name !== tvSeriesData?.name &&
                    tvSeriesData?.original_name}
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {`${tvSeriesData?.number_of_seasons} Season${
                    tvSeriesData?.number_of_seasons > 1 ? "s" : ""
                  } • ${tvSeriesData?.number_of_episodes} Episode${
                    tvSeriesData?.number_of_episodes > 1 ? "s" : ""
                  }`}
                </Typography>
                <Typography textColor={"neutral.200"}>
                  {ymdToDmy(tvSeriesData?.first_air_date)}{" "}
                  {tvSeriesData?.status == "Ended"
                    ? `- ${ymdToDmy(tvSeriesData?.last_air_date)}`
                    : ""}
                  {` (${tvSeriesData?.origin_country})`} •{" "}
                  {tvSeriesData?.episode_run_time.length
                    ? tvSeriesData?.episode_run_time + "m • "
                    : ""}
                  {tvSeriesData?.genres?.map((genre) => genre.name).join(", ")} •{" "}
                  <Typography startDecorator={<Star />}>
                    {tvSeriesData?.vote_average}
                  </Typography>
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
                {tvSeriesData?.tagline && (
                  <Typography textColor={"neutral.300"} fontWeight={300}>
                    <i>{tvSeriesData?.tagline}</i>
                  </Typography>
                )}
                <Box margin={"20px 0"}>
                  <Typography textColor={"neutral.300"} level="h3">
                    Overview
                  </Typography>
                  <Typography textColor={"neutral.200"} fontWeight={300}>
                    {tvSeriesData?.overview}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Box
          gap={2}
          display={"flex"}
          flexDirection={"column"}
          width={"90%"}
          margin={"100px auto"}
        >
          <Typography level="h1">Seasons</Typography>
          <Box display={"flex"} gap={5} overflow={"scroll"}>
            {tvSeriesData?.seasons
              ?.filter((s) => s.season_number !== 0)
              ?.map((season, index) => {
                return (
                  <EventMC
                    key={index}
                    eventDate={season?.air_date}
                    eventTitle={season?.name}
                    eventId={tvSeriesData?.id}
                    eventType={"season"}
                    eventOriginalTitle={season?.episode_count}
                    eventPoster={season?.poster_path}
                    eventRating={season?.vote_average}
                    eventSeason={season?.season_number}
                  />
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
            {tvSeriesCreditsDataArr?.cast?.map((cast, index) => {
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
          gap={2}
          display={"flex"}
          flexDirection={"column"}
          width={"90%"}
          margin={"100px auto"}
        >
          <Typography level="h2">Created By</Typography>
          <Box display={"flex"} gap={5} overflow={"scroll"}>
            {tvSeriesData?.created_by?.map((crew, index) => {
              return (
                <Card key={index}>
                  <CardOverflow>
                    <img
                      width={100}
                      height={150}
                      src={
                        crew?.profile_path
                          ? `https://image.tmdb.org/t/p/w200${crew.profile_path}`
                          : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg"
                      }
                    />
                  </CardOverflow>
                  <CardContent>
                    <Typography level="title-md">{crew.name}</Typography>
                    {crew.original_name !== crew.name && (
                      <Typography level="body-sm">
                        {crew.original_name}
                      </Typography>
                    )}
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
              <Typography level="h4">Type</Typography>
              <Typography level="body-md">{tvSeriesData?.type}</Typography>
            </Box>
            <Box>
              <Typography level="h4">Status</Typography>
              <Typography level="body-md">{tvSeriesData?.status}</Typography>
            </Box>
            {tvSeriesData?.first_air_date && (
              <Box>
                <Typography level="h4">Release Date</Typography>
                <Typography level="body-md">
                  {new Date(tvSeriesData?.first_air_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Typography>
              </Box>
            )}
            {tvSeriesData?.last_air_date && tvSeriesData?.status == "Ended" && (
              <Box>
                <Typography level="h4">End Date</Typography>
                <Typography level="body-md">
                  {new Date(tvSeriesData?.last_air_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Typography>
              </Box>
            )}
            {tvSeriesData?.episode_run_time?.length > 0 && (
              <Box>
                <Typography level="h4">Runtime</Typography>
                <Typography level="body-md">
                  {`${tvSeriesData?.episode_run_time} minutes`}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography level="h4">Genres</Typography>
              <Typography level="body-md">
                {tvSeriesData?.genres?.map((genre) => genre.name).join(", ")}
              </Typography>
            </Box>
            <Box>
              <Typography level="h4">Production Companies</Typography>
              <Typography level="body-md">
                {tvSeriesData?.production_companies
                  ?.map((company) => company.name)
                  .join(", ")}
              </Typography>
            </Box>
            <Box>
              <Typography level="h4">Production Countries</Typography>
              <Typography level="body-md">
                {tvSeriesData?.production_countries
                  ?.map((country) => country.name)
                  .join(", ")}
              </Typography>
            </Box>
            <Box>
              <Typography level="h4">Spoken Languages</Typography>
              <Typography level="body-md">
                {tvSeriesData?.spoken_languages
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
            {tvSeriesData?.homepage && (
              <Box>
                <Typography level="h4">Homepage</Typography>
                <Typography level="body-md">
                  <Link href={tvSeriesData?.homepage} target="_blank">
                    {tvSeriesData?.homepage}
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
            {tvSeriesRecommendationsDataArr?.results?.map((rec, index) => {
              return (
                <EventMC
                  eventDate={rec.first_air_date}
                  eventTitle={rec.name}
                  eventId={rec.id}
                  eventPoster={rec.poster_path}
                  eventType={"tv"}
                  eventRating={rec.vote_average}
                  eventOriginalTitle={rec.original_name}
                  key={index}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }
  
  export default TVSeriesComponent;
  