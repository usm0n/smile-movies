import {
  Box,
  Dropdown,
  LinearProgress,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import BlurImage from "../../utilities/blurImage";
import {
  Add,
  Check,
  DeleteOutline,
  IosShare,
  MoreVert,
  Movie,
  Person,
  PlayArrow,
  PlaylistAdd,
} from "../ui/icons";
import { shareLink } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { getPlaybackTarget } from "../../utilities/playbackTarget";
import { tmdbAPI } from "../../service/api/api";
import {
  collectionsAPI,
  Collection,
} from "../../service/api/smb/collections.api.service";
import { useRef, useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Badge from "../ui/Badge";
import { TextSkeleton } from "../ui/Skeleton";

function EventMC({
  eventPoster,
  eventId,
  eventType,
  eventDelete,
  eventDuration,
  eventCurrentTime,
  eventSeason,
  eventEpisode,
  eventNextSeason,
  eventNextEpisode,
  eventTitle,
}: {
  eventPoster: string;
  eventId: number | string;
  eventType: string;
  eventDelete?: (id: string | number) => void;
  eventDuration?: number;
  eventCurrentTime?: number;
  eventStatus?: string;
  eventSeason?: number;
  eventEpisode?: number;
  eventNextSeason?: number;
  eventNextEpisode?: number;
  eventTitle?: string;
}) {
  const navigate = useNavigate();
  const {
    addToWatchlist,
    addToWatchlistData,
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    isAuthenticated,
  } = useUsers();

  // Trailer hover
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Collections
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const handleMouseEnter = () => {
    if (eventType === "person") return;
    hoverTimerRef.current = setTimeout(async () => {
      if (trailerKey) {
        setShowTrailer(true);
        return;
      }
      try {
        const endpoint =
          eventType === "movie"
            ? `/movie/${eventId}/videos`
            : `/tv/${eventId}/videos`;
        const r = await tmdbAPI.get(endpoint);
        const key = r.data?.results?.find(
          (v: any) => v.type === "Trailer" && v.site === "YouTube",
        )?.key;
        if (key) {
          setTrailerKey(key);
          setShowTrailer(true);
        }
      } catch {}
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowTrailer(false);
  };

  const openCollections = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionsOpen(true);
    if (!isAuthenticated) return;
    setLoadingCollections(true);
    try {
      const data = await collectionsAPI.getAll();
      setCollections(data.collections);
    } catch {
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  const addToCollection = async (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await collectionsAPI.addItem(colId, {
      id: String(eventId),
      type: eventType as "movie" | "tv",
      title: eventTitle,
      poster: eventPoster,
    });
    setCollectionsOpen(false);
  };

  const watchlistItem = (myselfData?.data as User)?.watchlist?.find(
    (item) => item.id == String(eventId) && item.type === eventType,
  );
  const recentItem = (myselfData?.data as User)?.recentlyWatched?.find(
    (item) => item.id == String(eventId) && item.type === eventType,
  );
  const playbackTarget = getPlaybackTarget({
    mediaType: eventType as "movie" | "tv",
    mediaId: eventId,
    recentItem: recentItem || {
      id: String(eventId),
      type: eventType as "movie" | "tv",
      currentTime: eventCurrentTime || 0,
      currentSeason: eventSeason || 0,
      currentEpisode: eventEpisode || 0,
      nextSeason: eventNextSeason || 0,
      nextEpisode: eventNextEpisode || 0,
    },
  });
  const hasResumeProgress = Number(eventCurrentTime || 0) > 0;
  const progressPercent =
    eventCurrentTime && eventDuration ? (eventCurrentTime / eventDuration) * 100 : 0;

  const typeLabel =
    eventType === "movie" ? "Movie" : eventType === "tv" ? "TV" : "Person";

  return (
    <Box
      onClick={() => navigate(`/${eventType}/${eventId}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: { xs: 150, sm: 176 },
        flexShrink: 0,
        cursor: "pointer",
        "&:hover .sm-poster": {
          borderColor: "#333",
          transform: "translateY(-2px)",
        },
        "&:hover .sm-card-actions": { opacity: 1 },
      }}
    >
      <Box
        className="sm-poster"
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: eventType === "person" ? "1 / 1.35" : "2 / 3",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          backgroundColor: "background.level1",
          transition: "border-color 150ms ease, transform 150ms ease",
          "& img": { width: "100%", height: "100%", objectFit: "cover" },
        }}
      >
        {eventPoster ? (
          BlurImage({
            highQualitySrc: `https://image.tmdb.org/t/p/w500${eventPoster}`,
            lowQualitySrc: `https://image.tmdb.org/t/p/w185${eventPoster}`,
          })
        ) : (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: "100%",
              height: "100%",
              color: "text.tertiary",
            }}
          >
            {eventType === "person" ? (
              <Person sx={{ fontSize: 28 }} />
            ) : (
              <Movie sx={{ fontSize: 28 }} />
            )}
          </Box>
        )}

        {/* Trailer preview on sustained hover */}
        {showTrailer && trailerKey && (
          <Box
            sx={{ position: "absolute", inset: 0, zIndex: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title="Trailer preview"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                pointerEvents: "none",
              }}
              allow="autoplay"
            />
          </Box>
        )}

        {eventType === "tv" && eventSeason && eventEpisode ? (
          <Badge
            tone="neutral"
            mono
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 3,
              backgroundColor: "rgba(0,0,0,0.75)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "#ededed",
            }}
          >
            S{eventSeason}·E{eventEpisode}
          </Badge>
        ) : null}

        <Box
          className="sm-card-actions"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 5,
            opacity: { xs: 1, md: 0 },
            transition: "opacity 150ms ease",
          }}
        >
          <Dropdown>
            <MenuButton
              aria-label="More actions"
              onClick={(e) => e.stopPropagation()}
              slotProps={{
                root: {
                  sx: {
                    minHeight: 28,
                    minWidth: 28,
                    p: 0,
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#ededed",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
                  },
                },
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </MenuButton>
            <Menu placement="bottom-end" onClick={(e) => e.stopPropagation()}>
              <MenuItem
                onClick={() =>
                  shareLink(`https://smile-movies.uz/${eventType}/${eventId}`)
                }
              >
                <IosShare sx={{ fontSize: 16 }} /> Share
              </MenuItem>
              {eventType !== "person" && (
                <>
                  <MenuItem onClick={() => navigate(playbackTarget.route)}>
                    <PlayArrow sx={{ fontSize: 16 }} />
                    {hasResumeProgress ? "Resume" : "Play now"}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      if (watchlistItem) {
                        void removeFromWatchlist(eventType, String(eventId));
                        return;
                      }
                      void addToWatchlist(
                        eventType,
                        String(eventId),
                        eventPoster,
                        eventTitle || "",
                      );
                    }}
                    disabled={
                      addToWatchlistData?.isLoading || removeFromWatchlistData?.isLoading
                    }
                  >
                    {watchlistItem ? (
                      <Check sx={{ fontSize: 16 }} />
                    ) : (
                      <Add sx={{ fontSize: 16 }} />
                    )}
                    {watchlistItem ? "Remove from watchlist" : "Add to watchlist"}
                  </MenuItem>
                  <MenuItem onClick={openCollections}>
                    <PlaylistAdd sx={{ fontSize: 16 }} /> Add to list
                  </MenuItem>
                  {eventDelete && (
                    <MenuItem color="danger" onClick={() => eventDelete(eventId)}>
                      <DeleteOutline sx={{ fontSize: 16 }} /> Remove
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
          </Dropdown>
        </Box>

        {(hasResumeProgress || (eventNextSeason && eventNextEpisode)) && (
          <Box
            sx={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: hasResumeProgress ? 14 : 8,
              zIndex: 3,
            }}
          >
            <Button
              size="sm"
              fullWidth
              startDecorator={<PlayArrow sx={{ fontSize: 14 }} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(playbackTarget.route);
              }}
              sx={{ fontSize: "0.75rem", minHeight: 28 }}
            >
              {hasResumeProgress
                ? `Resume${eventType === "movie" ? "" : ` S${eventSeason}:E${eventEpisode}`}`
                : `Next${eventType === "movie" ? "" : ` S${eventNextSeason}:E${eventNextEpisode}`}`}
            </Button>
          </Box>
        )}

        {hasResumeProgress && (
          <LinearProgress
            aria-label="Watch progress"
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              borderRadius: 0,
              "--LinearProgress-radius": "0px",
              "--LinearProgress-thickness": "3px",
              backgroundColor: "rgba(255,255,255,0.16)",
              color: "#ffffff",
            }}
            determinate
            value={progressPercent}
          />
        )}
      </Box>

      <Box sx={{ mt: 1.25, minWidth: 0 }}>
        {eventTitle && (
          <Typography
            level="title-sm"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {eventTitle}
          </Typography>
        )}
        <Typography level="body-xs" sx={{ mt: 0.25 }}>
          {hasResumeProgress ? `${Math.round(progressPercent)}% watched` : typeLabel}
        </Typography>
      </Box>

      <Dialog
        open={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        title="Add to a list"
        description={eventTitle}
        width={400}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          {loadingCollections ? (
            <TextSkeleton lines={3} />
          ) : collections.length === 0 ? (
            <Typography level="body-sm">
              You have no lists yet. Create one from the My Lists page.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {collections.map((col) => (
                <Button
                  key={col.id}
                  variant="outlined"
                  color="neutral"
                  fullWidth
                  onClick={(e) => addToCollection(col.id, e)}
                  sx={{ justifyContent: "flex-start" }}
                >
                  {col.name}
                  <Typography level="body-xs" sx={{ ml: "auto" }}>
                    {col.items.length} titles
                  </Typography>
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}

export default EventMC;
