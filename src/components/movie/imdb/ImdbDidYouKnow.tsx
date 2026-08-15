/**
 * IMDb's "Did you know" material: trivia, goofs, quotes, crazy credits and
 * alternate versions.
 *
 * These are long lists that most viewers never open, so nothing is fetched
 * until a tab is selected, and each tab keeps its own cursor so switching back
 * and forth doesn't refetch what was already paged in.
 */

import { Box, Chip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import {
  ImdbFactItem,
  ImdbFactKind,
  ImdbQuote,
  ImdbSectionCounts,
  fetchImdbFacts,
  fetchImdbQuotes,
} from "../../../service/api/imdb/imdb.api.service";
import { Bug, Lightbulb, Layers, Quote as QuoteIcon, Clapperboard } from "../../ui/icons";
import {
  ImdbCredit,
  ImdbSection,
  LoadMore,
  SectionSpinner,
  SpoilerText,
} from "./ImdbSectionUI";
import { cardSx, interestShare } from "./imdbShared";

const PAGE_SIZE = 10;

/** Quotes come back shaped differently, so they get their own tab id. */
type TabId = ImdbFactKind | "quotes";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: JSX.Element;
  countKey: keyof ImdbSectionCounts;
}> = [
  { id: "trivia", label: "Trivia", icon: <Lightbulb sx={{ fontSize: 15 }} />, countKey: "trivia" },
  { id: "goofs", label: "Goofs", icon: <Bug sx={{ fontSize: 15 }} />, countKey: "goofs" },
  { id: "quotes", label: "Quotes", icon: <QuoteIcon sx={{ fontSize: 15 }} />, countKey: "quotes" },
  {
    id: "crazyCredits",
    label: "Crazy credits",
    icon: <Clapperboard sx={{ fontSize: 15 }} />,
    countKey: "crazyCredits",
  },
  {
    id: "alternateVersions",
    label: "Alternate versions",
    icon: <Layers sx={{ fontSize: 15 }} />,
    countKey: "alternateVersions",
  },
];

type TabState = {
  facts: ImdbFactItem[];
  quotes: ImdbQuote[];
  cursor?: string;
  total: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
};

const EMPTY_TAB: TabState = {
  facts: [],
  quotes: [],
  total: 0,
  hasMore: false,
  loading: false,
  loaded: false,
};

function InterestNote({ share }: { share: number | null }) {
  if (share === null) return null;
  return (
    <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.5 }}>
      {share}% found this interesting
    </Typography>
  );
}

function QuoteBlock({ quote }: { quote: ImdbQuote }) {
  return (
    <Box sx={cardSx}>
      <SpoilerText isSpoiler={quote.isSpoiler}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {quote.lines.map((line, index) => (
            <Box key={index}>
              {line.character && (
                <Typography level="body-xs" textColor="neutral.400" sx={{ fontWeight: 700 }}>
                  {line.character}
                  {line.stageDirection ? ` (${line.stageDirection})` : ""}
                </Typography>
              )}
              <Typography level="body-sm" textColor="neutral.300">
                {line.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </SpoilerText>
      <InterestNote share={interestShare(quote.interest)} />
    </Box>
  );
}

function FactBlock({ fact }: { fact: ImdbFactItem }) {
  return (
    <Box sx={cardSx}>
      {fact.category && (
        <Chip size="sm" variant="soft" color="neutral" sx={{ mb: 0.75, fontSize: 10 }}>
          {fact.category.text}
        </Chip>
      )}
      <SpoilerText isSpoiler={fact.isSpoiler} text={fact.text} />
      <InterestNote share={interestShare(fact.interest)} />
    </Box>
  );
}

function ImdbDidYouKnow({
  imdbId,
  counts,
}: {
  imdbId: string;
  counts: ImdbSectionCounts;
}) {
  const available = TABS.filter((tab) => counts[tab.countKey] > 0);
  const [active, setActive] = useState<TabId | null>(available[0]?.id ?? null);
  const [state, setState] = useState<Record<string, TabState>>({});

  const current = (active && state[active]) || EMPTY_TAB;

  useEffect(() => {
    // Reset when the page moves to a different title.
    setState({});
    setActive(available[0]?.id ?? null);
    // `available` is derived from counts, which is stable per title.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId]);

  const load = async (tab: TabId, cursor?: string) => {
    setState((prev) => ({
      ...prev,
      [tab]: { ...(prev[tab] ?? EMPTY_TAB), loading: true },
    }));

    const page =
      tab === "quotes"
        ? await fetchImdbQuotes(imdbId, { limit: PAGE_SIZE, after: cursor })
        : await fetchImdbFacts(imdbId, tab, { limit: PAGE_SIZE, after: cursor });

    setState((prev) => {
      const previous = prev[tab] ?? EMPTY_TAB;
      return {
        ...prev,
        [tab]: {
          facts:
            tab === "quotes"
              ? previous.facts
              : [...previous.facts, ...(page.items as ImdbFactItem[])],
          quotes:
            tab === "quotes"
              ? [...previous.quotes, ...(page.items as ImdbQuote[])]
              : previous.quotes,
          cursor: page.nextCursor,
          total: page.total,
          hasMore: page.hasMore,
          loading: false,
          loaded: true,
        },
      };
    });
  };

  useEffect(() => {
    if (!active || !imdbId) return;
    if (state[active]?.loaded || state[active]?.loading) return;
    void load(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, imdbId]);

  if (!available.length) return null;

  const shown = active === "quotes" ? current.quotes.length : current.facts.length;

  return (
    <ImdbSection
      title="Did you know"
      icon={<Lightbulb sx={{ fontSize: 22 }} />}
    >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {available.map((tab) => (
          <Chip
            key={tab.id}
            variant={active === tab.id ? "solid" : "soft"}
            color={active === tab.id ? "primary" : "neutral"}
            startDecorator={tab.icon}
            onClick={() => setActive(tab.id)}
            sx={{ cursor: "pointer", fontWeight: 600 }}
          >
            {tab.label} ({counts[tab.countKey].toLocaleString()})
          </Chip>
        ))}
      </Box>

      {current.loading && !shown ? (
        <SectionSpinner />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {active === "quotes"
            ? current.quotes.map((quote) => <QuoteBlock key={quote.id} quote={quote} />)
            : current.facts.map((fact) => <FactBlock key={fact.id} fact={fact} />)}

          {current.loaded && !shown && (
            <Typography level="body-sm" textColor="neutral.500">
              Nothing listed here yet.
            </Typography>
          )}

          {current.hasMore && (
            <LoadMore
              loading={current.loading}
              remaining={Math.max(current.total - shown, 0)}
              onClick={() => active && void load(active, current.cursor)}
            />
          )}
        </Box>
      )}

      <ImdbCredit note="Contributed by IMDb users" />
    </ImdbSection>
  );
}

export default ImdbDidYouKnow;
