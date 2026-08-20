import { Box, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { tvDetails } from "../../../tmdb-res";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import {
  Add,
  ArrowBack,
  Check,
  Download,
  IosShare,
  PlayArrow,
  Star,
} from "../../ui/icons";
import { useUsers } from "../../../context/Users";
import { User } from "../../../user";
import { isLoggedIn } from "../../../utilities/defaults";
import BlurImage from "../../../utilities/blurImage";
import { Progress, RatingsStats, TIER_COLORS, getTier } from "./ratingsShared";

/**
 * The masthead: the show's own artwork, the two aggregate numbers that matter
 * (IMDb's series rating and the mean of every episode), and the actions that
 * take the page somewhere — watchlist, share, PNG export, resume.
 */
function RatingsHero({
  tvId,
  tv,
  imdbRating,
  stats,
  seasonCount,
  progress,
  nextUp,
  currentEpisodeTitle,
  onShare,
  onSaveImage,
  onShareImage,
  imageBusy,
  canShareFiles,
}: {
  tvId: string;
  tv?: tvDetails;
  imdbRating: number | null;
  stats: RatingsStats;
  seasonCount: number;
  progress: Progress;
  nextUp: Progress;
  currentEpisodeTitle?: string;
  onShare: () => void;
  onSaveImage: () => void;
  onShareImage: () => void;
  imageBusy: boolean;
  canShareFiles: boolean;
}) {
  const navigate = useNavigate();
  const {
    myselfData,
    addToWatchlist,
    addToWatchlistData,
    removeFromWatchlist,
    removeFromWatchlistData,
  } = useUsers();

  const user = myselfData?.data as User | undefined;
  const watchlistItem = user?.watchlist?.find(
    (item) => item.id === String(tvId) && item.type === "tv",
  );
  const watchlistBusy =
    Boolean(myselfData?.isLoading) ||
    Boolean(addToWatchlistData?.isLoading) ||
    Boolean(removeFromWatchlistData?.isLoading);

  const firstYear = tv?.first_air_date?.slice(0, 4);
  const lastYear = tv?.last_air_date?.slice(0, 4);
  const years =
    firstYear && lastYear && firstYear !== lastYear
      ? `${firstYear}–${tv?.in_production ? "present" : lastYear}`
      : firstYear || "";

  const meta = [
    years,
    seasonCount ? `${seasonCount} season${seasonCount === 1 ? "" : "s"}` : "",
    stats.totalCount ? `${stats.totalCount} episodes` : "",
    tv?.genres
      ?.slice(0, 2)
      .map((genre) => genre.name)
      .join(" · "),
  ]
    .filter(Boolean)
    .join("  ·  ");

  const averageColor = TIER_COLORS[getTier(stats.average)];

  const toggleWatchlist = () => {
    if (!isLoggedIn) {
      navigate("/auth/login");
      return;
    }
    if (watchlistItem) {
      void removeFromWatchlist("tv", String(tvId));
      return;
    }
    void addToWatchlist("tv", String(tvId), tv?.poster_path || "", tv?.name || "");
  };

  const resumeTarget = progress || nextUp;

  return (
    <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
      {/* The backdrop is atmosphere only — it never carries information, so it
          sits far under the text and is heavily dimmed. */}
      {tv?.backdrop_path && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(https://image.tmdb.org/t/p/w780${tv.backdrop_path})`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            opacity: 0.28,
            filter: "blur(2px) saturate(1.1)",
            transform: "scale(1.06)",
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, #000000 22%, rgba(0,0,0,0.86) 55%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          gap: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          borderRadius: "12px",
        }}
      >
        {tv?.poster_path && (
          <Box
            sx={{
              width: { xs: 88, sm: 132 },
              flexShrink: 0,
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
            onClick={() => navigate(`/tv/${tvId}`)}
          >
            <BlurImage
              eager
              lowQualitySrc={`https://image.tmdb.org/t/p/w154${tv.poster_path}`}
              highQualitySrc={`https://image.tmdb.org/t/p/w342${tv.poster_path}`}
              style={{ width: "100%", display: "block", aspectRatio: "2 / 3", objectFit: "cover" }}
            />
          </Box>
        )}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 0.5,
              color: "#F5C518",
            }}
          >
            <Star sx={{ fontSize: 14 }} />
            <Typography
              level="body-xs"
              sx={{ color: "#F5C518", fontWeight: 700, letterSpacing: "0.12em" }}
            >
              IMDB EPISODE RATINGS
            </Typography>
          </Box>

          <Typography
            level="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2.1rem" },
              lineHeight: 1.1,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate(`/tv/${tvId}`)}
          >
            {tv?.name || "Loading…"}
          </Typography>

          {meta && (
            <Typography level="body-sm" sx={{ mt: 0.75 }}>
              {meta}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.5 }}>
            {imdbRating ? (
              <Badge tone="amber" startDecorator={<Star sx={{ fontSize: 12 }} />} mono>
                {imdbRating.toFixed(1)} series
              </Badge>
            ) : null}
            {stats.average > 0 && (
              <Badge
                mono
                sx={{
                  color: averageColor.text,
                  borderColor: `${averageColor.border}66`,
                  backgroundColor: `${averageColor.border}1f`,
                }}
              >
                {stats.average.toFixed(1)} episode avg
              </Badge>
            )}
            {stats.ratedCount > 0 && <Badge mono>{stats.ratedCount} rated</Badge>}
            {stats.trend !== 0 && (
              <Badge tone={stats.trend > 0 ? "green" : "red"} mono>
                {stats.trend > 0 ? "▲" : "▼"} {Math.abs(stats.trend).toFixed(1)} across the run
              </Badge>
            )}
          </Box>

          {resumeTarget && (
            <Box
              sx={{
                mt: 2,
                p: 1.25,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
                backgroundColor: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography level="body-xs" textColor="neutral.500">
                  {progress ? "You're on" : "Next up"}
                </Typography>
                <Typography level="body-sm" sx={{ fontWeight: 600 }} noWrap>
                  S{resumeTarget.season}:E{resumeTarget.episode}
                  {currentEpisodeTitle ? ` · ${currentEpisodeTitle}` : ""}
                </Typography>
              </Box>
              <Button
                size="sm"
                variant="solid"
                color="primary"
                startDecorator={<PlayArrow sx={{ fontSize: 16 }} />}
                onClick={() =>
                  navigate(
                    `/tv/${tvId}/${resumeTarget.season}/${resumeTarget.episode}/watch`,
                  )
                }
              >
                {progress ? "Resume" : "Play"}
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<ArrowBack sx={{ fontSize: 16 }} />}
              onClick={() => navigate(`/tv/${tvId}`)}
            >
              Show
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              loading={watchlistBusy}
              startDecorator={
                watchlistItem ? <Check sx={{ fontSize: 16 }} /> : <Add sx={{ fontSize: 16 }} />
              }
              onClick={toggleWatchlist}
            >
              {watchlistItem ? "In watchlist" : "Watchlist"}
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<IosShare sx={{ fontSize: 16 }} />}
              onClick={onShare}
            >
              Share
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              loading={imageBusy}
              startDecorator={<Download sx={{ fontSize: 16 }} />}
              onClick={onSaveImage}
            >
              Save as image
            </Button>
            {canShareFiles && (
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                loading={imageBusy}
                startDecorator={<IosShare sx={{ fontSize: 16 }} />}
                onClick={onShareImage}
              >
                Share image
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default RatingsHero;
