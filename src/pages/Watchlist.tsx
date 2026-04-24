import {
  ArrowBackIos,
  BookmarkAdd,
  History,
  Search,
  Star,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  Input,
  Typography,
} from "@mui/joy";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import { isLoggedIn } from "../utilities/defaults";
import { useUsers } from "../context/Users";
import { RatingItem, User } from "../user";
import { useNavigate } from "react-router-dom";
import { useDeferredValue, useMemo, useState } from "react";
import { sortLibraryItems } from "../utilities/savedMedia";
import RatingDialog from "../components/library/RatingDialog";

const CONTAINER_SX = {
  width: "90%",
  padding: "100px 0px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  minHeight: "100vh",
} as const;

function Watchlist() {
  const navigate = useNavigate();
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
    deleteRating,
    upsertRating,
    upsertRatingData,
  } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRating, setEditingRating] = useState<RatingItem | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const isLoading =
    myselfData?.isLoading ||
    removeFromWatchlistData?.isLoading ||
    addToWatchlistData?.isLoading ||
    upsertRatingData?.isLoading;

  const user = (myselfData?.data as User) || ({} as User);
  const search = deferredSearchQuery.trim().toLowerCase();

  const matchesSearch = (item: { title?: string; type?: string }) =>
    !search || `${item.title || ""} ${item.type || ""}`.toLowerCase().includes(search);

  const watchlist = useMemo(
    () => sortLibraryItems((user.watchlist || []).filter(matchesSearch), "recent"),
    [search, user.watchlist],
  );
  const recentlyWatched = useMemo(
    () => sortLibraryItems((user.recentlyWatched || []).filter(matchesSearch), "recent"),
    [search, user.recentlyWatched],
  );
  const ratings = useMemo(
    () => sortLibraryItems((user.ratings || []).filter(matchesSearch), "recent"),
    [search, user.ratings],
  );

  if (!isLoggedIn) {
    return (
      <Box sx={CONTAINER_SX}>
        <NotLoggedIn type="page" />
      </Box>
    );
  }

  return (
    <Box sx={CONTAINER_SX}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            Your Library
          </Typography>
          <Typography textColor="neutral.300">
            Watchlist, recently watched, and ratings now live separately.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
          <Chip variant="soft">Watchlist {user.watchlist?.length || 0}</Chip>
          <Chip variant="soft">Recently watched {user.recentlyWatched?.length || 0}</Chip>
          <Chip variant="soft">Ratings {user.ratings?.length || 0}</Chip>
        </Box>
      </Box>

      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search your library..."
        startDecorator={<Search />}
        sx={{ maxWidth: 420 }}
      />

      {isLoading ? (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventMCS key={i} />
          ))}
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h2" startDecorator={<BookmarkAdd />}>
              Watchlist
            </Typography>
            {watchlist.length ? (
              <Box display="flex" flexWrap="wrap" justifyContent="center" gap="18px">
                {watchlist.map((item) => (
                  <EventMC
                    key={`watchlist-${item.type}-${item.id}`}
                    eventId={item.id}
                    eventPoster={item.poster || ""}
                    eventTitle={item.title}
                    eventType={item.type}
                    eventDelete={() => removeFromWatchlist(item.type, item.id)}
                  />
                ))}
              </Box>
            ) : (
              <Typography textColor="neutral.400">
                No watchlist titles match this search.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h2" startDecorator={<History />}>
              Recently Watched
            </Typography>
            {recentlyWatched.length ? (
              <Box display="flex" flexWrap="wrap" justifyContent="center" gap="18px">
                {recentlyWatched.map((item) => (
                  <EventMC
                    key={`recent-${item.type}-${item.id}`}
                    eventId={item.id}
                    eventPoster={item.poster || ""}
                    eventTitle={item.title}
                    eventType={item.type}
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
              <Typography textColor="neutral.400">
                No recent viewing activity yet.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h2" startDecorator={<Star />}>
              Ratings
            </Typography>
            {ratings.length ? (
              <Box display="flex" flexWrap="wrap" justifyContent="center" gap="18px">
                {ratings.map((item) => (
                  <Box
                    key={`rating-${item.type}-${item.id}`}
                    sx={{
                      width: "250px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      "@media (max-width: 800px)": {
                        width: "200px",
                      },
                    }}
                  >
                    <EventMC
                      eventId={item.id}
                      eventPoster={item.poster || ""}
                      eventTitle={item.title}
                      eventType={item.type}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Typography level="body-sm">
                        {item.rating}/10
                      </Typography>
                      <Button size="sm" variant="soft" onClick={() => setEditingRating(item)}>
                        Edit rating
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography textColor="neutral.400">
                No ratings yet. Finish a title or use the star button on a detail page.
              </Typography>
            )}
          </Box>
        </>
      )}

      <RatingDialog
        open={!!editingRating}
        title={editingRating?.title || ""}
        initialRating={editingRating?.rating || 0}
        onClose={() => setEditingRating(null)}
        onSave={async (rating) => {
          if (!editingRating) return;
          await upsertRating(
            editingRating.type,
            editingRating.id,
            editingRating.poster || "",
            editingRating.title || "",
            rating,
          );
        }}
        onDelete={
          editingRating
            ? async () => {
              await deleteRating(editingRating.type, editingRating.id);
            }
            : undefined
        }
      />
    </Box>
  );
}

export default Watchlist;
