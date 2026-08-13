import { Bookmark, History, Search, Star } from "../components/ui/icons";
import { Box, Input, Typography } from "@mui/joy";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
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
  width: "100%",
  maxWidth: "var(--sm-page-max)",
  mx: "auto",
  px: { xs: 2, sm: 3, md: 4 },
  pt: "calc(var(--sm-nav-height) + 48px)",
  pb: 8,
  display: "flex",
  flexDirection: "column",
  gap: 5,
  minHeight: "100vh",
} as const;

const GRID_SX = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
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
      <PageHeader
        title="Your library"
        description="Everything you've saved, watched and rated."
        divider={false}
        actions={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Badge>Watchlist {user.watchlist?.length || 0}</Badge>
            <Badge>Watched {user.recentlyWatched?.length || 0}</Badge>
            <Badge>Ratings {user.ratings?.length || 0}</Badge>
          </Box>
        }
      />

      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search your library…"
        startDecorator={<Search sx={{ fontSize: 16 }} />}
        sx={{ maxWidth: 420, mt: -3 }}
      />

      {isLoading ? (
        <Box sx={GRID_SX}>
          {Array.from({ length: 10 }).map((_, i) => (
            <EventMCS key={i} />
          ))}
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h3" sx={{ fontSize: "1.25rem" }}>
              Watchlist
            </Typography>
            {watchlist.length ? (
              <Box sx={GRID_SX}>
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
              <EmptyState
                icon={Bookmark}
                title={search ? "No matches" : "Your watchlist is empty"}
                description={
                  search
                    ? "No watchlist titles match this search."
                    : "Save something you want to watch and it shows up here."
                }
                action={
                  !search ? (
                    <Button variant="outlined" color="neutral" onClick={() => navigate("/browse")}>
                      Browse titles
                    </Button>
                  ) : undefined
                }
              />
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h3" sx={{ fontSize: "1.25rem" }}>
              Recently watched
            </Typography>
            {recentlyWatched.length ? (
              <Box sx={GRID_SX}>
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
              <EmptyState
                icon={History}
                title="Nothing watched yet"
                description="Start something and your progress lands here automatically."
                bare
              />
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="h3" sx={{ fontSize: "1.25rem" }}>
              Ratings
            </Typography>
            {ratings.length ? (
              <Box sx={GRID_SX}>
                {ratings.map((item) => (
                  <Box
                    key={`rating-${item.type}-${item.id}`}
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
                      <Badge tone="neutral" mono>
                        {item.rating}/10
                      </Badge>
                      <Button
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={() => setEditingRating(item)}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <EmptyState
                icon={Star}
                title="No ratings yet"
                description="Finish a title, or use the rate button on any detail page."
                bare
              />
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
