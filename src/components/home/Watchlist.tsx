import { ArrowForwardIos, BookmarkAdd, History, Star } from "@mui/icons-material";
import { Box, Button, Link, Typography } from "@mui/joy";
import type { ReactNode } from "react";
import { isLoggedIn } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useNavigate } from "react-router-dom";
import EventMCS from "../cards/skeleton/EventMC";
import EventMC from "../cards/EventMC";
import { sortLibraryItems } from "../../utilities/savedMedia";

function Watchlist() {
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
  } = useUsers();

  const navigate = useNavigate();
  const user = (myselfData?.data as User) || ({} as User);
  const watchlist = sortLibraryItems(user.watchlist || [], "recent");
  const recentlyWatched = sortLibraryItems(user.recentlyWatched || [], "recent");
  const ratings = sortLibraryItems(user.ratings || [], "recent");

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
              eventDuration={item.duration}
              eventCurrentTime={item.currentTime}
              eventSeason={item.currentSeason}
              eventEpisode={item.currentEpisode}
              eventNextSeason={item.nextSeason}
              eventNextEpisode={item.nextEpisode}
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
          <Button variant="soft" onClick={() => navigate("/watchlist")}>
            Open library
          </Button>
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
            </Box>
          ) : user.watchlist?.length > 0 || recentlyWatched.length > 0 || ratings.length > 0 ? (
            <>
              {renderRow(
                "Watchlist",
                watchlist.slice(0, 8),
                <BookmarkAdd />,
                "Add a few titles and your watchlist will show up here.",
                true,
              )}
              {renderRow(
                "Recently Watched",
                recentlyWatched.slice(0, 8),
                <History />,
                "Start watching something and your recent progress will appear here.",
              )}
              {renderRow(
                "Ratings",
                ratings.slice(0, 8),
                <Star />,
                "Rate a few titles and they will show up here.",
              )}
            </>
          ) : (
            <>
              <BookmarkAdd sx={{ fontSize: "50px", mx: "auto" }} />
              <Typography level="h2" textAlign="center">
                There&apos;s no library activity yet
              </Typography>
              <Typography level="body-md" textAlign="center">
                Add something to your watchlist, start watching, or rate a title to begin.
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
              Track what you plan to watch, what you recently watched, and how you rated it.
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
