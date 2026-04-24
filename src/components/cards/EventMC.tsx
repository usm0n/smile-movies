import {
  Box, Button, ButtonGroup, Card, CardCover, Chip,
  Dropdown, LinearProgress, Menu, MenuButton, MenuItem, Typography,
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
} from "@mui/icons-material";
import { shareLink } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { getPlaybackTarget } from "../../utilities/playbackTarget";

function EventMC({
  eventPoster, eventId, eventType, eventDelete,
  eventDuration, eventCurrentTime,
  eventSeason, eventEpisode, eventNextSeason, eventNextEpisode, eventTitle,
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
  } = useUsers();

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

  return (
    <Box onClick={() => navigate(`/${eventType}/${eventId}`)} key={eventId}>
      <Card
        sx={{
          cursor: "pointer", minHeight: "400px", width: "250px",
          background: "transparent",
          "@media (max-width: 800px)": { margin: "0 auto", width: "200px", minHeight: "300px" },
          ":hover": { transition: "all 0.2s ease-in-out", opacity: 0.7 },
        }}
      >
        <CardCover>
          {eventPoster ? (
            BlurImage({
              highQualitySrc: `https://image.tmdb.org/t/p/w500${eventPoster}`,
              lowQualitySrc: `https://image.tmdb.org/t/p/w185${eventPoster}`,
            })
          ) : eventType === "movie" || eventType === "tv" ? (
            <Movie />
          ) : (
            <Person />
          )}
        </CardCover>

        {/* Menu — top right */}
        <Box sx={{ position: "absolute", top: 0, right: 0, zIndex: 3, padding: 1 }}>
          <Dropdown>
            <MenuButton
              onClick={(e) => e.stopPropagation()}
              sx={{ background: "transparent", border: "none" }}
            >
              <MoreVert />
            </MenuButton>
            <Menu onClick={(e) => e.stopPropagation()}>
              <MenuItem onClick={() => shareLink(`https://smile-movies.uz/${eventType}/${eventId}`)}>
                <IosShare /> Share this {eventType === "movie" ? "Movie" : eventType === "tv" ? "TV show" : "Person"}
              </MenuItem>
              {eventType !== "person" && (
                <>
                  <MenuItem onClick={() => navigate(playbackTarget.route)}>
                    <PlayArrow /> {hasResumeProgress ? "Resume" : eventType === "movie" ? "Watch now" : "Play now"}
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
                      addToWatchlistData?.isLoading ||
                      removeFromWatchlistData?.isLoading
                    }
                  >
                    {watchlistItem ? <Check /> : <Add />}
                    {watchlistItem ? "Remove from watchlist" : "Add to watchlist"}
                  </MenuItem>
                  {eventDelete && (
                    <MenuItem color="danger" onClick={() => eventDelete(eventId)}>
                      <DeleteOutline /> Delete
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
          </Dropdown>
        </Box>

        {/* Continue watching button */}
        {(hasResumeProgress || (eventNextSeason && eventNextEpisode)) && (
          <ButtonGroup orientation="vertical" sx={{ position: "absolute", zIndex: 3, bottom: 30, width: "90%" }}>
            <Button
              sx={{ width: "100%", backgroundColor: "rgba(255,255,255,1)", color: "black", gap: 1, border: "none", ":hover": { backgroundColor: "rgba(255,255,255,1)", opacity: 0.9 } }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(playbackTarget.route);
              }}
            >
              <PlayArrow sx={{ color: "black" }} />
              {hasResumeProgress
                ? `Continue ${eventType === "movie" ? "" : `S${eventSeason}:E${eventEpisode}`}`.trim()
                : `Next ${eventType === "movie" ? "" : `S${eventNextSeason}:E${eventNextEpisode}`}`.trim()}
            </Button>
          </ButtonGroup>
        )}

        {hasResumeProgress && (
          <LinearProgress
            sx={{ position: "absolute", zIndex: 2, bottom: 10, width: "90%", color: "rgb(255,220,92)", "--LinearProgress-thickness": "3px" }}
            determinate
            value={eventCurrentTime && eventDuration ? (eventCurrentTime / eventDuration) * 100 : 0}
          />
        )}

        {eventType === "tv" && eventSeason && eventEpisode ? (
          <Chip sx={{ padding: "0px 15px", position: "absolute", zIndex: 3, top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}>
            <Typography level="body-sm">S{eventSeason}-E{eventEpisode}</Typography>
          </Chip>
        ) : null}
      </Card>
    </Box>
  );
}

export default EventMC;
