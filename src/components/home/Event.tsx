import { Box, Typography } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { ArrowForwardIos } from "../ui/icons";
import * as tmdbRes from "../../tmdb-res";
import EventMCS from "../cards/skeleton/EventMC";
import { smartText } from "../../utilities/defaults";
import { useNavigate } from "react-router";
import SegmentedControl from "../ui/SegmentedControl";

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
  const navigate = useNavigate();
  const results = (eventData?.data as tmdbRes.trendingAll)?.results;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Typography level="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
            {eventTitle}
          </Typography>
          {!isTitleSimple && (
            <Box
              component="button"
              type="button"
              onClick={() => navigate(`/discover/${eventTitle}/1`)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "body",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "text.tertiary",
                transition: "color 150ms ease",
                "&:hover": { color: "text.primary" },
              }}
            >
              View all
              <ArrowForwardIos sx={{ fontSize: 13 }} />
            </Box>
          )}
        </Box>

        {eventCategories && setEventCategory && (
          <SegmentedControl
            ariaLabel={`${eventTitle} categories`}
            size="sm"
            value={eventCategory || eventCategories[0]}
            onChange={setEventCategory}
            segments={eventCategories.map((category) => ({
              value: category,
              label: smartText(category),
            }))}
          />
        )}
      </Box>

      <Box
        className="no-scrollbar"
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          pb: 0.5,
          "& > *": { scrollSnapAlign: "start" },
        }}
      >
        {eventData?.isLoading
          ? Array.from({ length: 7 }).map((_, index) => <EventMCS key={index} />)
          : results?.map((event) => (
              <EventMC
                key={event.id}
                eventPoster={event.poster_path}
                eventTitle={event?.name || event?.title}
                eventId={event.id}
                eventType={event?.name ? "tv" : "movie"}
              />
            ))}
      </Box>
    </Box>
  );
}

export default Event;
