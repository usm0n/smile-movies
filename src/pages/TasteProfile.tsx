import {
  ArrowBackIos,
  Favorite,
  MoodBad,
  ThumbUp,
  Tune,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Input,
  Link,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import { useUsers } from "../context/Users";
import { SavedMediaItem, SavedMediaPreference, User } from "../user";
import { isLoggedIn } from "../utilities/defaults";
import { SavedMediaSort, SavedMediaTypeFilter, sortSavedItems } from "../utilities/savedMedia";

type TasteFilter = SavedMediaPreference | "none" | "all";

const CONTAINER_SX = {
  width: "90%",
  padding: "100px 0px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  minHeight: "100vh",
} as const;

const mergeTasteSignals = (favorites: SavedMediaItem[], watchlist: SavedMediaItem[]) => {
  const merged = new Map<string, SavedMediaItem>();

  [...favorites, ...watchlist].forEach((item) => {
    const key = `${item.type}-${item.id}`;
    const previous = merged.get(key);

    if (!previous) {
      merged.set(key, item);
      return;
    }

    const previousStamp = previous.updatedAt || previous.addedAt || "";
    const nextStamp = item.updatedAt || item.addedAt || "";
    const previousPriority = previous.preference ? 1 : 0;
    const nextPriority = item.preference ? 1 : 0;

    if (
      nextPriority > previousPriority ||
      nextStamp > previousStamp
    ) {
      merged.set(key, {
        ...previous,
        ...item,
      });
      return;
    }

    merged.set(key, {
      ...item,
      ...previous,
    });
  });

  return Array.from(merged.values());
};

function TasteProfile() {
  const navigate = useNavigate();
  const { myselfData, addToFavoritesData, removeFromFavoritesData, addToWatchlistData } = useUsers();
  const [tasteFilter, setTasteFilter] = useState<TasteFilter>("all");
  const [mediaFilter, setMediaFilter] = useState<SavedMediaTypeFilter>("all");
  const [sortBy, setSortBy] = useState<SavedMediaSort>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const user = (myselfData?.data as User) || ({} as User);
  const tasteSignals = mergeTasteSignals(user.favorites || [], user.watchlist || []);
  const filteredSignals = sortSavedItems(
    tasteSignals.filter((item) => {
      const tasteMatch =
        tasteFilter === "all" ||
        (tasteFilter === "none" ? !item.preference : item.preference === tasteFilter);
      const mediaMatch = mediaFilter === "all" || item.type === mediaFilter;
      const searchMatch =
        !deferredSearchQuery.trim() ||
        `${item.title || ""} ${item.type}`
          .toLowerCase()
          .includes(deferredSearchQuery.toLowerCase());

      return tasteMatch && mediaMatch && searchMatch;
    }),
    sortBy,
  );
  const counts = {
    total: tasteSignals.length,
    love: tasteSignals.filter((item) => item.preference === "love").length,
    like: tasteSignals.filter((item) => item.preference === "like").length,
    dislike: tasteSignals.filter((item) => item.preference === "dislike").length,
    none: tasteSignals.filter((item) => !item.preference).length,
  };

  if (!isLoggedIn) {
    return (
      <Box sx={CONTAINER_SX}>
        <NotLoggedIn type="page" />
      </Box>
    );
  }

  const isLoading =
    myselfData?.isLoading ||
    addToFavoritesData?.isLoading ||
    removeFromFavoritesData?.isLoading ||
    addToWatchlistData?.isLoading;

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
            sx={{ "@media (max-width: 800px)": { fontSize: "25px" } }}
          >
            Your Taste Profile
          </Typography>
          <Typography textColor="neutral.300">
            This is the signal SmileAI should trust most when it recommends what to watch next.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="soft"
            startDecorator={<Favorite />}
            onClick={() => navigate("/favorites")}
          >
            Favorites
          </Button>
          <Button
            variant="soft"
            startDecorator={<Tune />}
            onClick={() => navigate("/watchlist")}
          >
            Watchlist
          </Button>
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
          Total signals: {counts.total}
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
          Loved: {counts.love}
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
          Liked: {counts.like}
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
          Not for me: {counts.dislike}
        </Chip>
        <Chip
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          No reaction yet: {counts.none}
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
            placeholder="Search taste profile..."
            size="sm"
          />
          <Select
            value={tasteFilter}
            onChange={(_, value) => setTasteFilter((value || "all") as TasteFilter)}
            size="sm"
          >
            <Option value="all">All signals</Option>
            <Option value="love">Loved</Option>
            <Option value="like">Liked</Option>
            <Option value="dislike">Not for me</Option>
            <Option value="none">No reaction</Option>
          </Select>
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
      ) : filteredSignals.length ? (
        <>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip startDecorator={<Favorite />} variant="soft" color="danger">
              Love means strongest recommendation signal
            </Chip>
            <Chip startDecorator={<ThumbUp />} variant="soft" color="primary">
              Like means solid match for future AI picks
            </Chip>
            <Chip startDecorator={<MoodBad />} variant="soft" color="warning">
              Not for me helps AI avoid similar misses
            </Chip>
          </Box>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
            {filteredSignals.map((item) => (
              <EventMC
                key={`taste-${item.type}-${item.id}`}
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
        </>
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
          <Tune sx={{ fontSize: "52px", color: "rgb(96, 183, 255)" }} />
          <Typography level="h2">No taste signals match this view</Typography>
          <Typography level="body-md">
            Start marking titles as loved, liked, or not for you and they will show up here.
          </Typography>
          <Link
            onClick={() => navigate("/discover")}
            underline="none"
            sx={{ mt: 2, fontWeight: "bold", cursor: "pointer" }}
          >
            Discover titles to train your taste profile
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default TasteProfile;
