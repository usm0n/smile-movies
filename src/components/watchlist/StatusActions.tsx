import {
  Box,
  Button,
  ButtonGroup,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { useTastePrompt } from "../../context/TastePrompt";
import { isLoggedIn } from "../../utilities/defaults";
import { normalizeSavedStatus } from "../../utilities/savedMedia";
import { SavedMediaStatus, User } from "../../user";

type StatusActionsProps = {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  poster?: string;
  title: string;
  duration?: number;
  currentTime?: number;
  season?: number;
  episode?: number;
  currentStatus?: string;
  mode?: "inline" | "menu";
  width?: string | number;
  mobileWidth?: string | number;
};

const STATUS_OPTIONS: Array<{
  key: Exclude<SavedMediaStatus, "favorite">;
  label: string;
}> = [
  { key: "planned", label: "Will watch" },
  { key: "watching", label: "Watching" },
  { key: "watched", label: "Watched" },
];

function StatusActions({
  mediaId,
  mediaType,
  poster = "",
  title,
  duration = 0,
  currentTime = 0,
  season = 0,
  episode = 0,
  currentStatus,
  mode = "inline",
  width = "100%",
  mobileWidth,
}: StatusActionsProps) {
  const navigate = useNavigate();
  const { addToWatchlist, addToWatchlistData, myselfData } = useUsers();
  const { openTastePrompt } = useTastePrompt();

  const watchlistItem = (myselfData?.data as User)?.watchlist?.find(
    (item) => item.id == String(mediaId) && item.type === mediaType,
  );
  const favoriteItem = (myselfData?.data as User)?.favorites?.find(
    (item) => item.id == String(mediaId) && item.type === mediaType,
  );
  const resolvedStatus = watchlistItem?.status
    ? normalizeSavedStatus(watchlistItem.status)
    : currentStatus
      ? normalizeSavedStatus(currentStatus)
      : null;
  const currentPreference = favoriteItem?.preference || watchlistItem?.preference;
  const isLoading = myselfData?.isLoading || addToWatchlistData?.isLoading;

  const handleStatusClick = async (status: Exclude<SavedMediaStatus, "favorite">) => {
    if (!isLoggedIn) {
      navigate("/auth/login");
      return;
    }

    await addToWatchlist(
      mediaType,
      String(mediaId),
      poster,
      title,
      status,
      watchlistItem?.duration || duration,
      watchlistItem?.currentTime || currentTime,
      watchlistItem?.season || season,
      watchlistItem?.episode || episode,
      currentPreference,
    );

    if (status === "watching" || status === "watched") {
      openTastePrompt({
        mediaId: String(mediaId),
        mediaType,
        poster,
        title,
        duration: watchlistItem?.duration || duration,
        currentTime: watchlistItem?.currentTime || currentTime,
        season: watchlistItem?.season || season,
        episode: watchlistItem?.episode || episode,
        status,
      });
    }
  };

  const buttonGroup = (
    <ButtonGroup
      size="sm"
      sx={{
        width,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        "--ButtonGroup-separatorSize": "0px",
        ...(mobileWidth
          ? {
            "@media (max-width: 700px)": {
              width: mobileWidth,
            },
          }
          : {}),
      }}
    >
      {STATUS_OPTIONS.map((status) => (
        <Button
          key={status.key}
          variant={resolvedStatus === status.key ? "solid" : "soft"}
          color={resolvedStatus === status.key ? "primary" : "neutral"}
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusClick(status.key);
          }}
          sx={{
            fontSize: mode === "menu" ? "10px" : "12px",
            px: mode === "menu" ? 0.6 : 0.8,
          }}
        >
          {status.label}
        </Button>
      ))}
    </ButtonGroup>
  );

  if (mode === "menu") {
    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ px: 1, py: 1, display: "flex", flexDirection: "column", gap: 0.8 }}
      >
        <Typography level="body-xs" textColor="neutral.400">
          Save status
        </Typography>
        {buttonGroup}
      </Box>
    );
  }

  return buttonGroup;
}

export default StatusActions;
