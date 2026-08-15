/**
 * Awards and nominations, most prestigious first.
 *
 * IMDb returns a flat list of nominations; the interesting unit for a reader is
 * the ceremony, so they are grouped by event and year as they arrive. Grouping
 * happens on the rendered list rather than upfront, so paging in more entries
 * folds them into the groups already on screen.
 */

import { Box, Chip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import {
  ImdbAward,
  ImdbAwardsSummary,
  fetchImdbAwards,
} from "../../../service/api/imdb/imdb.api.service";
import { Trophy } from "../../ui/icons";
import { ImdbCredit, ImdbSection, LoadMore, SectionSpinner } from "./ImdbSectionUI";
import { cardSx } from "./imdbShared";

const PAGE_SIZE = 25;

/** Group nominations under "Academy Awards, USA 1995", preserving order. */
function groupByEvent(awards: ImdbAward[]) {
  const groups: Array<{ key: string; label: string; awards: ImdbAward[] }> = [];
  const index = new Map<string, number>();

  for (const award of awards) {
    const label = [award.event ?? award.name, award.year].filter(Boolean).join(" ");
    const key = label || award.name;

    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ key, label: key, awards: [] });
    }
    groups[index.get(key)!].awards.push(award);
  }

  return groups;
}

function AwardRow({ award }: { award: ImdbAward }) {
  return (
    <Box sx={{ ...cardSx, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Chip
        size="sm"
        variant="soft"
        color={award.isWinner ? "warning" : "neutral"}
        sx={{ fontWeight: 700, flexShrink: 0, mt: 0.25 }}
      >
        {award.isWinner ? "Winner" : "Nominee"}
      </Chip>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-sm" textColor="neutral.200">
          {award.category ?? award.name}
        </Typography>
        {award.names.length > 0 && (
          <Typography level="body-xs" textColor="neutral.400">
            {award.names.map((person) => person.name).join(", ")}
          </Typography>
        )}
        {award.notes && (
          <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.25 }}>
            {award.notes}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ImdbAwards({
  imdbId,
  summary,
}: {
  imdbId: string;
  summary: ImdbAwardsSummary;
}) {
  const [awards, setAwards] = useState<ImdbAward[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [total, setTotal] = useState(summary.totalNominations);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (after?: string) => {
    setLoading(true);
    const page = await fetchImdbAwards(imdbId, { limit: PAGE_SIZE, after });
    setAwards((prev) => (after ? [...prev, ...page.items] : page.items));
    setCursor(page.nextCursor);
    setTotal(page.total);
    setHasMore(page.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    setAwards([]);
    setCursor(undefined);
    setHasMore(false);
    if (imdbId) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId]);

  if (!summary.totalNominations) return null;

  const { topAward, topAwardWins, topAwardNominations } = summary;

  return (
    <ImdbSection title="Awards" icon={<Trophy sx={{ fontSize: 22 }} />}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {topAward && (topAwardWins > 0 || topAwardNominations > 0) && (
          <Chip variant="soft" color="warning" sx={{ fontWeight: 700 }}>
            {topAwardWins > 0
              ? `Won ${topAwardWins} ${topAward.name}${topAwardWins > 1 ? "s" : ""}`
              : `Nominated for ${topAwardNominations} ${topAward.name}${
                  topAwardNominations > 1 ? "s" : ""
                }`}
          </Chip>
        )}
        <Chip variant="soft" color="neutral" sx={{ fontWeight: 600 }}>
          {summary.totalWins.toLocaleString()} wins
        </Chip>
        <Chip variant="soft" color="neutral" sx={{ fontWeight: 600 }}>
          {summary.totalNominations.toLocaleString()} nominations
        </Chip>
      </Box>

      {loading && !awards.length ? (
        <SectionSpinner />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {groupByEvent(awards).map((group) => (
            <Box key={group.key} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography level="title-sm" textColor="neutral.300">
                {group.label}
              </Typography>
              {group.awards.map((award) => (
                <AwardRow key={award.id} award={award} />
              ))}
            </Box>
          ))}

          {hasMore && (
            <LoadMore
              loading={loading}
              remaining={Math.max(total - awards.length, 0)}
              onClick={() => void load(cursor)}
            />
          )}
        </Box>
      )}

      <ImdbCredit />
    </ImdbSection>
  );
}

export default ImdbAwards;
