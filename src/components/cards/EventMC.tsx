import {
  Box, Button, ButtonGroup, Card, CardCover, Chip,
  Dropdown, LinearProgress, Menu, MenuButton, MenuItem, Typography,
  IconButton,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import BlurImage from "../../utilities/blurImage";
import {
  DeleteOutline,
  IosShare,
  MoreVert,
  Movie,
  Person,
  PlayArrow,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { isLoggedIn, shareLink } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import StatusActions from "../watchlist/StatusActions";

function EventMC({
  eventPoster, eventId, eventType, eventDelete,
  eventDuration, eventCurrentTime, eventStatus,
  eventSeason, eventEpisode, eventTitle,
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
  eventTitle?: string;
}) {
  const navigate = useNavigate();
  const {
    addToFavorites,
    addToFavoritesData,
    removeFromFavorites,
    removeFromFavoritesData,
    myselfData,
  } = useUsers();

  const watchlistItem = (myselfData?.data as User)?.watchlist?.find(
    (item) => item.id == String(eventId) && item.type === eventType,
  );
  const favoriteItem = (myselfData?.data as User)?.favorites?.find((item) => item.id == String(eventId) && item.type === eventType);
  const isFavorite = favoriteItem;
  const currentPreference = favoriteItem?.preference || watchlistItem?.preference;
  const favoritePreference = currentPreference === "dislike" ? "like" : currentPreference || "like";
  const normalizedStatus =
    eventStatus === "new" || eventStatus === "will_watch" ? "planned" : eventStatus;
  const statusLabel =
    normalizedStatus === "watching"
      ? "Watching"
      : normalizedStatus === "watched"
        ? "Watched"
        : normalizedStatus === "planned"
          ? "Will Watch"
          : normalizedStatus === "favorite"
            ? "Favorite"
            : "";

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

        {eventType !== "person" && (
          <Box sx={{ position: "absolute", top: 0, left: 0, zIndex: 3, padding: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) {
                  navigate("/auth/login");
                  return;
                }

                isFavorite
                  ? removeFromFavorites(eventType, String(eventId))
                  : addToFavorites(
                    eventType,
                    String(eventId),
                    eventPoster,
                    eventTitle || "",
                    normalizedStatus || "favorite",
                    eventDuration || 0,
                    eventCurrentTime || 0,
                    eventSeason || (eventType === "tv" ? 1 : 0),
                    eventEpisode || (eventType === "tv" ? 1 : 0),
                    favoritePreference,
                  );
              }}
              disabled={
                myselfData?.isLoading ||
                addToFavoritesData?.isLoading ||
                removeFromFavoritesData?.isLoading
              }
              sx={{
                borderRadius: "999px",
                background: isFavorite
                  ? "rgba(78, 168, 255, 0.22)"
                  : "rgba(10, 16, 32, 0.7)",
                border: "1px solid",
                borderColor: isFavorite ? "rgba(96, 183, 255, 0.65)" : "rgba(255,255,255,0.12)",
                color: isFavorite ? "rgb(96, 183, 255)" : "white",
                boxShadow: isFavorite ? "0 0 22px rgba(64, 156, 255, 0.35)" : "none",
                backdropFilter: "blur(14px)",
                "&:hover": {
                  background: isFavorite ? "rgba(78, 168, 255, 0.3)" : "rgba(255,255,255,0.12)",
                },
              }}
            >
              {isFavorite ? <Star /> : <StarBorder />}
            </IconButton>
          </Box>
        )}

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
                  <MenuItem onClick={() => navigate(`/${eventType}/${eventId}${eventType === "tv" ? "/1/1" : ""}/watch`)}>
                    <PlayArrow /> {eventType === "movie" ? "Watch Now" : "Play S1:E1"}
                  </MenuItem>
                  <StatusActions
                    mediaId={eventId}
                    mediaType={eventType as "movie" | "tv"}
                    poster={eventPoster}
                    title={eventTitle || ""}
                    duration={eventDuration || 0}
                    currentTime={eventCurrentTime || 0}
                    season={eventSeason || (eventType === "tv" ? 1 : 0)}
                    episode={eventEpisode || (eventType === "tv" ? 1 : 0)}
                    currentStatus={watchlistItem ? watchlistItem.status || normalizedStatus : undefined}
                    mode="menu"
                  />
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
        {eventStatus === "watching" && (
          <ButtonGroup orientation="vertical" sx={{ position: "absolute", zIndex: 3, bottom: 30, width: "90%" }}>
            <Button
              sx={{ width: "100%", backgroundColor: "rgba(255,255,255,1)", color: "black", gap: 1, border: "none", ":hover": { backgroundColor: "rgba(255,255,255,1)", opacity: 0.9 } }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${eventType}/${eventId}${eventType === "tv" ? `/${eventSeason}/${eventEpisode}` : ""}/watch/${eventCurrentTime || 0}`);
              }}
            >
              <PlayArrow sx={{ color: "black" }} />
              Continue {eventType === "movie" ? null : `S${eventSeason}:E${eventEpisode}`}
            </Button>
          </ButtonGroup>
        )}

        {eventStatus === "watching" && (
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

        {statusLabel ? (
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
            <Chip
              sx={{
                color:
                  normalizedStatus === "watched"
                    ? "rgb(120, 255, 178)"
                    : normalizedStatus === "watching"
                      ? "rgb(255, 220, 92)"
                      : "rgb(150, 188, 255)",
                backgroundColor: "rgba(5, 10, 22, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {statusLabel}
            </Chip>
            {currentPreference ? (
              <Chip
                sx={{
                  color:
                    currentPreference === "love"
                      ? "rgb(255, 139, 184)"
                      : currentPreference === "like"
                        ? "rgb(124, 214, 255)"
                        : "rgb(255, 166, 120)",
                  backgroundColor: "rgba(5, 10, 22, 0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {currentPreference === "love"
                  ? "Loved"
                  : currentPreference === "like"
                    ? "Liked"
                    : "Disliked"}
              </Chip>
            ) : null}
          </Box>
        ) : null}
      </Card>
    </Box>
  );
}

export default EventMC;
