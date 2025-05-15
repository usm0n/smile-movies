import { ArrowForwardIos } from "@mui/icons-material";
import { Box, Typography } from "@mui/joy";
import {
  getRecentlyWatched,
  removeFromRecentlyWatched,
} from "../../utilities/defaults";
import EventMC from "../cards/EventMC";

function RecentlyWatched() {
  return (
    getRecentlyWatched().length > 0 && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
          endDecorator={<ArrowForwardIos />}
          level="h1"
          sx={{
            "@media (max-width: 800px)": {
              fontSize: "25px",
            },
            ":hover": {
              cursor: "pointer",
              opacity: 0.8,
              transition: "all 0.2s ease-in-out",
              textDecoration: "underline",
            },
          }}
        >
          Recently Watched
        </Typography>
        <Box
          display={"flex"}
          gap={3}
          overflow={"scroll"}
          sx={{
            paddingRight: "24px",
            scrollbarColor: "transparent",
            scrollbarWidth: "thin",
            maskImage: "linear-gradient(to right, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 95%, transparent 100%)",
          }}
        >
          {getRecentlyWatched()?.map(
            (m: { id: string; type: string; poster: string }) => {
              return (
                <EventMC
                  eventId={m.id}
                  eventType={m.type}
                  eventPoster={m.poster}
                  eventDelete={() => removeFromRecentlyWatched(m.id)}
                  key={m.id}
                />
              );
            }
          )}
        </Box>
      </Box>
    )
  );
}

export default RecentlyWatched;
