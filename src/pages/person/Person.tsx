import { AspectRatio, Box, Typography } from "@mui/joy";
import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { ageCount, ymdToDmy } from "../../utilities/defaults";
import { DetailSkeleton, RowSkeleton } from "../../components/ui/Skeleton";
import NotFound from "../../components/utils/NotFound";
import LoadFailed from "../../components/utils/LoadFailed";
import {
  peopleCombinedCredits,
  peopleDetails,
  peopleImages,
} from "../../tmdb-res";
import {
  Notifications,
  NotificationsNone,
  Person as PersonIcon,
} from "../../components/ui/icons";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { toast } from "../../components/ui/toast";
import { useState } from "react";
import { Button } from "@mui/joy";
import EventMC from "../../components/cards/EventMC";

function Person() {
  const { personId } = useParams();
  const {
    peopleDetails,
    peopleDetailsData,
    peopleCombinedCredits,
    peopleCombinedCreditsData,
    peopleImages,
    peopleImagesData,
  } = useTMDB();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, myselfData, updateMyself } = useUsers();

  /**
   * Following a person is what drives the credits-based release sync on the
   * API: it stores the TMDB person id, and the notification job then looks up
   * that person's upcoming titles directly. Typing a name into Settings only
   * matches people already listed on a release we happened to ingest, so this
   * button is the one that actually surfaces new work.
   */
  const followedPeople =
    (myselfData?.data as unknown as User)?.notificationInterests?.followedPeople || [];
  const isFollowingPerson = Boolean(personId && followedPeople.includes(String(personId)));
  const [followBusy, setFollowBusy] = useState(false);

  const toggleFollowPerson = async () => {
    if (!personId || followBusy) return;
    setFollowBusy(true);

    const interests = (myselfData?.data as unknown as User)?.notificationInterests;
    try {
      await updateMyself({
        notificationInterests: {
          ...interests,
          followedPeople: isFollowingPerson
            ? followedPeople.filter((id: string) => id !== String(personId))
            : [...followedPeople, String(personId)],
        },
      } as never);
      toast.success(
        isFollowingPerson
          ? `Stopped following ${peopleDetailsDataArr?.name || "this person"}.`
          : `Following ${peopleDetailsDataArr?.name || "this person"} — we'll tell you about new releases.`,
      );
    } catch {
      toast.error("Could not update who you follow. Please try again.");
    } finally {
      setFollowBusy(false);
    }
  };

  const peopleDetailsDataArr = peopleDetailsData?.data as peopleDetails;
  const peopleImagesDataArr = peopleImagesData?.data as peopleImages;
  const peopleCombinedCreditsDataArr =
    peopleCombinedCreditsData?.data as peopleCombinedCredits;
  // The TMDB context keeps one response per endpoint for the whole app, so on
  // the render where `personId` changes the slots below still hold the previous
  // person. `!peopleDetailsData` covers the same gap on a fresh mount, before
  // the effect has flipped the slot to loading.
  const requestedId = useRef<string | undefined>(undefined);
  const isLoading =
    requestedId.current !== personId ||
    !peopleDetailsData ||
    peopleDetailsData?.isLoading ||
    peopleCombinedCreditsData?.isLoading ||
    peopleImagesData?.isLoading;
  // Only the person's own record decides not-found; a failed credits or images
  // request is a missing section, not a missing person.
  const isIncorrect = peopleDetailsData?.isIncorrect;

  // Keyed on personId: this route reuses one component instance, so clicking
  // through to another person from the credits list has to refetch here or the
  // page keeps showing whoever you were looking at until a reload.
  const loadPerson = useCallback(() => {
    if (!personId) return;
    requestedId.current = personId;
    peopleDetails(personId);
    peopleCombinedCredits(personId);
    peopleImages(personId);
  }, [personId]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);
  return isIncorrect ? (
    <NotFound />
  ) : isLoading ? (
    <Box
      sx={{
        maxWidth: "var(--sm-page-max)",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        pt: "calc(var(--sm-nav-height) + 48px)",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <DetailSkeleton />
      <RowSkeleton count={6} />
    </Box>
  ) : peopleDetailsData?.isError ? (
    <LoadFailed onRetry={loadPerson} />
  ) : (
    <Box
      sx={{
        width: "100%",
        maxWidth: "var(--sm-page-max)",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        pt: "calc(var(--sm-nav-height) + 48px)",
        pb: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
          "@media (max-width: 768px)": {
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        {peopleDetailsDataArr?.profile_path ? (
          <Box
            component="img"
            sx={{
              borderRadius: "8px",
              maxWidth: "300px",
              "@media (max-width: 768px)": { maxWidth: "150px" },
            }}
            src={`https://image.tmdb.org/t/p/original${peopleDetailsDataArr?.profile_path}`}
            alt="Profile"
          />
        ) : (
          <AspectRatio
            ratio="2/3"
            sx={{
              width: "300px",
              borderRadius: "8px",
              "@media (max-width: 768px)": { width: "150px" },
            }}
          >
            <PersonIcon sx={{ width: "100%", height: "100%" }} />
          </AspectRatio>
        )}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <Typography level="h2" sx={{ fontSize: "2rem", fontWeight: "bold" }}>
              {peopleDetailsDataArr?.name}
            </Typography>
            {isAuthenticated && (
              <Button
                size="sm"
                loading={followBusy}
                variant={isFollowingPerson ? "solid" : "outlined"}
                color={isFollowingPerson ? "primary" : "neutral"}
                startDecorator={
                  isFollowingPerson ? (
                    <Notifications sx={{ fontSize: 16 }} />
                  ) : (
                    <NotificationsNone sx={{ fontSize: 16 }} />
                  )
                }
                onClick={() => void toggleFollowPerson()}
              >
                {isFollowingPerson ? "Following" : "Follow"}
              </Button>
            )}
          </Box>
          <Typography
            level="body-md"
            sx={{
              maxWidth: "650px",
              marginTop: "10px",
              display: isExpanded ? "block" : "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 3,
              WebkitBoxOrient: "vertical",
              overflow: isExpanded ? "visible" : "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {peopleDetailsDataArr?.biography ||
              "Biography not available for this person."}
          </Typography>
          {peopleDetailsDataArr?.biography && (
            <Button
              variant="plain"
              size="sm"
              sx={{ marginTop: "10px" }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Show more"}
            </Button>
          )}
          {peopleDetailsDataArr?.birthday && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Birthday:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "20px", color: "text.secondary" }}
            >
              {ymdToDmy(peopleDetailsDataArr?.birthday || "N/A")}
              {ageCount(
                peopleDetailsDataArr?.birthday,
                peopleDetailsDataArr?.deathday,
              ) &&
                ` (${ageCount(
                  peopleDetailsDataArr?.birthday,
                  peopleDetailsDataArr?.deathday,
                )} years old)`}
            </Typography>
          )}
          {peopleDetailsDataArr?.deathday && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Deathday:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {ymdToDmy(peopleDetailsDataArr?.deathday || "N/A")}
            </Typography>
          )}
          {peopleDetailsDataArr?.place_of_birth && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Place of Birth:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.place_of_birth}
            </Typography>
          )}
          {peopleDetailsDataArr?.gender && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Gender:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.gender === 1 ? "Female" : "Male"}
            </Typography>
          )}
          {peopleDetailsDataArr?.known_for_department && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Known For:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.known_for_department}
            </Typography>
          )}
          {peopleDetailsDataArr?.also_known_as.length && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Also Known As:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.also_known_as?.join(", ")}
            </Typography>
          )}
          {peopleDetailsDataArr?.homepage && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Homepage:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.homepage}
            </Typography>
          )}
        </Box>
      </Box>
      {peopleCombinedCreditsDataArr?.cast?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Typography level="h2">Cast</Typography>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              overflow: "scroll",
              gap: 2,
            }}
          >
            {peopleCombinedCreditsDataArr?.cast
              ?.sort((itemA, itemB) => {
                const aPopularity = itemA.popularity || 0;
                const bPopularity = itemB.popularity || 0;
                return bPopularity - aPopularity;
              })
              .map((credit) => (
                <EventMC
                  eventId={credit.id}
                  key={credit.id}
                  eventPoster={credit.poster_path}
                  eventTitle={credit.name || credit.title}
                  eventType={credit.media_type}
                />
              ))}
          </Box>
        </Box>
      )}
      {peopleImagesDataArr?.profiles?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Typography level="h2">Images</Typography>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              overflow: "scroll",
              gap: 2,
            }}
          >
            {peopleImagesDataArr?.profiles?.map((image, index) => (
              <Box
                component="img"
                key={index}
                sx={{
                  height: "200px",
                  borderRadius: "8px",
                }}
                src={`https://image.tmdb.org/t/p/original${image.file_path}`}
                alt={`Image ${index + 1}`}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Person;
