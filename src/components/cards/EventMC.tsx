import {
  Box,
  Card,
  CardCover,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";

import { useNavigate } from "react-router-dom";
import BlurImage from "../../utilities/blurImage";
import {
  BookmarkAdd,
  DeleteOutline,
  IosShare,
  MoreVert,
  PlayArrow,
} from "@mui/icons-material";
import { shareLink } from "../../utilities/defaults";
import { useUsers } from "../../context/Users";

function EventMC({
  eventPoster,
  eventId,
  eventType,
  eventDelete,
}: {
  eventPoster: string;
  eventId: number | string;
  eventType: string;
  eventDelete?: (id: string | number) => void;
}) {
  const navigate = useNavigate();
  const { addToRecentlyWatched } = useUsers();
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
                  addToRecentlyWatched(
                    eventType,
                    eventId.toString(),
                    eventPoster
                  );
                  navigate(
                    `/${eventType}/${eventId}${
                      eventType == "tv" ? "/1/1" : ""
                    }/watch`
                  );
                }}
              >
                <PlayArrow />{" "}
                {eventType == "movie" ? "Watch Now" : "Play S1:E1"}
              </MenuItem>
              <MenuItem disabled>
                <BookmarkAdd /> Add to watchlist
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
      </Card>
    </Box>
  );
}

export default EventMC;
