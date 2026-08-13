import { Box } from "@mui/joy";
import Container from "../../utilities/Container";
import { Shimmer } from "../ui/Skeleton";

/**
 * Shown while a lazy route chunk is in flight.
 *
 * Deliberately a neutral page-shaped skeleton rather than a spinner: routes
 * differ too much to guess a layout, and a centred spinner under a fixed navbar
 * reads as "broken" more than "loading". Reserves nav height so the page does
 * not jump when the real route mounts.
 */
function RouteFallback() {
  return (
    <Container sx={{ pt: "calc(var(--sm-nav-height) + 32px)", pb: 8 }} gap={3}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Shimmer width={220} height={28} radius={8} />
        <Shimmer width={320} height={14} radius={6} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <Box key={index}>
            <Shimmer width="100%" height={0} sx={{ pb: "150%", height: "auto" }} radius={8} />
            <Shimmer width="70%" height={12} sx={{ mt: 1.25 }} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}

export default RouteFallback;
