import { Box, Card, Dropdown, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import BlurImage from "../../utilities/blurImage";
import { tvEpisodeDetails } from "../../tmdb-res";
import { minuteToHour, shareLink, ymdToDmy } from "../../utilities/defaults";
import { IosShare, MoreHoriz, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import ParentalGuide from "../movie/ParentalGuide";

function EpisodeCard({
  episode,
  tvId,
  imdbRating,
  imdbEpisodeId,
}: {
  episode: tvEpisodeDetails;
  tvId: string | number;
  imdbRating?: number;
  imdbEpisodeId?: string;
}) {
  const navigate = useNavigate();
  const [spoiled, _setSpoiled] = useState(false);

  const hasThumbnail = !!episode?.still_path;

  return (
    <Card
      onClick={() => navigate(`/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}
      sx={{
        gap: "5px", border: "none", cursor: "pointer",
        backgroundColor: "transparent",
        ":hover": { backgroundColor: "rgba(255,255,255,0.1)" },
        ":active": { backgroundColor: "rgba(255,255,255,0.2)" },
        position: "relative",
        // minWidth: 220,
      }}
    >
      {/* ── Three-dot menu ── */}
      <Dropdown>
        <MenuButton
          onClick={(e) => e.stopPropagation()}
          sx={{ position: "absolute", top: "165px", right: "20px", background: "transparent", border: "none", zIndex: 3 }}
        >
          <MoreHoriz />
        </MenuButton>
        <Menu onClick={(e) => e.stopPropagation()}>
          <MenuItem onClick={() => navigate(`/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}>
            <PlayArrow /> Watch now
          </MenuItem>
          <MenuItem onClick={() => shareLink(`https://smile-movies.uz/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}>
            <IosShare /> Share this episode
          </MenuItem>
        </Menu>
      </Dropdown>

      {/* ── Thumbnail with spoil overlay ── */}
      <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
        {/* The image — blurred until spoiled */}
        <Box sx={{ filter: hasThumbnail && spoiled ? "blur(10px)" : "none", transition: "filter 0.25s ease" }}>
          {BlurImage({
            highQualitySrc: `https://image.tmdb.org/t/p/original${episode?.still_path}`,
            lowQualitySrc: `https://image.tmdb.org/t/p/w200${episode?.still_path}`,
            style: { width: "auto", height: "150px", aspectRatio: "16/9", borderRadius: "12px", display: "block" },
          })}
        </Box>

        {/* Spoil overlay — shown only when not yet spoiled AND there's a thumbnail */}
        {/* {hasThumbnail && !spoiled && (
          <Box
            onClick={(e) => { e.stopPropagation(); setSpoiled(true); }}
            sx={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              background: "rgba(0,0,0,0.18)",
              borderRadius: "12px",
              zIndex: 2,
              transition: "opacity 0.2s",
              "&:hover": { background: "rgba(0,0,0,0.28)" },
            }}
          >
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                px: 1.2, py: 0.5, borderRadius: 20,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <VisibilityIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>
                Spoil
              </Typography>
            </Box>
          </Box>
        )} */}

        {/* IMDb rating badge — bottom left, always visible */}
        {imdbRating != null && imdbRating > 0 && (
          <Box
            sx={{
              position: "absolute", bottom: 6, left: 6, zIndex: 3,
              display: "inline-flex", alignItems: "center", gap: 0.3,
              px: 0.7, py: 0.3, borderRadius: 4,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(245,197,24,0.45)",
              userSelect: "none",
            }}
          >
            <StarIcon sx={{ fontSize: 11, color: "#F5C518" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#F5C518", lineHeight: 1 }}>
              {imdbRating.toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Episode info ── */}
      <Typography level="body-xs">EPISODE {episode?.episode_number}</Typography>
      <Typography level="body-lg" sx={{ lineHeight: 1.3 }}>{episode?.name}</Typography>
      <Typography level="body-sm">
        {episode?.overview?.length > 70 ? <>{episode.overview.slice(0, 70)}...</> : episode?.overview}
      </Typography>

      {/* ── Footer row: runtime + parental guide icon ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
        <Typography level="body-xs">
          {minuteToHour(episode?.runtime)} • {ymdToDmy(episode?.air_date)}
        </Typography>
        {imdbEpisodeId && (
          <ParentalGuide
            imdbId={imdbEpisodeId}
            title={episode?.name}
            variant="icon"
          />
        )}
      </Box>
    </Card>
  );
}

export default EpisodeCard;
