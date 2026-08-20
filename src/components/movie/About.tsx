import { Box, Typography } from "@mui/joy";
import { movieDetails, tvDetails } from "../../tmdb-res";
import { minuteToHour, ymdToDmy } from "../../utilities/defaults";

/**
 * The title's factual record, as a plain label/value grid.
 *
 * Deliberately short. This used to be three stacked columns of everything TMDB
 * returns — original-language codes, "Type: Scripted", every production
 * country — which on a phone became a twenty-row list nobody reads. Anything
 * more specialist than this (box office, technical specs, keywords) already
 * has its own IMDb section further down the page.
 */
function About({ movieDetails }: { movieDetails: movieDetails & tvDetails }) {
  const isSeries = Boolean(movieDetails?.first_air_date);

  /** "ja" reads as nothing; the spoken-language list carries the real name. */
  const originalLanguage =
    movieDetails?.spoken_languages?.find(
      (language) => language.iso_639_1 === movieDetails?.original_language,
    )?.english_name ||
    movieDetails?.spoken_languages?.[0]?.english_name ||
    movieDetails?.original_language?.toUpperCase() ||
    "";

  const studios = (
    isSeries
      ? movieDetails?.networks?.map((network) => network.name)
      : movieDetails?.production_companies?.map((company) => company.name)
  )?.slice(0, 3);

  const facts: Array<[string, string]> = [
    [
      isSeries ? "First aired" : "Released",
      ymdToDmy(movieDetails?.first_air_date || movieDetails?.release_date),
    ],
    ["Status", movieDetails?.status || ""],
    [
      "Runtime",
      movieDetails?.runtime || movieDetails?.episode_run_time?.length
        ? `${minuteToHour(
          movieDetails?.runtime || movieDetails?.episode_run_time?.[0],
        )}${isSeries ? " per episode" : ""}`
        : "",
    ],
    [
      "Episodes",
      isSeries && movieDetails?.number_of_episodes
        ? `${movieDetails.number_of_episodes} across ${movieDetails.number_of_seasons} season${movieDetails.number_of_seasons === 1 ? "" : "s"}`
        : "",
    ],
    ["Genre", movieDetails?.genres?.map((genre) => genre.name).join(", ") || ""],
    ["Language", originalLanguage],
    [
      "Country",
      movieDetails?.production_countries
        ?.map((country) => country.name)
        .slice(0, 2)
        .join(", ") || "",
    ],
    [isSeries ? "Network" : "Studio", studios?.join(", ") || ""],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  if (!facts.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Typography level="h3">Details</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {facts.map(([label, value]) => (
          <Box key={label} sx={{ minWidth: 0 }}>
            <Typography level="body-xs" textColor="neutral.500">
              {label}
            </Typography>
            <Typography level="body-sm" textColor="neutral.200">
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default About;
