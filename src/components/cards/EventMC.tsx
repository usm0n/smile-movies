import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardCover,
  Chip,
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
  PlayArrow,
} from "@mui/icons-material";
import { isLoggedIn, shareLink } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";
import { User } from "../../user";

function EventMC({
  eventPoster,
  eventId,
  eventType,
  eventDelete,
  eventDuration,
  eventCurrentTime,
  eventStatus,
  eventSeason,
  eventEpisode,
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
}) {
  const navigate = useNavigate();
  const {
    addToWatchlist,
    removeFromWatchlist,
    addToWatchlistData,
    removeFromWatchlistData,
    myselfData,
  } = useUsers();
  return (
    <Box onClick={() => navigate(`/${eventType}/${eventId}`)} key={eventId}>
      <Card
        sx={{
          cursor: "pointer",
          minHeight: "400px",
          width: "250px",
          background: "transparent",
          "@media (max-width: 800px)": {
            margin: "0 auto",
            width: "200px",
            minHeight: "300px",
          },
          ":hover": {
            transition: "all 0.2s ease-in-out",
            opacity: 0.7,
          },
        }}
      >
        <CardCover>
          {eventPoster ? (
            BlurImage({
              highQualitySrc: `https://image.tmdb.org/t/p/original${eventPoster}`,
              lowQualitySrc: `https://image.tmdb.org/t/p/w200${eventPoster}`,
            })
          ) : (
            <img
              src="https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg"
              alt="poster"
            />
          )}
        </CardCover>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
            padding: 1,
          }}
        >
          <Dropdown>
            <MenuButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              sx={{
                background: "transparent",
                border: "none",
              }}
            >
              <MoreVert />
            </MenuButton>
            <Menu
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MenuItem
                onClick={() =>
                  shareLink(`https://smile-movies.uz/${eventType}/${eventId}`)
                }
              >
                <IosShare /> Share this{" "}
                {eventType == "movie" ? "Movie" : "TV show"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate(
                    `/${eventType}/${eventId}${eventType == "tv" ? "/1/1" : ""
                    }/watch`
                  );
                }}
              >
                <PlayArrow />{" "}
                {eventType == "movie" ? "Watch Now" : "Play S1:E1"}
              </MenuItem>
              <MenuItem
                disabled={
                  myselfData?.isLoading ||
                  addToWatchlistData?.isLoading ||
                  removeFromWatchlistData?.isLoading
                }
                onClick={() => {
                  !isLoggedIn
                    ? navigate("/auth/login")
                    : (myselfData?.data as User)?.watchlist?.find(
                      (item) => item.id == eventId
                    )
                      ? removeFromWatchlist(eventType, eventId.toString())
                      : addToWatchlist(
                        eventType,
                        eventId.toString(),
                        eventPoster,
                        "new",
                        0,
                        0,
                        eventType == "tv" ? 1 : 0,
                        eventType == "tv" ? 1 : 0
                      );
                }}
              >
                {myselfData?.isLoading ? (
                  "Loading..."
                ) : (myselfData?.data as User)?.watchlist?.find(
                  (item) => item.id == eventId
                ) ? (
                  removeFromWatchlistData?.isLoading ? (
                    "Removing from Watchlist..."
                  ) : (
                    <>
                      <Check /> In watchlist
                    </>
                  )
                ) : addToWatchlistData?.isLoading ? (
                  "Adding to Watchlist..."
                ) : (
                  <>
                    <Add /> Add to watchlist
                  </>
                )}
              </MenuItem>
              {eventDelete && (
                <MenuItem
                  color="danger"
                  onClick={() => {
                    eventDelete(eventId);
                  }}
                >
                  <DeleteOutline /> Delete this{" "}
                  {eventType == "movie" ? "Movie" : "TV show"}
                </MenuItem>
              )}
            </Menu>
          </Dropdown>
        </Box>
        {eventStatus && eventStatus == "watching" && (
          <ButtonGroup orientation="vertical" sx={{
            position: 'absolute',
            zIndex: 3,
            bottom: 30,
            width: "90%",
          }}>
            <Button sx={{
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 1)",
              color: "black",
              gap: 1,
              border: "none",
              ":hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                opacity: 0.9
              },
              ":active": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                opacity: 0.8
              }
            }} onClick={(e) => {
              e.stopPropagation();
              navigate(`/${eventType}/${eventId}${eventType == "tv" ? `/${eventSeason}/${eventEpisode}` : ""
                }/watch/startAt=${eventCurrentTime ? eventCurrentTime : 0}`);
            }}>
              <PlayArrow sx={{
                color: "black"
              }} />
              Continue {eventType == "movie" ? null : `S${eventSeason}:E${eventEpisode}`}
            </Button>
            {/* {eventType == "tv" && eventSeason && eventEpisode ? (
              <Button sx={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                gap: 1,
                border: "none",
                ":hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  opacity: 0.9
                },
                ":active": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  opacity: 0.8
                }
              }} onClick={(e) => {
                e.stopPropagation();
                navigate(`/${eventType}/${eventId}`);
              }}>
                <SkipNext/> Next Episode
              </Button>
            ) : null} */}
          </ButtonGroup>
        )}
        {eventStatus && eventStatus == "watching" && (
          <LinearProgress sx={{
            position: "absolute",
            zIndex: 2,
            bottom: 10,
            width: "90%",
            color: "rgb(255, 220, 92)",
            "--LinearProgress-thickness": "3px"
          }} determinate value={eventCurrentTime && eventDuration ? (eventCurrentTime / eventDuration) * 100 : 0} />)}
        {
          eventType == "tv" && eventSeason && eventEpisode ? (
            <Chip sx={{
              padding: "0px 15px",
            }}>
              <Typography level="body-sm">
                S{eventSeason}-E{eventEpisode}
              </Typography>
            </Chip>
          ) : null
        }
        {
          eventStatus == "new" ? (
            <Chip sx={{
              color: "rgb(255, 200, 92)"
            }}>
              New
            </Chip>
          ) : null
        }
      </Card>
    </Box>
  );
}

export default EventMC;
