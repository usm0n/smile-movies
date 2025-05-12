import { Card, IconButton, Typography } from "@mui/joy";
import BlurImage from "../../../utilities/blurImage";
import { tvEpisodeDetails } from "../../../tmdb-res";
import { minuteToHour, ymdToDmy } from "../../../utilities/defaults";
import { MoreHoriz } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function EpisodeCard({ episode, tvId }: { episode: tvEpisodeDetails, tvId: string | number }) {
  const navigate = useNavigate()
  return (
    <Card
      onClick={() => navigate(`/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}
      sx={{
        gap: "5px",
        border: "none",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          top: "165px",
          right: "20px",
          "&:hover": {
            borderRadius: "50%",
          },
        }}
      >
        <MoreHoriz />
      </IconButton>
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
