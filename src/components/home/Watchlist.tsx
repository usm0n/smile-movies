import { ArrowForwardIos, BookmarkAdd } from "@mui/icons-material";
import { Box, Button, Link, Typography } from "@mui/joy";
import { isLoggedIn } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useNavigate } from "react-router-dom";
import EventMCS from "../cards/skeleton/EventMC";
import EventMC from "../cards/EventMC";

function Watchlist() {
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
  } = useUsers();

  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Typography
      onClick={() => {
        navigate(`/watchlist`);
      }}
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
        From Your Watchlist
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {isLoggedIn ? (
          myselfData?.isLoading ||
          removeFromWatchlistData?.isLoading ||
          addToWatchlistData?.isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                overflow: "scroll",
                gap: 2,
                width: "100%",
              }}
            >
              <EventMCS />
              <EventMCS />
              <EventMCS />
              <EventMCS />
              <EventMCS />
              <EventMCS />
            </Box>
          ) : (myselfData?.data as User)?.watchlist.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                overflow: "scroll",
                gap: 2,
                width: "100%",
              }}
            >
              {(myselfData?.data as User)?.watchlist.map((item) => (
                <EventMC
                  key={item.id}
                  eventId={item.id}
                  eventPoster={item.poster}
                  eventType={item.type}
                  eventDelete={() => removeFromWatchlist(item.type, item.id)}
                  eventStatus={item.status}
                  eventDuration={item.duration}
                  eventCurrentTime={item.currentTime}
                  eventSeason={item.season}
                  eventEpisode={item.episode}
                />
              ))}
            </Box>
          ) : (
            <>
              <BookmarkAdd sx={{ fontSize: "50px" }} />
              <Typography level="h2">
                There's no shows or movies in your watchlist
              </Typography>
              <Typography level="body-md">
                Add shows and movies to keep track of what you want to watch
              </Typography>
            </>
          )
        ) : (
          <>
            <BookmarkAdd sx={{ fontSize: "50px" }} />
            <Typography level="h2">
              <Link
                onClick={() => navigate("/auth/login")}
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
            <Typography level="body-md">
              Save shows and movies to keep track of what you want to watch
            </Typography>
            <Button
              onClick={() => navigate("/auth/login")}
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
          </>
        )}
      </Box>
    </Box>
  );
}

export default Watchlist;
