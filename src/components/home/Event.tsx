import { Box, Typography } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { ArrowForwardIos } from "@mui/icons-material";
import * as tmdbRes from "../../tmdb-res";
import EventMCS from "../cards/skeleton/EventMC";

function Event({
  eventTitle,
  eventData,
}: {
  eventTitle: string;
  eventData: tmdbRes.ResponseType | null;
}) {
  return (
    <Box
      sx={{
        paddingTop: "100px",
        width: "90%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Typography
        endDecorator={<ArrowForwardIos />}
        level="h1"
        sx={{
          color: "rgb(255, 216, 77)",
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
        {eventTitle}
      </Typography>
      <Box
        display={"flex"}
        gap={3}
        overflow={"scroll"}
        sx={{
          scrollbarColor: "rgb(255, 216, 77) rgba(255, 216, 77, 0.41)",
          scrollbarWidth: "thin",
        }}
      >
        {eventData?.isLoading ? (
          <>
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
          </>
        ) : (
          (eventData?.data as tmdbRes.trendingAll)?.results.map((event) => (
            <EventMC
              key={event.id}
              eventTitle={event.title || event.name}
              eventPoster={event.poster_path}
              eventId={event.id}
              eventDate={event.release_date || event.first_air_date}
              eventRating={event.vote_average}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export default Event;
