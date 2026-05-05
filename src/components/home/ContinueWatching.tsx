import { Box, Card, CardCover, IconButton, LinearProgress, Tooltip, Typography } from "@mui/joy";
import { Close, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User, RecentlyWatchedItem } from "../../user";
import { getPlaybackTarget } from "../../utilities/playbackTarget";

function ContinueWatching() {
  const { myselfData, upsertRecentlyWatched } = useUsers();
  const navigate = useNavigate();
  const user = myselfData?.data as User;

  const items: RecentlyWatchedItem[] = (user?.recentlyWatched || [])
    .filter((item) => Number(item.currentTime) > 60 && Number(item.duration) > 0)
    .sort(
      (a, b) =>
        new Date(b.lastWatchedAt || 0).getTime() -
        new Date(a.lastWatchedAt || 0).getTime(),
    )
    .slice(0, 12);

  if (!items.length) return null;

  const getProgress = (item: RecentlyWatchedItem) => {
    const pct = (Number(item.currentTime) / Number(item.duration)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const handleRemove = async (item: RecentlyWatchedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await upsertRecentlyWatched(
      item.type,
      item.id,
      item.poster || "",
      item.title || "",
      item.duration || 0,
      0,
      item.currentSeason || 0,
      item.currentEpisode || 0,
      item.nextSeason || 0,
      item.nextEpisode || 0,
    );
  };

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        level="h1"
        sx={{
          mb: 3,
          color: "rgb(255, 216, 77)",
          "@media (max-width: 700px)": { fontSize: "25px" },
        }}
      >
        Continue Watching
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "scroll",
          pb: 1,
          paddingRight: "24px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          maskImage: "linear-gradient(to right, black 95%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 95%, transparent 100%)",
        }}
      >
        {items.map((item) => {
          const target = getPlaybackTarget({
            mediaType: item.type,
            mediaId: item.id,
            recentItem: item,
          });

          return (
            <Box
              key={`${item.type}-${item.id}`}
              sx={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
              onClick={() => navigate(target.route)}
            >
              <Card
                sx={{
                  width: "250px",
                  minHeight: "180px",
                  background: "transparent",
                  overflow: "hidden",
                  "@media (max-width: 800px)": { width: "200px", minHeight: "150px" },
                  "&:hover .cw-play-overlay": { opacity: 1 },
                  "&:hover": {
                    transform: "scale(1.03)",
                    transition: "transform 0.2s ease",
                  },
                }}
              >
                <CardCover>
                  <img
                    src={
                      item.poster
                        ? `https://image.tmdb.org/t/p/w500${item.poster}`
                        : "/placeholder.jpg"
                    }
                    alt={item.title}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </CardCover>
                <CardCover
                  sx={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 60%)",
                  }}
                />

                {/* Play overlay */}
                <Box
                  className="cw-play-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlayArrow sx={{ color: "black", fontSize: 28 }} />
                  </Box>
                </Box>

                {/* Title + episode */}
                <Box sx={{ position: "absolute", bottom: 20, left: 8, right: 8 }}>
                  <Typography
                    level="body-sm"
                    noWrap
                    sx={{ color: "white", fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>
                  {item.type === "tv" && item.currentSeason && (
                    <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      S{item.currentSeason} · E{item.currentEpisode}
                    </Typography>
                  )}
                </Box>

                {/* Progress bar */}
                <Box sx={{ position: "absolute", bottom: 8, left: 0, right: 0, px: 1 }}>
                  <LinearProgress
                    determinate
                    value={getProgress(item)}
                    sx={{
                      height: "3px",
                      borderRadius: 999,
                      "--LinearProgress-progressColor": "rgb(255,220,92)",
                      "--LinearProgress-trackColor": "rgba(255,255,255,0.25)",
                    }}
                  />
                </Box>
              </Card>

              {/* Remove button */}
              <Tooltip title="Remove from Continue Watching" placement="top">
                <IconButton
                  size="sm"
                  variant="solid"
                  color="neutral"
                  onClick={(e) => handleRemove(item, e)}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)",
                    "&:hover": { background: "rgba(0,0,0,0.9)" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default ContinueWatching;
