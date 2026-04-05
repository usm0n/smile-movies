import { ArrowForwardIos, BookmarkAdd, Favorite, History } from "@mui/icons-material";
import { Box, Button, Link, Typography } from "@mui/joy";
import type { ReactNode } from "react";
import { isLoggedIn } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useNavigate } from "react-router-dom";
import EventMCS from "../cards/skeleton/EventMC";
import EventMC from "../cards/EventMC";
import { normalizeSavedStatus, sortSavedItems } from "../../utilities/savedMedia";

function Watchlist() {
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
  } = useUsers();

  const navigate = useNavigate();
  const user = (myselfData?.data as User) || ({} as User);
  const continueWatching = sortSavedItems(
    (user.watchlist || []).filter(
      (item) => normalizeSavedStatus(item.status) === "watching",
    ),
    "recent",
  );
  const recentlyWatched = sortSavedItems(user.recentlyWatched || [], "recent");
  const favorites = sortSavedItems(user.favorites || [], "recent");

  const renderRow = (
    title: string,
    items: any[],
    icon?: ReactNode,
    emptyText?: string,
    allowDelete = false,
  ) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
      <Typography level="h2" startDecorator={icon}>
        {title}
      </Typography>
      {items.length ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            overflow: "scroll",
            gap: 2,
            width: "100%",
          }}
        >
          {items.map((item) => (
            <EventMC
              key={`${title}-${item.type}-${item.id}`}
              eventId={item.id}
              eventPoster={item.poster}
              eventType={item.type}
              eventTitle={item.title}
              eventDelete={
                allowDelete ? () => removeFromWatchlist(item.type, item.id) : undefined
              }
              eventStatus={item.status}
              eventDuration={item.duration}
              eventCurrentTime={item.currentTime}
              eventSeason={item.season}
              eventEpisode={item.episode}
            />
          ))}
        </Box>
      ) : (
        <Typography level="body-md" textColor="neutral.400">
          {emptyText}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
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
          Your Library
        </Typography>
        {isLoggedIn && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="soft" onClick={() => navigate("/watchlist")}>
              Watchlist
            </Button>
            <Button variant="soft" onClick={() => navigate("/favorites")}>
              Favorites
            </Button>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 3,
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
          ) : user.watchlist?.length > 0 || favorites.length > 0 || recentlyWatched.length > 0 ? (
            <>
              {renderRow(
                "Continue Watching",
                continueWatching.slice(0, 8),
                <BookmarkAdd />,
                "Start watching something and it will appear here.",
                true,
              )}
              {renderRow(
                "Recently Watched",
                recentlyWatched.slice(0, 8),
                <History />,
                "Finished episodes and movies will build your recent history here.",
              )}
              {renderRow(
                "Favorite Picks",
                favorites.slice(0, 8),
                <Favorite />,
                "Star a few titles to build your favorites shelf.",
              )}
            </>
          ) : (
            <>
              <BookmarkAdd sx={{ fontSize: "50px", mx: "auto" }} />
              <Typography level="h2" textAlign="center">
                There&apos;s no shows or movies in your library yet
              </Typography>
              <Typography level="body-md" textAlign="center">
                Add shows and movies to track what you want to watch and what you loved.
              </Typography>
            </>
          )
        ) : (
          <>
            <BookmarkAdd sx={{ fontSize: "50px", margin: "0 auto" }} />
            <Typography level="h2" textAlign="center">
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
              to access your library
            </Typography>
            <Typography level="body-md" textAlign="center">
              Save shows and movies to keep track of what you want to watch.
            </Typography>
            <Button
              onClick={() => navigate("/auth/login")}
              sx={{
                borderRadius: "50px",
                padding: "10px 50px",
                backgroundColor: "rgb(255, 216, 77)",
                color: "black",
                width: "fit-content",
                margin: "0 auto",
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
