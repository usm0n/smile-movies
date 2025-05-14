import { Box, Typography } from "@mui/joy";
import { movieDetails, tvDetails } from "../../tmdb-res";
import { minuteToHour, ymdToDmy } from "../../utilities/defaults";

function About({ movieDetails }: { movieDetails: movieDetails & tvDetails }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 5,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography level="h3">Information</Typography>
        <Box>
          <Typography level="body-md">Release Date</Typography>
          <Typography level="body-sm">
            {ymdToDmy(
              movieDetails?.first_air_date || movieDetails?.release_date
            )}
          </Typography>
        </Box>
        <Box>
          <Typography level="body-md">Status</Typography>
          <Typography level="body-sm">{movieDetails?.status}</Typography>
        </Box>
        {movieDetails?.type ? (
          <Box>
            <Typography level="body-md">Type</Typography>
            <Typography level="body-sm">{movieDetails?.type}</Typography>
          </Box>
        ) : (
          ""
        )}
        {movieDetails?.runtime || movieDetails?.episode_run_time[0] ? (
          <Box>
            <Typography level="body-md">Runtime</Typography>
            <Typography level="body-sm">
              {minuteToHour(movieDetails?.runtime) ||
                minuteToHour(movieDetails?.episode_run_time[0])}
            </Typography>
          </Box>
        ) : (
          ""
        )}
        {movieDetails?.genres.length ? (
          <Box>
            <Typography level="body-md">Genres</Typography>
            <Typography level="body-sm">
              {movieDetails?.genres.map((genre) => genre.name).join(", ")}
            </Typography>
          </Box>
        ) : (
          ""
        )}
        {movieDetails?.first_air_date ? (
          <Box>
            <Typography level="body-md">Seasons & Episodes</Typography>
            <Typography level="body-sm">
              {movieDetails?.number_of_seasons} Seasons,{" "}
              {movieDetails?.number_of_episodes} Episodes
            </Typography>
          </Box>
        ) : (
          ""
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography level="h3">Languages</Typography>
        <Box>
          <Typography level="body-md">Original Language</Typography>
          <Typography level="body-sm">
            {movieDetails?.original_language}-{movieDetails?.origin_country}
          </Typography>
        </Box>
        <Box>
          <Typography level="body-md">Spoken Languages</Typography>
          <Typography level="body-sm">
            {movieDetails?.spoken_languages
              .map((language) =>
                language.name !== language.english_name
                  ? `${language.english_name} (${language.name})`
                  : language.name
              )
              .join(", ")}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography level="h3">Production</Typography>
        {movieDetails?.production_companies[0] ? (
          <Box>
            <Typography level="body-md">Production Companies</Typography>
            <Typography level="body-sm">
              {movieDetails?.production_companies
                ?.map((company) => company.name)
                .join(", ")}
            </Typography>
          </Box>
        ) : (
          ""
        )}
        {movieDetails?.production_countries[0] ? (
          <Box>
            <Typography level="body-md">Production Countries</Typography>
            <Typography level="body-sm">
              {movieDetails?.production_countries
                ?.map((country) => country.name)
                .join(", ")}
            </Typography>
          </Box>
        ) : (
          ""
        )}
        {movieDetails?.networks ? (
          <Box>
            <Typography level="body-md">Networks</Typography>
            <Typography level="body-sm">
              {movieDetails?.networks?.map((network) => network.name).join(", ")}
            </Typography>
          </Box>
        ) : (
          ""
        )}
      </Box>
    </Box>
  );
}

export default About;
