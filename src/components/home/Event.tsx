import { Box, Typography } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { ArrowForwardIos } from "@mui/icons-material";

function Event({ eventTitle }: { eventTitle: string }) {
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
        <EventMC />
        <EventMC />
        <EventMC />
        <EventMC />
        <EventMC />
        <EventMC />
        <EventMC />
      </Box>
    </Box>
  );
}

export default Event;
