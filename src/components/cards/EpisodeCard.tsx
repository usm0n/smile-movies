import {
  Card,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";
import BlurImage from "../../utilities/blurImage";
import { tvEpisodeDetails } from "../../tmdb-res";
import { minuteToHour, shareLink, ymdToDmy } from "../../utilities/defaults";
import { IosShare, MoreHoriz, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function EpisodeCard({
  episode,
  tvId,
}: {
  episode: tvEpisodeDetails;
  tvId: string | number;
}) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() =>
        navigate(
          `/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`,
        )
      }
      sx={{
        gap: "5px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "transparent",
        ":hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        ":active": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <Dropdown>
        <MenuButton
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            position: "absolute",
            top: "165px",
            right: "20px",
            background: "transparent",
            border: "none",
            zIndex: 1,
          }}
        >
          <MoreHoriz />
        </MenuButton>
        <Menu onClick={(e) => e.stopPropagation()}>
          <MenuItem
            onClick={() => {
              navigate(
                `/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`,
              );
            }}
          >
            <PlayArrow /> Watch now
          </MenuItem>
          <MenuItem
            onClick={() =>
              shareLink(
                `https://smile-movies.uz/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`,
              )
            }
          >
            <IosShare /> Share this episode
          </MenuItem>
        </Menu>
      </Dropdown>
      {BlurImage({
        highQualitySrc: `https://image.tmdb.org/t/p/original${episode?.still_path}`,
        lowQualitySrc: `https://image.tmdb.org/t/p/w200${episode?.still_path}`,
        style: {
          width: "auto",
          height: "150px",
          aspectRatio: "16/9",
          borderRadius: "12px",
        },
      })}
      <Typography level="body-xs">EPISODE {episode?.episode_number}</Typography>
      <Typography level="body-lg">{episode?.name}</Typography>
      <Typography level="body-sm">
        {episode?.overview.length > 70 ? (
          <>{episode?.overview.slice(0, 70)}...</>
        ) : (
          episode?.overview
        )}
      </Typography>
      <Typography level="body-xs">
        {minuteToHour(episode?.runtime)} • {ymdToDmy(episode?.air_date)}
      </Typography>
    </Card>
  );
}

export default EpisodeCard;
