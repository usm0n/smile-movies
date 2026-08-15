/**
 * Where the title was shot.
 *
 * IMDb orders locations by user interest, so the first page is the set worth
 * showing; the rest are behind "show more". Each entry links out to a map
 * search rather than embedding one, which would mean shipping a map SDK for a
 * section most viewers scroll past.
 */

import { Box, Link, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import {
  ImdbFilmingLocation,
  fetchImdbFilmingLocations,
} from "../../../service/api/imdb/imdb.api.service";
import { MapPin } from "../../ui/icons";
import {
  ImdbCredit,
  ImdbSection,
  LoadMore,
  SectionSpinner,
} from "./ImdbSectionUI";
import { cardSx, interestShare } from "./imdbShared";

const PAGE_SIZE = 20;

const mapUrl = (location: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

function ImdbFilmingLocations({
  imdbId,
  total: initialTotal,
}: {
  imdbId: string;
  total: number;
}) {
  const [locations, setLocations] = useState<ImdbFilmingLocation[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (after?: string) => {
    setLoading(true);
    const page = await fetchImdbFilmingLocations(imdbId, {
      limit: PAGE_SIZE,
      after,
    });
    setLocations((prev) => (after ? [...prev, ...page.items] : page.items));
    setCursor(page.nextCursor);
    setTotal(page.total);
    setHasMore(page.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    setLocations([]);
    setCursor(undefined);
    setHasMore(false);
    if (imdbId) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId]);

  if (!initialTotal) return null;

  return (
    <ImdbSection
      title="Filming locations"
      icon={<MapPin sx={{ fontSize: 22 }} />}
      count={total}
    >
      {loading && !locations.length ? (
        <SectionSpinner />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {locations.map((entry) => {
            const share = interestShare(entry.interest);
            return (
              <Box key={entry.id} sx={cardSx}>
                <Link
                  href={mapUrl(entry.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  level="body-sm"
                  textColor="neutral.200"
                  startDecorator={<MapPin sx={{ fontSize: 14 }} />}
                  sx={{ textDecoration: "none" }}
                >
                  {entry.location}
                </Link>
                {entry.note && (
                  <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.25 }}>
                    {entry.note}
                  </Typography>
                )}
                {share !== null && (
                  <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.25 }}>
                    {share}% found this interesting
                  </Typography>
                )}
              </Box>
            );
          })}

          {hasMore && (
            <LoadMore
              loading={loading}
              remaining={Math.max(total - locations.length, 0)}
              onClick={() => void load(cursor)}
            />
          )}
        </Box>
      )}

      <ImdbCredit />
    </ImdbSection>
  );
}

export default ImdbFilmingLocations;
