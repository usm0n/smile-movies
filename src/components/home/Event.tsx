import { Box, Chip, Typography, useColorScheme } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { ArrowForwardIos } from "@mui/icons-material";
import * as tmdbRes from "../../tmdb-res";
import EventMCS from "../cards/skeleton/EventMC";
import { smartText } from "../../utilities/defaults";

function Event({
  eventTitle,
  eventData,
  eventCategories,
  setEventCategory,
  eventCategory,
  isTitleSimple = false,
}: {
  eventTitle: string;
  eventData: tmdbRes.ResponseType | null;
  eventCategories?: string[];
  setEventCategory?: (eventCategory: string) => void;
  eventCategory?: string;
  isTitleSimple?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {isTitleSimple ? (
        <Typography level="h2">
          {eventTitle}
        </Typography>
      ) : (
        <Typography
          endDecorator={
            <ArrowForwardIos
              sx={{
                color:
                  colorScheme === "dark"
                    ? "rgb(255, 216, 77)"
                    : "rgb(255, 200, 0)",
              }}
            />
          }
          level="h1"
          sx={{
            color:
              colorScheme === "dark" ? "rgb(255, 216, 77)" : "rgb(255, 200, 0)",
            "@media (max-width: 700px)": {
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
      )}
      {eventCategories && (
        <Box
          display={"flex"}
          gap={1}
          overflow={"scroll"}
          sx={{
            maskImage: "linear-gradient(to right, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 95%, transparent 100%)",
          }}
        >
          {eventCategories?.map((eventCategoryData) => (
            <Chip
              size="lg"
              key={eventCategoryData}
              variant={
                eventCategory === eventCategoryData ? "solid" : "outlined"
              }
              onClick={() =>
                setEventCategory && setEventCategory(eventCategoryData)
              }
            >
              {smartText(eventCategoryData)}
            </Chip>
          ))}
        </Box>
      )}
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
        {eventData?.isLoading ? (
          <>
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
          </>
        ) : (
          (eventData?.data as tmdbRes.trendingAll)?.results?.map((event) => (
            <EventMC
              key={event.id}
              eventPoster={event.poster_path}
              eventId={event.id}
              eventType={event?.name ? "tv" : "movie"}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export default Event;
