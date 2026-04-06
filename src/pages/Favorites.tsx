import {
  ArrowBackIos,
  Favorite,
  ThumbUp,
  Tune,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Input,
  Link,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/Users";
import { isLoggedIn } from "../utilities/defaults";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import EventMCS from "../components/cards/skeleton/EventMC";
import EventMC from "../components/cards/EventMC";
import { useDeferredValue, useState } from "react";
import {
  SavedMediaPreferenceFilter,
  SavedMediaSort,
  SavedMediaTypeFilter,
  sortSavedItems,
} from "../utilities/savedMedia";
import { User } from "../user";

const CONTAINER_SX = {
  width: "90%",
  padding: "100px 0px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  minHeight: "100vh",
} as const;

function Favorites() {
  const navigate = useNavigate();
  const { myselfData, removeFromFavoritesData, addToFavoritesData } = useUsers();
  const [mediaFilter, setMediaFilter] = useState<SavedMediaTypeFilter>("all");
  const [preferenceFilter, setPreferenceFilter] = useState<SavedMediaPreferenceFilter>("all");
  const [sortBy, setSortBy] = useState<SavedMediaSort>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const isLoading =
    myselfData?.isLoading ||
    removeFromFavoritesData?.isLoading ||
    addToFavoritesData?.isLoading;

  const favorites = sortSavedItems(
    (((myselfData?.data as User)?.favorites) || []).filter(
      (item) =>
        (mediaFilter === "all" || item.type === mediaFilter) &&
        (preferenceFilter === "all" ||
          (preferenceFilter === "none"
            ? !item.preference
            : item.preference === preferenceFilter)) &&
        (!deferredSearchQuery.trim() ||
          `${item.title || ""} ${item.type}`.toLowerCase().includes(deferredSearchQuery.toLowerCase())),
    ),
    sortBy,
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
                onClick={() => navigate("/watchlist")}
              />
            }
            level="h1"
            sx={{
              "@media (max-width: 800px)": {
                fontSize: "25px",
              },
            }}
          >
            Your Favorites
          </Typography>
          <Typography textColor="neutral.300">
            These are your strongest positive taste signals. SmileAI uses them to recommend better titles.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link
            onClick={() => navigate("/watchlist")}
            sx={{ cursor: "pointer", color: "rgb(96, 183, 255)" }}
          >
            Back to watchlist
          </Link>
          <Link
            onClick={() => navigate("/taste-profile")}
            sx={{ cursor: "pointer", color: "rgb(124, 214, 255)" }}
          >
            Open taste profile
          </Link>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
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
          Total favorites: {((myselfData?.data as User)?.favorites || []).length}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgb(255, 220, 92)",
          }}
        >
          Movies: {((myselfData?.data as User)?.favorites || []).filter((item) => item.type === "movie").length}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgb(120, 255, 178)",
          }}
        >
          TV shows: {((myselfData?.data as User)?.favorites || []).filter((item) => item.type === "tv").length}
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
          Loved: {((myselfData?.data as User)?.favorites || []).filter((item) => item.preference === "love").length}
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
          Liked: {((myselfData?.data as User)?.favorites || []).filter((item) => item.preference === "like").length}
        </Chip>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorites..."
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
            <Option value="all">All reactions</Option>
            <Option value="love">Loved</Option>
            <Option value="like">Liked</Option>
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

      {isLoading ? (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventMCS key={i} />
          ))}
        </Box>
      ) : favorites.length ? (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
          {favorites.map((item) => (
            <EventMC
              key={`favorite-page-${item.type}-${item.id}`}
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
        <Box
          sx={{
            textAlign: "center",
            padding: "50px 0px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Favorite sx={{ fontSize: "52px", color: "rgb(96, 183, 255)" }} />
          <Typography level="h2">No favorites saved yet</Typography>
          <Typography level="body-md">
            Use the star, love, or like controls on any movie or TV show to build your favorites. Titles marked not for me stay in your watchlist taste history instead.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <Chip startDecorator={<Favorite />} variant="soft" color="danger">
              Love for all-time picks
            </Chip>
            <Chip startDecorator={<ThumbUp />} variant="soft" color="primary">
              Like for solid recommendations
            </Chip>
            <Chip startDecorator={<Tune />} variant="soft" color="neutral">
              Review everything in Taste Profile
            </Chip>
          </Box>
          <Link
            onClick={() => navigate("/discover")}
            underline="none"
            sx={{ mt: 2, fontWeight: "bold", cursor: "pointer" }}
          >
            Discover titles to favorite
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default Favorites;
