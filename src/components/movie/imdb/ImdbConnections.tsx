/**
 * How this title relates to others: sequels, remakes, references, spin-offs.
 *
 * IMDb identifies the related titles by tt-ID, which this app cannot route to,
 * so a click resolves the tt-ID back to a TMDB id and navigates in-app. Titles
 * TMDB has never indexed (a lot of the "referenced in" long tail) fall back to
 * opening IMDb, rather than silently doing nothing.
 */

import { Box, Chip, CircularProgress, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImdbConnection,
  fetchImdbConnections,
  findByImdbId,
} from "../../../service/api/imdb/imdb.api.service";
import { Layers } from "../../ui/icons";
import { ImdbCredit, ImdbSection, LoadMore, SectionSpinner } from "./ImdbSectionUI";
import { cardSx } from "./imdbShared";

const PAGE_SIZE = 20;

/**
 * IMDb's connection list is dominated by trivia-grade links ("referenced in" a
 * clip show). These are the categories a viewer of the title actually cares
 * about, in the order they should appear.
 */
const PRIMARY_CATEGORIES = [
  "follows",
  "followed_by",
  "remake_of",
  "remade_as",
  "spin_off_from",
  "spin_off",
  "version_of",
];

const categoryRank = (id: string) => {
  const index = PRIMARY_CATEGORIES.indexOf(id);
  return index === -1 ? PRIMARY_CATEGORIES.length : index;
};

function ConnectionCard({ connection }: { connection: ImdbConnection }) {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(false);

  const open = async () => {
    if (resolving) return;
    setResolving(true);
    const match = await findByImdbId(connection.title.id);
    setResolving(false);

    if (match) {
      navigate(`/${match.mediaType === "tv" ? "tv" : "movie"}/${match.id}`);
      return;
    }
    window.open(
      `https://www.imdb.com/title/${connection.title.id}/`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Box
      onClick={() => void open()}
      sx={{
        ...cardSx,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
        transition: "background 0.2s ease",
        "&:hover": { background: "rgba(255,255,255,0.08)" },
      }}
    >
      {connection.title.imageUrl ? (
        <Box
          component="img"
          src={connection.title.imageUrl}
          alt=""
          loading="lazy"
          sx={{
            width: 40,
            height: 60,
            objectFit: "cover",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 60,
            borderRadius: "4px",
            flexShrink: 0,
            background: "rgba(255,255,255,0.06)",
          }}
        />
      )}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Chip size="sm" variant="soft" color="neutral" sx={{ fontSize: 10, mb: 0.4 }}>
          {connection.category.text}
        </Chip>
        <Typography level="body-sm" textColor="neutral.200" noWrap>
          {connection.title.name}
        </Typography>
        <Typography level="body-xs" textColor="neutral.500">
          {[connection.title.year, connection.title.type].filter(Boolean).join(" · ")}
        </Typography>
      </Box>

      {resolving && <CircularProgress size="sm" />}
    </Box>
  );
}

function ImdbConnections({ imdbId, total: initialTotal }: { imdbId: string; total: number }) {
  const [connections, setConnections] = useState<ImdbConnection[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (after?: string) => {
    setLoading(true);
    const page = await fetchImdbConnections(imdbId, { limit: PAGE_SIZE, after });
    setConnections((prev) => (after ? [...prev, ...page.items] : page.items));
    setCursor(page.nextCursor);
    setTotal(page.total);
    setHasMore(page.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    setConnections([]);
    setCursor(undefined);
    setHasMore(false);
    if (imdbId) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId]);

  if (!initialTotal) return null;

  // Sort only what has been paged in, so ordering stays stable as more loads.
  const ordered = [...connections].sort(
    (a, b) => categoryRank(a.category.id) - categoryRank(b.category.id)
  );

  return (
    <ImdbSection
      title="Connections"
      icon={<Layers sx={{ fontSize: 22 }} />}
      count={total}
    >
      {loading && !connections.length ? (
        <SectionSpinner />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                // minmax(0, …) rather than 1fr: a bare 1fr track is floored at
                // its content's min width, and the no-wrap title inside these
                // cards is one long unbreakable line — on a phone that widened
                // the track past the viewport and gave the whole page a
                // horizontal scroll.
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1,
            }}
          >
            {ordered.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </Box>

          {hasMore && (
            <LoadMore
              loading={loading}
              remaining={Math.max(total - connections.length, 0)}
              onClick={() => void load(cursor)}
            />
          )}
        </Box>
      )}

      <ImdbCredit />
    </ImdbSection>
  );
}

export default ImdbConnections;
