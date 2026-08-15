/**
 * All of the IMDb-sourced sections for a title page, in reading order.
 *
 * One entry point so `Movie` and `TVSeries` stay unchanged apart from a single
 * element, and one details request feeds every section below — the individual
 * sections only fetch their own long lists, and only when they have something
 * to show (their counts come from the same details payload).
 *
 * The whole block is optional. If IMDb is unreachable, or TMDB has no tt-ID for
 * the title, this renders nothing and the page is exactly as it was.
 */

import { Box, Divider } from "@mui/joy";
import { ImdbTitleDetailsState } from "../../../utilities/useImdbTitleDetails";
import ImdbAwards from "./ImdbAwards";
import ImdbConnections from "./ImdbConnections";
import ImdbDidYouKnow from "./ImdbDidYouKnow";
import ImdbFilmingLocations from "./ImdbFilmingLocations";
import ImdbTitleFacts from "./ImdbTitleFacts";
import { hasTitleFacts } from "./imdbShared";
import ImdbUserReviews from "./ImdbUserReviews";

function ImdbTitleExtras({ state }: { state: ImdbTitleDetailsState }) {
  const { imdbId, details } = state;
  if (!imdbId || !details) return null;

  const { counts } = details;

  // Each entry renders only when IMDb actually has that data, so the dividers
  // are placed from the surviving list rather than hardcoded between sections.
  const hasDidYouKnow =
    counts.trivia +
      counts.goofs +
      counts.quotes +
      counts.crazyCredits +
      counts.alternateVersions >
    0;

  const sections = [
    hasTitleFacts(details) && <ImdbTitleFacts key="facts" details={details} />,
    details.awards.totalNominations > 0 && (
      <ImdbAwards key="awards" imdbId={imdbId} summary={details.awards} />
    ),
    hasDidYouKnow && <ImdbDidYouKnow key="dyk" imdbId={imdbId} counts={counts} />,
    counts.filmingLocations > 0 && (
      <ImdbFilmingLocations
        key="locations"
        imdbId={imdbId}
        total={counts.filmingLocations}
      />
    ),
    counts.connections > 0 && (
      <ImdbConnections key="connections" imdbId={imdbId} total={counts.connections} />
    ),
    counts.reviews > 0 && (
      <ImdbUserReviews key="reviews" imdbId={imdbId} total={counts.reviews} />
    ),
  ].filter(Boolean) as JSX.Element[];

  if (!sections.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {sections.map((section, index) => (
        <Box
          key={section.key}
          sx={{ display: "flex", flexDirection: "column", gap: 5 }}
        >
          {section}
          {index < sections.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
}

export default ImdbTitleExtras;
