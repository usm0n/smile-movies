import { Box, Link, Typography } from "@mui/joy";
import { BookmarkAdd } from "@mui/icons-material";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import { isLoggedIn } from "../utilities/defaults";
import { useUsers } from "../context/Users";
import { User } from "../user";
import { useNavigate } from "react-router";
import { ArrowBackIos } from "@mui/icons-material";

const SKELETON_COUNT = 10;
const CONTAINER_SX = {
  width: "90%",
  padding: "100px 0px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  minHeight: "100vh",
} as const;

function Watchlist() {
  const navigate = useNavigate();
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
  } = useUsers();

  const isLoading =
    myselfData?.isLoading ||
    removeFromWatchlistData?.isLoading ||
    addToWatchlistData?.isLoading;

  const watchlist = [
    ...((myselfData?.data as User)?.watchlist || []),
  ].reverse();
  const hasItems = watchlist && watchlist.length > 0;

  if (!isLoggedIn)
    return (
      <Box sx={CONTAINER_SX}>
        <NotLoggedIn type="page" />
      </Box>
    );

  return (
    <Box sx={CONTAINER_SX}>
      <Typography
        startDecorator={
          <ArrowBackIos
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
        }
        level="h1"
        sx={{
          "@media (max-width: 800px)": {
            fontSize: "25px",
          },
        }}
      >
        Your Watchlist
      </Typography>
      {hasItems && (
        <Typography>
          You have {watchlist.length} item
          {watchlist.length > 1 ? "s" : ""} in your watchlist
        </Typography>
      )}
      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {isLoading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <EventMCS key={i} />
          ))
        ) : hasItems ? (
          watchlist.map((item) => (
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
          ))
        ) : (
          <Box
            sx={{
              textAlign: "center",
              padding: "40px 0px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            <BookmarkAdd sx={{ fontSize: "50px" }} />
            <Typography level="h2">
              There's no shows or movies in your watchlist
            </Typography>
            <Typography level="body-md">
              Add shows and movies to keep track of what you want to watch
            </Typography>
            <Link
              onClick={() => navigate("/discover")}
              underline="none"
              sx={{ mt: 2, fontWeight: "bold", cursor: "pointer" }}
            >
              Discover shows and movies to add to your watchlist
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Watchlist;
