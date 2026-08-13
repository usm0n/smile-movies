import { Box, Card, Dropdown, LinearProgress, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import BlurImage from "../../utilities/blurImage";
import { tvEpisodeDetails } from "../../tmdb-res";
import { minuteToHour, shareLink, ymdToDmy } from "../../utilities/defaults";
import { IosShare, MoreHoriz, PlayArrow, Star as StarIcon } from "../ui/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ParentalGuide from "../movie/ParentalGuide";

function EpisodeCard({
  episode,
  tvId,
  imdbRating,
  imdbEpisodeId,
  progressValue = 0,
  isCompleted = false,
  isInProgress = false,
  isNext = false,
}: {
  episode: tvEpisodeDetails;
  tvId: string | number;
  imdbRating?: number;
  imdbEpisodeId?: string;
  progressValue?: number;
  isCompleted?: boolean;
  isInProgress?: boolean;
  isNext?: boolean;
}) {
  const navigate = useNavigate();
  const [spoiled, _setSpoiled] = useState(false);

  const hasThumbnail = !!episode?.still_path;

  return (
    <Card
      onClick={() => navigate(`/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}
      sx={{
        gap: 0.75,
        p: 1.5,
        cursor: "pointer",
        position: "relative",
        flex: "0 0 270px",
        width: 270,
        maxWidth: 270,
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "lg",
        backgroundColor: "background.surface",
        transition: "border-color 150ms ease, background-color 150ms ease",
        ":hover": { borderColor: "#333", backgroundColor: "background.level1" },
      }}
    >
      {/* ── Three-dot menu (wrapped: Card injects data-first-child into its
          first child, and Dropdown does not accept DOM props) ── */}
      <Box>
        <Dropdown>
        <MenuButton
          onClick={(e) => e.stopPropagation()}
          aria-label="Episode actions"
          slotProps={{
            root: {
              sx: {
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 3,
                minHeight: 28,
                minWidth: 28,
                p: 0,
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#ededed",
              },
            },
          }}
        >
          <MoreHoriz sx={{ fontSize: 16 }} />
        </MenuButton>
        <Menu onClick={(e) => e.stopPropagation()}>
          <MenuItem onClick={() => navigate(`/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}>
            <PlayArrow sx={{ fontSize: 16 }} /> Watch now
          </MenuItem>
          <MenuItem onClick={() => shareLink(`https://smile-movies.uz/tv/${tvId}/${episode?.season_number}/${episode?.episode_number}/watch`)}>
            <IosShare sx={{ fontSize: 16 }} /> Share episode
          </MenuItem>
          </Menu>
        </Dropdown>
      </Box>

      {/* ── Thumbnail with spoil overlay ── */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }}
      >
        {/* The image — blurred until spoiled */}
        <Box sx={{ filter: hasThumbnail && spoiled ? "blur(10px)" : "none", transition: "filter 0.25s ease" }}>
          {BlurImage({
            highQualitySrc: `https://image.tmdb.org/t/p/original${episode?.still_path}`,
            lowQualitySrc: `https://image.tmdb.org/t/p/w200${episode?.still_path}`,
            style: { width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" },
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
              borderRadius: "8px",
              zIndex: 2,
              transition: "opacity 0.2s",
              "&:hover": { background: "rgba(0,0,0,0.28)" },
            }}
          >
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                px: 1.2, py: 0.5, borderRadius: "8px",
                background: "rgba(0,0,0,0.65)",
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
              px: 0.7, py: 0.3, borderRadius: "4px",
              background: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.14)",
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
      <Typography
        level="body-xs"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mt: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        Episode {episode?.episode_number}
      </Typography>
      <Typography
        level="title-sm"
        sx={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 1,
          overflow: "hidden",
        }}
      >
        {episode?.name}
      </Typography>
      <Typography
        level="body-sm"
        sx={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
          minHeight: "3.9em",
        }}
      >
        {episode?.overview}
      </Typography>
      {(isCompleted || isInProgress || isNext) ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <LinearProgress
            determinate
            value={isCompleted ? 100 : isInProgress ? progressValue : 0}
            sx={{
              "--LinearProgress-thickness": "4px",
              color: isCompleted ? "#3ecf8e" : "#ededed",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <Typography level="body-xs" textColor="neutral.400">
            {isCompleted
              ? "Completed"
              : isInProgress
                ? `${Math.round(progressValue)}% complete`
                : "Next episode"}
          </Typography>
        </Box>
      ) : null}

      {/* ── Footer row: runtime + parental guide icon ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
        <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
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
