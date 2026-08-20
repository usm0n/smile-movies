/**
 * IMDb chart standing, as one compact badge for the title header.
 *
 * Only the all-time ranked chart is worth a badge, and only its first 250
 * entries — IMDb keeps numbering well past that, and "Top 250 #66" means
 * something to everyone while "#1,842" means nothing. The weekly popularity
 * meter used to sit here too; it measures current attention rather than
 * quality, which is industry trivia, so it no longer earns a place in the hero.
 */

import { Chip, Tooltip } from "@mui/joy";
import { ImdbRanking } from "../../../service/api/imdb/imdb.api.service";
import { Star } from "../../ui/icons";

const TOP_CHART_LIMIT = 250;

function ImdbRankBadges({ ranking }: { ranking: ImdbRanking }) {
  const isTopChart =
    typeof ranking.topRank === "number" && ranking.topRank <= TOP_CHART_LIMIT;

  if (!isTopChart) return null;

  return (
    <Tooltip title="Position in IMDb's Top 250" variant="soft" size="sm">
      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={<Star sx={{ fontSize: 13 }} />}
        sx={{ fontWeight: 600, maxWidth: "100%" }}
      >
        Top 250 #{ranking.topRank}
      </Chip>
    </Tooltip>
  );
}

export default ImdbRankBadges;
