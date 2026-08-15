/**
 * IMDb user reviews.
 *
 * Distinct from this app's own review section: these are IMDb's, so they carry
 * IMDb's helpfulness votes and 1-10 author ratings, and they are read-only.
 * Long reviews are clamped until expanded — the median IMDb review is several
 * paragraphs and would otherwise bury everything below it.
 */

import { Box, Button, Chip, Select, Option, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import {
  ImdbReviewSort,
  ImdbUserReview,
  fetchImdbUserReviews,
} from "../../../service/api/imdb/imdb.api.service";
import { Star, FileText } from "../../ui/icons";
import {
  ImdbCredit,
  ImdbSection,
  LoadMore,
  SectionSpinner,
  SpoilerText,
} from "./ImdbSectionUI";
import { cardSx } from "./imdbShared";

const PAGE_SIZE = 10;
const CLAMP_LINES = 6;

const SORTS: Array<{ value: ImdbReviewSort; label: string }> = [
  { value: "helpfulness", label: "Most helpful" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "votes", label: "Most voted" },
];

function ReviewCard({ review }: { review: ImdbUserReview }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={cardSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mb: 0.75,
        }}
      >
        {review.authorRating !== undefined && (
          <Chip
            size="sm"
            variant="soft"
            color="warning"
            startDecorator={<Star sx={{ fontSize: 12 }} />}
            sx={{ fontWeight: 700 }}
          >
            {review.authorRating}/10
          </Chip>
        )}
        {review.summary && (
          <Typography level="title-sm" textColor="neutral.200" sx={{ minWidth: 0 }}>
            {review.summary}
          </Typography>
        )}
      </Box>

      <SpoilerText isSpoiler={review.isSpoiler}>
        <Typography
          level="body-sm"
          textColor="neutral.300"
          sx={
            expanded
              ? { whiteSpace: "pre-line" }
              : {
                  whiteSpace: "pre-line",
                  display: "-webkit-box",
                  WebkitLineClamp: CLAMP_LINES,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
          }
        >
          {review.text}
        </Typography>
      </SpoilerText>

      {review.text.length > 400 && (
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => setExpanded((value) => !value)}
          sx={{ mt: 0.5, fontSize: 11, py: 0, px: 0.5, minHeight: 0 }}
        >
          {expanded ? "Show less" : "Read more"}
        </Button>
      )}

      <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.75 }}>
        {[
          review.authorName,
          review.submissionDate,
          review.upVotes > 0
            ? `${review.upVotes.toLocaleString()} of ${(
                review.upVotes + review.downVotes
              ).toLocaleString()} found this helpful`
            : "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </Typography>
    </Box>
  );
}

function ImdbUserReviews({ imdbId, total: initialTotal }: { imdbId: string; total: number }) {
  const [reviews, setReviews] = useState<ImdbUserReview[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ImdbReviewSort>("helpfulness");

  const load = async (after?: string, nextSort: ImdbReviewSort = sort) => {
    setLoading(true);
    const page = await fetchImdbUserReviews(imdbId, {
      limit: PAGE_SIZE,
      after,
      sort: nextSort,
    });
    setReviews((prev) => (after ? [...prev, ...page.items] : page.items));
    setCursor(page.nextCursor);
    setTotal(page.total);
    setHasMore(page.hasMore);
    setLoading(false);
  };

  // Re-runs on sort change too, which restarts paging from the top.
  useEffect(() => {
    setReviews([]);
    setCursor(undefined);
    setHasMore(false);
    if (imdbId) void load(undefined, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId, sort]);

  if (!initialTotal) return null;

  return (
    <ImdbSection
      title="IMDb reviews"
      icon={<FileText sx={{ fontSize: 22 }} />}
      count={total}
      action={
        <Select
          size="sm"
          value={sort}
          onChange={(_, value) => value && setSort(value)}
          sx={{ minWidth: 150 }}
        >
          {SORTS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      }
    >
      {loading && !reviews.length ? (
        <SectionSpinner />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMore && (
            <LoadMore
              loading={loading}
              remaining={Math.max(total - reviews.length, 0)}
              onClick={() => void load(cursor)}
            />
          )}
        </Box>
      )}

      <ImdbCredit note="Reviews written by IMDb users" />
    </ImdbSection>
  );
}

export default ImdbUserReviews;
