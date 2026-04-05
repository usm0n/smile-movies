import {
  ArrowBackIos,
  BookmarkAdd,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Link,
  Typography,
} from "@mui/joy";
import EventMC from "../components/cards/EventMC";
import EventMCS from "../components/cards/skeleton/EventMC";
import NotLoggedIn from "../components/utils/NotLoggedIn";
import { isLoggedIn } from "../utilities/defaults";
import { useUsers } from "../context/Users";
import { User, Watchlist as SavedItem } from "../user";
import { useNavigate } from "react-router-dom";

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

const normalizeStatus = (status?: string) => {
  if (!status || status === "new" || status === "will_watch") return "planned";
  return status;
};

const parseSavedDate = (value?: string) => {
  if (!value) return 0;
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/);
  if (!match) return 0;
  return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`).getTime();
};

const sortSavedItems = (items: SavedItem[]) =>
  [...items].sort(
    (a, b) =>
      parseSavedDate(b.updatedAt || b.addedAt) -
      parseSavedDate(a.updatedAt || a.addedAt),
  );

function Watchlist() {
  const navigate = useNavigate();
  const {
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    addToWatchlist,
    addToWatchlistData,
  } = useUsers();

  const isLoading =
    myselfData?.isLoading ||
    removeFromWatchlistData?.isLoading ||
    addToWatchlistData?.isLoading;

  const user = (myselfData?.data as User) || ({} as User);
  const watchlist = sortSavedItems(user.watchlist || []);
  const favorites = sortSavedItems(user.favorites || []);
  const hasItems = watchlist.length > 0;

  const groupedItems = STATUS_SECTIONS.map((section) => ({
    ...section,
    items: watchlist.filter((item) => normalizeStatus(item.status) === section.key),
  }));

  const updateStatus = (item: SavedItem, nextStatus: string) =>
    addToWatchlist(
      item.type,
      item.id,
      item.poster,
      item.title || "",
      nextStatus,
      item.duration || 0,
      item.currentTime || 0,
      item.season || (item.type === "tv" ? 1 : 0),
      item.episode || (item.type === "tv" ? 1 : 0),
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
          Organize what you want to watch, what you are currently watching, and what you already finished.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
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
            {section.label}: {groupedItems.find((item) => item.key === section.key)?.items.length || 0}
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
                      <ButtonGroup
                        size="sm"
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          "--ButtonGroup-separatorSize": "0px",
                        }}
                      >
                        {STATUS_SECTIONS.map((status) => (
                          <Button
                            key={status.key}
                            variant={
                              normalizeStatus(item.status) === status.key ? "solid" : "soft"
                            }
                            color={
                              normalizeStatus(item.status) === status.key ? "primary" : "neutral"
                            }
                            onClick={() => updateStatus(item, status.key)}
                            sx={{ fontSize: "11px", px: 0.8 }}
                          >
                            {status.key === "watching"
                              ? "Watching"
                              : status.key === "watched"
                                ? "Watched"
                                : "Will watch"}
                          </Button>
                        ))}
                      </ButtonGroup>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
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
            There&apos;s no shows or movies in your watchlist
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

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography level="h2">Favorites</Typography>
        {favorites.length ? (
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
            {favorites.map((item) => (
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
