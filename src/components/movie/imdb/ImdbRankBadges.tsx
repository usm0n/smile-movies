/**
 * IMDb chart standing, as compact badges for the title header.
 *
 * Two different numbers, easy to confuse: `topRank` is the all-time ranked
 * chart — only the first 250 entries are the famous "Top 250", and IMDb keeps
 * numbering well past that, so anything beyond is not worth a badge.
 * `meterRank` is the weekly popularity meter, which is about current attention
 * rather than quality, and is shown with its direction of travel.
 */

import { Chip, Tooltip } from "@mui/joy";
import { ImdbRanking } from "../../../service/api/imdb/imdb.api.service";
import { Star, TrendingDown, TrendingUp } from "../../ui/icons";

const TOP_CHART_LIMIT = 250;

function ImdbRankBadges({ ranking }: { ranking: ImdbRanking }) {
  const isTopChart =
    typeof ranking.topRank === "number" && ranking.topRank <= TOP_CHART_LIMIT;
  const hasMeter = typeof ranking.meterRank === "number";

  if (!isTopChart && !hasMeter) return null;

  const rising = ranking.meterDirection === "UP";

  return (
    <>
      {isTopChart && (
        <Tooltip title="Position in IMDb's Top 250" variant="soft" size="sm">
          <Chip
            size="sm"
            variant="soft"
            color="warning"
            startDecorator={<Star sx={{ fontSize: 13 }} />}
            sx={{ fontWeight: 700 }}
          >
            Top 250 #{ranking.topRank}
          </Chip>
        </Tooltip>
      )}

      {hasMeter && (
        <Tooltip
          title={
            ranking.meterDifference
              ? `IMDb popularity this week — ${
                  rising ? "up" : "down"
                } ${ranking.meterDifference}`
              : "IMDb popularity this week"
          }
          variant="soft"
          size="sm"
        >
          <Chip
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={
              rising ? (
                <TrendingUp sx={{ fontSize: 13 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 13 }} />
              )
            }
            sx={{ fontWeight: 700 }}
          >
            #{ranking.meterRank}
          </Chip>
        </Tooltip>
      )}
    </>
  );
}

export default ImdbRankBadges;
