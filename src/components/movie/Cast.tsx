import { Box, Typography } from "@mui/joy";
import { movieCredits } from "../../tmdb-res";
import CastCard from "../cards/CastCard";
import { Shimmer } from "../ui/Skeleton";

/**
 * `isLoading` lets the title page paint as soon as its own details land and
 * fill this row in afterwards, instead of holding the whole page back until
 * the credits request returns.
 */
function Cast({
  movieCredits,
  isLoading = false,
}: {
  movieCredits: movieCredits;
  isLoading?: boolean;
}) {
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
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                  p: 1,
                }}
              >
                <Shimmer width={120} height={120} radius="50%" />
                <Shimmer width={90} height={12} />
                <Shimmer width={64} height={10} />
              </Box>
            ))
          : movieCredits?.cast?.map((actor) => (
              <CastCard actor={actor} key={actor.id} />
            ))}
      </Box>
    </Box>
  );
}

export default Cast;
