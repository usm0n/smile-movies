import {
  ArrowBackIos,
  BookmarkAdd,
  Favorite,
  FavoriteBorder,
  History,
  MoodBad,
  ThumbUp,
  Tune,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Input,
  Link,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import StatusActions from "../components/watchlist/StatusActions";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import { isLoggedIn } from "../utilities/defaults";
import { useUsers } from "../context/Users";
import { User } from "../user";
import { useNavigate } from "react-router-dom";
import {
  filterSavedItems,
  SavedMediaPreferenceFilter,
  normalizeSavedStatus,
  SavedMediaSort,
  SavedMediaStatusFilter,
  SavedMediaTypeFilter,
  mergeRecentActivity,
  sortSavedItems,
} from "../utilities/savedMedia";
import { useDeferredValue, useState } from "react";

const SKELETON_COUNT = 10;
const CONTAINER_SX = {
  width: "90%",
  padding: "100px 0px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  minHeight: "100vh",
} as const;

const STATUS_SECTIONS = [
  { key: "watching", label: "I am watching", accent: "rgb(255, 220, 92)" },
  { key: "planned", label: "I will watch", accent: "rgb(96, 183, 255)" },
  { key: "watched", label: "I already watched", accent: "rgb(120, 255, 178)" },
] as const;

function Watchlist() {
  const navigate = useNavigate();
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlistData,
  } = useUsers();
  const [statusFilter, setStatusFilter] =
    useState<SavedMediaStatusFilter>("all");
  const [mediaFilter, setMediaFilter] =
    useState<SavedMediaTypeFilter>("all");
  const [preferenceFilter, setPreferenceFilter] =
    useState<SavedMediaPreferenceFilter>("all");
  const [sortBy, setSortBy] = useState<SavedMediaSort>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const isLoading =
    myselfData?.isLoading ||
    removeFromWatchlistData?.isLoading ||
    addToWatchlistData?.isLoading;

  const user = (myselfData?.data as User) || ({} as User);
  const watchlist = sortSavedItems(user.watchlist || [], sortBy);
  const favorites = sortSavedItems(user.favorites || [], "recent");
  const filteredWatchlist = filterSavedItems(
    watchlist,
    statusFilter,
    mediaFilter,
    preferenceFilter,
  ).filter(
    (item) =>
      !deferredSearchQuery.trim() ||
      `${item.title || ""} ${item.type}`.toLowerCase().includes(deferredSearchQuery.toLowerCase()),
  );
  const hasItems = filteredWatchlist.length > 0;

  const groupedItems = STATUS_SECTIONS.map((section) => ({
    ...section,
    items: filteredWatchlist.filter(
      (item) => normalizeSavedStatus(item.status) === section.key,
    ),
  }));

  const recentActivity = mergeRecentActivity(
    [user.recentlyWatched || [], user.watchlist || [], user.favorites || []],
    6,
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
            Your Watchlist
          </Typography>
          <Typography textColor="neutral.300">
            Organize what to start next, what you are in the middle of, and what you already finished.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={() => navigate("/favorites")}
            startDecorator={<FavoriteBorder />}
            sx={{
              alignSelf: "flex-start",
              background: "rgba(96, 183, 255, 0.12)",
              border: "1px solid rgba(96, 183, 255, 0.24)",
              color: "rgb(96, 183, 255)",
              "&:hover": {
                background: "rgba(96, 183, 255, 0.18)",
              },
            }}
          >
            Open Favorites
          </Button>
          <Button
            onClick={() => navigate("/taste-profile")}
            startDecorator={<Tune />}
            variant="soft"
          >
            Taste Profile
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {STATUS_SECTIONS.map((section) => (
          <Chip
            key={section.key}
            sx={{
              px: 1.2,
              py: 0.7,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: section.accent,
            }}
          >
            {section.label}:{" "}
            {(user.watchlist || []).filter(
              (item) => normalizeSavedStatus(item.status) === section.key,
            ).length}
          </Chip>
        ))}
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(76, 160, 255, 0.08)",
            border: "1px solid rgba(96, 183, 255, 0.25)",
            color: "rgb(96, 183, 255)",
          }}
        >
          Favorites: {favorites.length}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(255, 115, 167, 0.08)",
            border: "1px solid rgba(255, 115, 167, 0.24)",
            color: "rgb(255, 139, 184)",
          }}
        >
          Loved: {(user.watchlist || []).filter((item) => item.preference === "love").length}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(96, 183, 255, 0.08)",
            border: "1px solid rgba(96, 183, 255, 0.24)",
            color: "rgb(124, 214, 255)",
          }}
        >
          Liked: {(user.watchlist || []).filter((item) => item.preference === "like").length}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(255, 166, 120, 0.08)",
            border: "1px solid rgba(255, 166, 120, 0.24)",
            color: "rgb(255, 166, 120)",
          }}
        >
          Not for me: {(user.watchlist || []).filter((item) => item.preference === "dislike").length}
        </Chip>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.2,
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          px: 2,
          py: 1.5,
        }}
      >
        <ButtonGroup size="sm">
          <Button
            variant={statusFilter === "all" ? "solid" : "soft"}
            onClick={() => setStatusFilter("all")}
          >
            All statuses
          </Button>
          <Button
            variant={statusFilter === "watching" ? "solid" : "soft"}
            onClick={() => setStatusFilter("watching")}
          >
            Watching
          </Button>
          <Button
            variant={statusFilter === "planned" ? "solid" : "soft"}
            onClick={() => setStatusFilter("planned")}
          >
            Will watch
          </Button>
          <Button
            variant={statusFilter === "watched" ? "solid" : "soft"}
            onClick={() => setStatusFilter("watched")}
          >
            Watched
          </Button>
        </ButtonGroup>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved titles..."
            size="sm"
          />
          <Select
            value={mediaFilter}
            onChange={(_, value) => setMediaFilter((value || "all") as SavedMediaTypeFilter)}
            size="sm"
          >
            <Option value="all">All types</Option>
            <Option value="movie">Movies</Option>
            <Option value="tv">TV shows</Option>
          </Select>
          <Select
            value={preferenceFilter}
            onChange={(_, value) => setPreferenceFilter((value || "all") as SavedMediaPreferenceFilter)}
            size="sm"
          >
            <Option value="all">All taste signals</Option>
            <Option value="love">Loved</Option>
            <Option value="like">Liked</Option>
            <Option value="dislike">Not for me</Option>
            <Option value="none">No reaction</Option>
          </Select>
          <Select
            value={sortBy}
            onChange={(_, value) => setSortBy((value || "recent") as SavedMediaSort)}
            size="sm"
          >
            <Option value="recent">Sort: Recent activity</Option>
            <Option value="added">Sort: Recently added</Option>
            <Option value="title">Sort: Title</Option>
            <Option value="status">Sort: Status</Option>
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography level="h3" startDecorator={<History />}>
          Recent activity
        </Typography>
        {recentActivity.length ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {recentActivity.map((item) => (
              <Box
                key={`activity-${item.type}-${item.id}-${item.updatedAt || item.addedAt}`}
                onClick={() => navigate(`/${item.type}/${item.id}`)}
                sx={{
                  minWidth: "220px",
                  flex: "1 1 240px",
                  background: "rgba(11, 18, 36, 0.72)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  px: 1.6,
                  py: 1.3,
                  cursor: "pointer",
                  transition: "all 0.16s ease",
                  "&:hover": {
                    borderColor: "rgba(96, 183, 255, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography level="title-sm">{item.title || `Untitled ${item.type}`}</Typography>
                <Typography level="body-xs" textColor="neutral.400">
                  {item.type === "tv" ? "TV show" : "Movie"} • {normalizeSavedStatus(item.status)}
                  {item.type === "tv" && item.season && item.episode
                    ? ` • S${item.season}:E${item.episode}`
                    : ""}
                </Typography>
                {item.preference ? (
                  <Typography level="body-xs" textColor="neutral.300" sx={{ mt: 0.4 }}>
                    {item.preference === "love"
                      ? "Loved"
                      : item.preference === "like"
                        ? "Liked"
                        : "Marked as not for me"}
                  </Typography>
                ) : null}
                <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.6 }}>
                  {item.updatedAt ? `Updated ${item.updatedAt}` : item.addedAt ? `Added ${item.addedAt}` : ""}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography textColor="neutral.400">
            Once you start saving titles, your recent watchlist and favorite activity will show here.
          </Typography>
        )}
      </Box>

      {isLoading ? (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <EventMCS key={i} />
          ))}
        </Box>
      ) : hasItems ? (
        <>
          {groupedItems.map((section) =>
            section.items.length ? (
              <Box
                key={section.key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Typography level="h2">{section.label}</Typography>
                  <Chip
                    sx={{
                      color: section.accent,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {section.items.length}
                  </Chip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "18px",
                  }}
                >
                  {section.items.map((item) => (
                    <Box
                      key={`${section.key}-${item.type}-${item.id}`}
                      sx={{
                        width: "250px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        "@media (max-width: 800px)": {
                          width: "200px",
                        },
                      }}
                    >
                      <EventMC
                        eventId={item.id}
                        eventPoster={item.poster}
                        eventTitle={item.title}
                        eventType={item.type}
                        eventDelete={() => removeFromWatchlist(item.type, item.id)}
                        eventStatus={item.status}
                        eventDuration={item.duration}
                        eventCurrentTime={item.currentTime}
                        eventSeason={item.season}
                        eventEpisode={item.episode}
                      />
                      <StatusActions
                        mediaId={item.id}
                        mediaType={item.type as "movie" | "tv"}
                        poster={item.poster}
                        title={item.title || ""}
                        duration={item.duration || 0}
                        currentTime={item.currentTime || 0}
                        season={item.season || (item.type === "tv" ? 1 : 0)}
                        episode={item.episode || (item.type === "tv" ? 1 : 0)}
                        currentStatus={item.status}
                      />
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                        {item.preference && (
                          <Typography level="body-xs" textColor="neutral.300">
                            Taste: {item.preference === "love"
                              ? "Loved"
                              : item.preference === "like"
                                ? "Liked"
                                : "Not for me"}
                          </Typography>
                        )}
                        {item.addedAt && (
                          <Typography level="body-xs" textColor="neutral.400">
                            Added: {item.addedAt}
                          </Typography>
                        )}
                        {item.updatedAt && (
                          <Typography level="body-xs" textColor="neutral.500">
                            Last activity: {item.updatedAt}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : null,
          )}
        </>
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
            No watchlist items match this filter
          </Typography>
          <Typography level="body-md">
            Try another filter or search term, or discover something new to save.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <Chip startDecorator={<Favorite />} variant="soft" color="danger">
              Love titles you never want to lose
            </Chip>
            <Chip startDecorator={<ThumbUp />} variant="soft" color="primary">
              Like titles worth using for AI taste
            </Chip>
            <Chip startDecorator={<MoodBad />} variant="soft" color="warning">
              Mark misses so recommendations improve
            </Chip>
          </Box>
          <Link
            onClick={() => navigate("/discover")}
            underline="none"
            sx={{ mt: 2, fontWeight: "bold", cursor: "pointer" }}
          >
            Discover shows and movies to add to your watchlist
          </Link>
        </Box>
      )}

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Typography level="h2">Favorites Snapshot</Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Link
              onClick={() => navigate("/favorites")}
              sx={{ cursor: "pointer", color: "rgb(96, 183, 255)" }}
            >
              View all favorites
            </Link>
            <Link
              onClick={() => navigate("/taste-profile")}
              sx={{ cursor: "pointer", color: "rgb(124, 214, 255)" }}
            >
              Open taste profile
            </Link>
          </Box>
        </Box>
        {favorites.length ? (
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
            {favorites.slice(0, 6).map((item) => (
              <EventMC
                key={`favorite-${item.type}-${item.id}`}
                eventId={item.id}
                eventPoster={item.poster}
                eventTitle={item.title}
                eventType={item.type}
                eventStatus={item.status}
                eventDuration={item.duration}
                eventCurrentTime={item.currentTime}
                eventSeason={item.season}
                eventEpisode={item.episode}
              />
            ))}
          </Box>
        ) : (
          <Typography textColor="neutral.400">
            Tap the star on any movie or TV card to keep your likes in one place.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Watchlist;
