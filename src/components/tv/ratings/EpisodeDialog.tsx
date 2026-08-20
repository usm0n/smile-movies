import { Box, Link, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "../../ui/Dialog";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { Check, LaunchRounded, PlayArrow, Star } from "../../ui/icons";
import { tmdb } from "../../../service/api/tmdb/tmdb.api.service";
import { tvEpisodeDetails } from "../../../tmdb-res";
import {
  EpisodePoint,
  ProgressState,
  TIER_COLORS,
  formatAirDate,
  formatVotes,
  getTier,
} from "./ratingsShared";

/**
 * What a cell click opens: IMDb's numbers alongside TMDB's still and synopsis,
 * with the two actions that belong to a single episode — play it, or move the
 * viewer's "you are here" marker to it.
 */
function EpisodeDialog({
  point,
  state,
  tvId,
  onClose,
  onMarkCurrent,
  markBusy,
}: {
  point: EpisodePoint | null;
  state: ProgressState;
  tvId: string;
  onClose: () => void;
  onMarkCurrent?: (point: EpisodePoint) => void;
  markBusy?: boolean;
}) {
  const navigate = useNavigate();
  const [details, setDetails] = useState<tvEpisodeDetails | null>(null);

  useEffect(() => {
    if (!point) {
      setDetails(null);
      return;
    }

    let cancelled = false;
    setDetails(null);
    void tmdb
      .tvEpisodeDetails(tvId, point.season, point.episode)
      .then((response) => {
        // The service resolves errors rather than throwing them, so anything
        // without an `id` is a miss, not an episode.
        if (cancelled || !response || !("id" in response)) return;
        setDetails(response as tvEpisodeDetails);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [point?.season, point?.episode, tvId]);

  if (!point) return null;

  const color = TIER_COLORS[getTier(point.rating)];
  const still = details?.still_path;
  const overview = details?.overview || point.episodeData.plot || "";
  const airDate = details?.air_date
    ? new Date(details.air_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : formatAirDate(point.episodeData.releaseDate);

  return (
    <Dialog
      open
      onClose={onClose}
      width={520}
      title={point.title}
      description={`Season ${point.season}, episode ${point.episode}${
        airDate ? ` · ${airDate}` : ""
      }`}
      actions={
        <>
          {onMarkCurrent && state !== "current" && (
            <Button
              variant="outlined"
              color="neutral"
              loading={markBusy}
              startDecorator={<Check sx={{ fontSize: 16 }} />}
              onClick={() => onMarkCurrent(point)}
            >
              I'm on this one
            </Button>
          )}
          <Button
            variant="solid"
            color="primary"
            startDecorator={<PlayArrow sx={{ fontSize: 16 }} />}
            onClick={() => navigate(`/tv/${tvId}/${point.season}/${point.episode}/watch`)}
          >
            Play
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {still && (
          <Box
            sx={{
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              aspectRatio: "16 / 9",
              backgroundColor: "background.level1",
            }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${still}`}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {point.rating > 0 ? (
            <Badge
              mono
              startDecorator={<Star sx={{ fontSize: 12 }} />}
              sx={{
                color: color.text,
                borderColor: `${color.border}66`,
                backgroundColor: `${color.border}1f`,
              }}
            >
              {point.rating.toFixed(1)}
            </Badge>
          ) : (
            <Badge mono>Not rated yet</Badge>
          )}
          {point.votes > 0 && <Badge mono>{formatVotes(point.votes)} votes</Badge>}
          {details?.runtime ? <Badge mono>{details.runtime}m</Badge> : null}
          {state === "current" && <Badge tone="contrast">You're here</Badge>}
          {state === "next" && <Badge tone="blue">Next up</Badge>}
          {state === "watched" && <Badge tone="green">Watched</Badge>}
        </Box>

        {overview && (
          <Typography level="body-sm" textColor="neutral.300">
            {overview}
          </Typography>
        )}

        {point.episodeData.id && (
          <Box>
            <Link
              href={`https://www.imdb.com/title/${point.episodeData.id}/`}
              target="_blank"
              rel="noreferrer"
              level="body-sm"
              endDecorator={<LaunchRounded sx={{ fontSize: 14 }} />}
              sx={{ color: "#F5C518" }}
            >
              View on IMDb
            </Link>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

export default EpisodeDialog;
