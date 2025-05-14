import { Box, Typography } from "@mui/joy";
import { movieCredits } from "../../tmdb-res";
import CastCard from "../cards/CastCard";

function Cast({ movieCredits }: { movieCredits: movieCredits }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography level="h2">Cast</Typography>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          overflow: "scroll",
          gap: 2,
        }}
      >
        {movieCredits?.cast?.map((actor) => (
          <CastCard actor={actor} key={actor.id} />
        ))}
      </Box>
    </Box>
  );
}

export default Cast;
