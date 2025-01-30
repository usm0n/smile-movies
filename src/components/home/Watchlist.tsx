import { ArrowForwardIos, BookmarkAdd } from "@mui/icons-material";
import { Box, Button, Link, Typography } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { isLoggedIn } from "../../utilities/defaults";

function Watchlist() {
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
          color: "white",
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
        From Your Watchlist
      </Typography>
      {isLoggedIn ? (
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
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "50vh",
            gap: 2,
            textAlign: "center",
            width: "90%",
            margin: "0 auto"
          }}
        >
          <BookmarkAdd sx={{ color: "white", fontSize: "50px" }} />
          <Typography level="h2" textColor={"neutral.100"}>
            <Link
              sx={{
                color: "rgb(255, 216, 77)",
                ":hover": {
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "all 0.2s ease-in-out",
                  textDecoration: "underline",
                },
              }}
            >
              Sign in
            </Link>{" "}
            to access your watchlist
          </Typography>
          <Typography level="body-md" textColor={"neutral.300"}>
            Save shows and movies to keep track of what you want to watch
          </Typography>
          <Button
            sx={{
              borderRadius: "50px",
              padding: "10px 50px",
              backgroundColor: "rgb(255, 216, 77)",
              color: "black",
              ":hover": {
                backgroundColor: "rgb(255, 216, 77)",
                opacity: 0.8,
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            Sign In
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Watchlist;
