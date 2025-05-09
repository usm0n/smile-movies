import { Box, Card, CardCover } from "@mui/joy";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import BlurImage from "../../utilities/blurImage";

function EventMC({
  eventPoster,
  eventId,
  eventType,
  eventSeason,
}: {
  eventPoster: string;
  eventId: number;
  eventType: string;
  eventSeason?: number;
}) {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() =>
        eventType == "season"
          ? navigate(`/tv/${eventId}/season/${eventSeason}`)
          : navigate(`/${eventType}/${eventId}`)
      }
      key={eventId}
    >
      <Card
        sx={{
          cursor: "pointer",
          minHeight: "400px",
          width: "250px",
          background: "transparent",
          "@media (max-width: 800px)": {
            margin: "0 auto",
            width: "200px",
            minHeight: "300px",
          },
          ":hover": {
            transition: "all 0.2s ease-in-out",
            opacity: 0.7,
          },
        }}
      >
        <CardCover>
          {eventPoster ? (
            BlurImage({
              highQualitySrc: `https://image.tmdb.org/t/p/original${eventPoster}`,
              lowQualitySrc: `https://image.tmdb.org/t/p/w200${eventPoster}`,
            })
          ) : (
            <img
              src="https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg"
              alt="poster"
            />
          )}
        </CardCover>
      </Card>
    </Box>
  );
}

export default EventMC;
