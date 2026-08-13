import { Box } from "@mui/joy";
import { Shimmer } from "../../ui/Skeleton";

/** Poster-card placeholder — mirrors the real EventMC dimensions exactly. */
function EventMCS() {
  return (
    <Box sx={{ width: { xs: 150, sm: 176 }, flexShrink: 0 }}>
      <Shimmer sx={{ width: "100%", aspectRatio: "2 / 3", height: "auto" }} radius={8} />
      <Shimmer width="72%" height={13} sx={{ mt: 1.25 }} />
      <Shimmer width="40%" height={10} sx={{ mt: 0.75 }} />
    </Box>
  );
}

export default EventMCS;
