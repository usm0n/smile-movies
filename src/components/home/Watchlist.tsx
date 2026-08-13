import { ArrowForwardIos, Bookmark, History } from "../ui/icons";
import { Box, Typography } from "@mui/joy";
import { isLoggedIn } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useNavigate } from "react-router-dom";
import EventMCS from "../cards/skeleton/EventMC";
import EventMC from "../cards/EventMC";
import { sortLibraryItems } from "../../utilities/savedMedia";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

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

  const isLoading =
    myselfData?.isLoading ||
    removeFromWatchlistData?.isLoading ||
    addToWatchlistData?.isLoading;

  const renderRow = (
    title: string,
    items: any[],
    emptyText: string,
    allowDelete = false,
  ) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography level="h3" sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
        {title}
      </Typography>
      {items.length ? (
        <Box
          className="no-scrollbar"
          sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 0.5 }}
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
        <Typography level="body-sm">{emptyText}</Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography level="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
          Your library
        </Typography>
        {isLoggedIn && (
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            endDecorator={<ArrowForwardIos sx={{ fontSize: 13 }} />}
            onClick={() => navigate("/watchlist")}
          >
            Open library
          </Button>
        )}
      </Box>

      {!isLoggedIn ? (
        <EmptyState
          icon={Bookmark}
          title="Sign in to build your library"
          description="Track what you plan to watch, what you recently watched, and how you rated it."
          action={<Button onClick={() => navigate("/auth/login")}>Sign In</Button>}
        />
      ) : isLoading ? (
        <Box className="no-scrollbar" sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <EventMCS key={index} />
          ))}
        </Box>
      ) : user.watchlist?.length > 0 || recentlyWatched.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {renderRow(
            "Watchlist",
            watchlist.slice(0, 8),
            "Add a few titles and your watchlist will show up here.",
            true,
          )}
          {renderRow(
            "Recently watched",
            recentlyWatched.slice(0, 8),
            "Start watching something and your recent progress will appear here.",
          )}
        </Box>
      ) : (
        <EmptyState
          icon={History}
          title="No library activity yet"
          description="Add something to your watchlist, start watching, or rate a title to begin."
          action={
            <Button variant="outlined" color="neutral" onClick={() => navigate("/browse")}>
              Browse titles
            </Button>
          }
        />
      )}
    </Box>
  );
}

export default Watchlist;
