import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  Input,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUsers } from "../../context/Users";
import { reviewsAPI } from "../../service/api/smb/reviews.api.service";
import { ReviewReactionType, ReviewRecord } from "../../types/reviews";
import { User } from "../../user";

const reactionLabels: Array<{ key: ReviewReactionType; label: string }> = [
  { key: "helpful", label: "Helpful" },
  { key: "funny", label: "Funny" },
  { key: "love", label: "Love" },
];

function ReviewCard({
  review,
  currentUser,
  onRefresh,
}: {
  review: ReviewRecord;
  currentUser?: User;
  onRefresh: () => Promise<void>;
}) {
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.body);
  const [rating, setRating] = useState(String(review.rating));
  const [containsSpoilers, setContainsSpoilers] = useState(review.containsSpoilers);
  const isOwner = currentUser?.id === review.authorUid;

  return (
    <Card sx={{ p: 2, borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "start", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "start" }}>
          <Avatar src={review.authorAvatar}>{review.authorName?.slice(0, 1)}</Avatar>
          <Box>
            <Typography level="title-sm">{review.authorName}</Typography>
            <Typography level="body-xs" textColor="neutral.500">
              @{review.authorHandle} · {review.updatedAt} · Rating {review.rating}/10
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "end" }}>
          {review.containsSpoilers && <Chip size="sm" color="warning">Spoiler</Chip>}
          {review.reportCount > 0 && <Chip size="sm" color="danger">Reports {review.reportCount}</Chip>}
        </Stack>
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        {editing ? (
          <Stack spacing={1.25}>
            <Input
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              type="number"
              slotProps={{ input: { min: 1, max: 10 } }}
            />
            <Textarea minRows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
            <Checkbox
              label="Contains spoilers"
              checked={containsSpoilers}
              onChange={(event) => setContainsSpoilers(event.target.checked)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                onClick={async () => {
                  try {
                    await reviewsAPI.updateReview(review.id, {
                      body: draft,
                      rating: Number(rating),
                      containsSpoilers,
                    });
                    setEditing(false);
                    await onRefresh();
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to update review.");
                  }
                }}
              >
                Save
              </Button>
              <Button variant="outlined" color="neutral" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        ) : review.containsSpoilers && !revealed ? (
          <Stack spacing={1}>
            <Typography level="body-sm" textColor="neutral.400">
              This review is marked as a spoiler.
            </Typography>
            <Button size="sm" variant="soft" onClick={() => setRevealed(true)}>
              Reveal review
            </Button>
          </Stack>
        ) : (
          <Typography level="body-sm" textColor="neutral.200">
            {review.body}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {reactionLabels.map((reaction) => (
            <Button
              key={reaction.key}
              size="sm"
              variant="soft"
              onClick={async () => {
                try {
                  await reviewsAPI.reactToReview(review.id, reaction.key);
                  await onRefresh();
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to react to review.");
                }
              }}
            >
              {reaction.label} {review.reactionCounts?.[reaction.key] || 0}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {!isOwner && (
            <Button
              size="sm"
              color="danger"
              variant="outlined"
              onClick={async () => {
                try {
                  await reviewsAPI.reportReview(review.id, "Reported from Smile Movies web UI");
                  await onRefresh();
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to report review.");
                }
              }}
            >
              Report
            </Button>
          )}
          {isOwner && (
            <>
              <Button size="sm" variant="outlined" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="outlined"
                onClick={async () => {
                  try {
                    await reviewsAPI.deleteReview(review.id);
                    await onRefresh();
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to delete review.");
                  }
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

function ReviewsSection({
  mediaId,
  mediaType,
  title,
}: {
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
}) {
  const { myselfData } = useUsers();
  const currentUser = myselfData?.data as User | undefined;
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState("8");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [posting, setPosting] = useState(false);

  const userReview = useMemo(
    () => reviews.find((review) => review.authorUid === currentUser?.id),
    [reviews, currentUser?.id],
  );

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsAPI.getMediaReviews(mediaType, mediaId);
      setReviews(response.data);
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [mediaId, mediaType]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Typography level="h3">Reviews</Typography>
      <Typography level="body-sm" textColor="neutral.400">
        Reactions and reviews are live first. Comments and threaded discussion come later after moderation is stronger.
      </Typography>

      {currentUser ? (
        !currentUser.handle ? (
          <Card sx={{ p: 2.25, borderRadius: 20 }}>
            <Typography level="body-sm" textColor="neutral.300">
              Create a public handle in settings before posting reviews.
            </Typography>
          </Card>
        ) : userReview ? (
          <Card sx={{ p: 2.25, borderRadius: 20 }}>
            <Typography level="title-sm">You already reviewed this title.</Typography>
            <Typography level="body-sm" textColor="neutral.400">
              You can edit or delete your review below.
            </Typography>
          </Card>
        ) : (
          <Card sx={{ p: 2.25, borderRadius: 20 }}>
            <Stack spacing={1.25}>
              <Typography level="title-sm">Write a review</Typography>
              <Input
                type="number"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                slotProps={{ input: { min: 1, max: 10 } }}
                placeholder="Rating from 1 to 10"
              />
              <Textarea
                minRows={4}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What worked, what did not, and who this title is for."
              />
              <Checkbox
                label="This review contains spoilers"
                checked={containsSpoilers}
                onChange={(event) => setContainsSpoilers(event.target.checked)}
              />
              <Button
                loading={posting}
                onClick={async () => {
                  setPosting(true);
                  try {
                    await reviewsAPI.createMediaReview(mediaType, mediaId, {
                      title,
                      body,
                      rating: Number(rating),
                      containsSpoilers,
                    });
                    setBody("");
                    setRating("8");
                    setContainsSpoilers(false);
                    await loadReviews();
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to post review.");
                  } finally {
                    setPosting(false);
                  }
                }}
                disabled={body.trim().length < 20}
              >
                Publish review
              </Button>
            </Stack>
          </Card>
        )
      ) : (
        <Card sx={{ p: 2.25, borderRadius: 20 }}>
          <Typography level="body-sm" textColor="neutral.400">
            Sign in to post a review or react to other reviews.
          </Typography>
        </Card>
      )}

      {loading ? (
        <Typography level="body-sm">Loading reviews...</Typography>
      ) : reviews.length ? (
        <Stack spacing={1.5}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUser={currentUser}
              onRefresh={loadReviews}
            />
          ))}
        </Stack>
      ) : (
        <Card sx={{ p: 2.25, borderRadius: 20 }}>
          <Typography level="body-sm" textColor="neutral.400">
            No reviews yet for this title.
          </Typography>
        </Card>
      )}
    </Box>
  );
}

export default ReviewsSection;
