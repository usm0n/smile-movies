import { CalendarMonth, Star } from "@mui/icons-material";
import { Box, Card, CardContent, CardCover, Typography } from "@mui/joy";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";

function EventMC({
  eventPoster,
  eventTitle,
  eventDate,
  eventRating,
  eventId,
}: {
  eventPoster: string;
  eventTitle: string;
  eventDate: string;
  eventRating: number;
  eventId: number;
}) {
  return (
    <Box key={eventId}>
      <Card
        sx={{
          cursor: "pointer",
          minHeight: "400px",
          width: "250px",
          background: "transparent",
          // border: "1px solid gray",
          "@media (max-width: 800px)": {
            margin: "0 auto",
            width: "200px",
            minHeight: "300px",
          },
          ":hover": {
            transition: "all 0.2s ease-in-out",
            opacity: 0.8,
          },
        }}
      >
        <CardCover>
          <img src={`https://image.tmdb.org/t/p/original${eventPoster}`} />
        </CardCover>
        <CardCover
          sx={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
          }}
        />
        <CardContent sx={{ justifyContent: "flex-end" }}>
          <Typography
            sx={{
              textShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
              "@media (max-width: 800px)": {
                fontSize: "17px",
              },
            }}
            level="h3"
            textColor={"common.white"}
          >
            {eventTitle}
          </Typography>
          <Box display={"flex"} gap={2}>
            <Typography
              level="body-md"
              textColor={"neutral.300"}
              startDecorator={<CalendarMonth />}
              sx={{
                "@media (max-width: 800px)": {
                  fontSize: "13px",
                },
              }}
            >
              {eventDate}
            </Typography>
            <Typography
              level="body-md"
              textColor={"neutral.300"}
              startDecorator={<Star />}
              sx={{
                "@media (max-width: 800px)": {
                  fontSize: "13px",
                },
              }}
            >
              {eventRating}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EventMC;
