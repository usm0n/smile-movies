"use client";

import {
  Box,
  Card,
  CardContent,
  CardCover,
  Chip,
  Dropdown,
  Input,
  ListDivider,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/joy";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Field from "../ui/Field";
import {
  images,
  movieDetails,
  tvDetails,
  tvEpisodeDetails,
  videos,
} from "../../tmdb-res";
import { useEffect, useMemo, useState } from "react";
import {
  Add,
  Calendar,
  Check,
  IosShare,
  MoreHoriz,
  Notifications,
  NotificationsNone,
  PlayArrow,
  PlaylistAdd,
  Replay,
  Star,
  StarBorder,
} from "../ui/icons";
import {
  formatTimeAgo,
  isLoggedIn,
  minuteToHour,
  ymdToDmy,
} from "../../utilities/defaults";
import BlurImage from "../../utilities/blurImage";
import { toast } from "../ui/toast";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import IMDbRating from "./IMDbRating";
import ParentalGuide from "./ParentalGuide";
import MatchScore from "./MatchScore";
import ImdbRankBadges from "./imdb/ImdbRankBadges";
import { useImdbTitleDetails } from "../../utilities/useImdbTitleDetails";
import { collectionsAPI, Collection } from "../../service/api/smb/collections.api.service";
import RatingDialog from "../library/RatingDialog";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
import EpisodeRecap from "../ai/EpisodeRecap";
import {
  getPlaybackTarget,
  getStartOverTarget,
} from "../../utilities/playbackTarget";
import { pickPreferredLogoPath } from "../../utilities/tmdbImages";

const getPreferredLogoPath = (movieImages: images) =>
  pickPreferredLogoPath(movieImages?.logos);

function Header({
  movieImages,
  movieDetails,
  movieVideos,
  movieId,
  movieType,
}: {
  movieImages: images;
  movieDetails: movieDetails & tvDetails;
  movieId: string | number;
  movieType: "movie" | "tv";
  movieVideos: videos;
}) {
  const {
    addToWatchlist,
    addToWatchlistData,
    deleteRating,
    deleteRatingData,
    myselfData,
    removeFromWatchlist,
    removeFromWatchlistData,
    upsertRating,
    upsertRatingData,
    updateMyself,
  } = useUsers();
  // Shares its request with the IMDb sections further down the page.
  const imdbState = useImdbTitleDetails({ mediaType: movieType, mediaId: movieId });
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 899.95px)").matches,
  );
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsMenuOpen, setCollectionsMenuOpen] = useState(false);
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [newListModalOpen, setNewListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const loadCollections = async () => {
    if (!isLoggedIn) return;
    try {
      const d = await collectionsAPI.getAll();
      setCollections(d.collections);
    } catch { /* silent */ }
  };

  const addToList = async (collectionId: string) => {
    setAddingToList(collectionId);
    try {
      await collectionsAPI.addItem(collectionId, {
        id: String(movieId),
        type: movieType as "movie" | "tv",
        title: movieTitle,
        poster: (movieDetails as any)?.poster_path || "",
      });
    } catch { /* silent */ } finally {
      setAddingToList(null);
      setCollectionsMenuOpen(false);
    }
  };

  const createListAndAdd = () => {
    setNewListName("");
    setNewListModalOpen(true);
    setCollectionsMenuOpen(false);
  };

  const confirmCreateListAndAdd = async () => {
    if (!newListName.trim()) return;
    setAddingToList("new");
    setNewListModalOpen(false);
    try {
      const created = await collectionsAPI.create(newListName.trim());
      await collectionsAPI.addItem(created.collection.id, {
        id: String(movieId),
        type: movieType as "movie" | "tv",
        title: movieTitle,
        poster: (movieDetails as any)?.poster_path || "",
      });
      setCollections((prev) => [...prev, created.collection]);
    } catch { /* silent */ } finally {
      setAddingToList(null);
    }
  };
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [activeEpisodeDetails, setActiveEpisodeDetails] =
    useState<tvEpisodeDetails | null>(null);
  const navigate = useNavigate();

  const trailerKey = movieVideos?.results?.find(
    (video) =>
      video?.type === "Trailer" &&
      video?.site === "YouTube" &&
      video?.official === true,
  )?.key;
  /**
   * A phone hero is roughly 9:19 while the trailer is 16:9, so covering it
   * would crop away three quarters of the frame. Phones get the backdrop
   * still, which crops gracefully — and skip an autoplaying video on data.
   */
  const isTrailerAvailable = Boolean(trailerKey) && !isCompactViewport;
  const movieLogo = getPreferredLogoPath(movieImages);
  const movieTitle = movieDetails?.title || movieDetails?.name || "";

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [movieId]);

  // Matches the theme's `md` breakpoint, where the hero becomes a wide stage.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 899.95px)");
    const onChange = (event: MediaQueryListEvent) =>
      setIsCompactViewport(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
    (item) => item.id == movieId && item.type === movieType,
  );
  const recentItem = (myselfData?.data as unknown as User)?.recentlyWatched?.find(
    (item) => item.id == movieId && item.type === movieType,
  );
  const hasStartedWatching = Number(recentItem?.currentTime || 0) > 0;
  useEffect(() => {
    let cancelled = false;

    if (
      movieType !== "tv" ||
      !hasStartedWatching ||
      !recentItem?.currentSeason ||
      !recentItem?.currentEpisode
    ) {
      setActiveEpisodeDetails(null);
      return;
    }

    void tmdb
      .tvEpisodeDetails(
        String(movieId),
        Number(recentItem.currentSeason),
        Number(recentItem.currentEpisode),
      )
      .then((response) => {
        if (cancelled || !response || "response" in response) return;
        setActiveEpisodeDetails(response as tvEpisodeDetails);
      })
      .catch(() => {
        if (cancelled) return;
        setActiveEpisodeDetails(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    hasStartedWatching,
    movieId,
    movieType,
    recentItem?.currentEpisode,
    recentItem?.currentSeason,
  ]);
  const ratingItem = (myselfData?.data as unknown as User)?.ratings?.find(
    (item) => item.id == movieId && item.type === movieType,
  );
  const [availabilityState, setAvailabilityState] = useState({
    isLoading: true,
    available: null as boolean | null,
  });
  const progressPercent =
    recentItem?.duration && recentItem?.currentTime
      ? Math.min(
        100,
        Math.max(
          0,
          Math.round((recentItem.currentTime / recentItem.duration) * 100),
        ),
      )
      : 0;
  const playbackTarget = useMemo(
    () =>
      getPlaybackTarget({
        mediaType: movieType,
        mediaId: movieId,
        recentItem,
      }),
    [movieId, movieType, recentItem],
  );
  const startOverEpisodeTarget = useMemo(
    () =>
      getStartOverTarget({
        mediaType: movieType,
        mediaId: movieId,
        recentItem,
        mode: "episode",
      }),
    [movieId, movieType, recentItem],
  );
  const startOverSeriesTarget = useMemo(
    () =>
      getStartOverTarget({
        mediaType: movieType,
        mediaId: movieId,
        recentItem,
        mode: "series",
      }),
    [movieId, movieType, recentItem],
  );
  const activeEpisodeTitle =
    movieType === "tv" && hasStartedWatching
      ? activeEpisodeDetails?.name?.trim() ||
      (recentItem?.currentSeason && recentItem?.currentEpisode
        ? `Episode ${recentItem.currentEpisode}`
        : "")
      : "";
  /**
   * Always the title's own synopsis. It used to swap to the synopsis of the
   * episode you were part-way through, which reads as a spoiler on the page
   * whose job is to describe the show — the episode is named on the resume
   * line under the play button instead.
   */
  const overview = movieDetails?.overview?.trim() || "";
  const isOverviewLong = overview.length > 240;
  const backdropPath =
    (movieType === "tv" && hasStartedWatching
      ? activeEpisodeDetails?.still_path
      : null) ||
    movieDetails?.backdrop_path ||
    movieDetails?.poster_path;
  const isReleaseBlocked =
    new Date(movieDetails?.release_date || movieDetails?.first_air_date || "")
      .getTime() > Date.now();
  const playLabel =
    movieType === "movie"
      ? recentItem
        ? Number(recentItem.currentTime || 0) > 0
          ? "Continue Watching"
          : "Watch Again"
        : "Watch Now"
      : recentItem
        ? Number(recentItem.currentTime || 0) > 0
          ? `Continue S${recentItem.currentSeason}:E${recentItem.currentEpisode}`
          : recentItem.nextSeason && recentItem.nextEpisode
            ? `Continue S${recentItem.nextSeason}:E${recentItem.nextEpisode}`
            : "Watch Again"
        : "Play Now";
  /**
   * Only for titles you have not started — once you have, the progress bar and
   * its resume line under the play button say all of this more directly.
   */
  const progressNote =
    hasStartedWatching
      ? ""
      : recentItem?.nextSeason && recentItem?.nextEpisode
        ? `Next up • S${recentItem.nextSeason}:E${recentItem.nextEpisode}${recentItem.lastWatchedAt ? ` • ${formatTimeAgo(recentItem.lastWatchedAt)}` : ""}`
        : recentItem?.lastWatchedAt
          ? `Last watched ${formatTimeAgo(recentItem.lastWatchedAt)}`
          : watchlistItem?.addedAt
            ? `Saved for later • Added ${formatTimeAgo(watchlistItem.addedAt)}`
            : "";

  useEffect(() => {
    let cancelled = false;

    setAvailabilityState({
      isLoading: true,
      available: null,
    });

    void providersAPI
      .getVixsrcAvailability(
        movieType,
        String(movieId),
        movieType === "tv" ? playbackTarget.season : undefined,
        movieType === "tv" ? playbackTarget.episode : undefined,
      )
      .then((response) => {
        if (cancelled) return;
        setAvailabilityState({
          isLoading: false,
          available: Boolean(response.data?.available),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setAvailabilityState({
          isLoading: false,
          available: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, movieType, playbackTarget.episode, playbackTarget.season]);

  const playButtonNote = isReleaseBlocked
    ? movieDetails?.status || ""
    : availabilityState.isLoading && availabilityState.available === null
      ? "Checking video availability..."
      : "";

  const isFollowing = Boolean(
    (myselfData?.data as unknown as User)?.notificationInterests?.followedShows?.includes(
      String(movieId),
    ),
  );

  const toggleFollow = () => {
    const interests = (myselfData?.data as unknown as User)?.notificationInterests;
    const followed = interests?.followedShows || [];
    updateMyself({
      notificationInterests: {
        ...interests,
        followedShows: isFollowing
          ? followed.filter((id: string) => id !== String(movieId))
          : [...followed, String(movieId)],
      },
    } as any);
  };

  /** Age certificate as the rating boards state it — "TV-MA", "15", "R". */
  const certificate = imdbState.details?.certificate?.rating || "";

  /**
   * Everything the old "Your library" card said, on the one line that sits
   * under the progress bar: which episode you are on, and how much of it is
   * left. `duration` and `currentTime` are both stored in whole minutes.
   */
  const minutesLeft =
    recentItem?.duration && recentItem?.currentTime
      ? Math.max(0, Math.round(recentItem.duration - recentItem.currentTime))
      : 0;
  const resumeLine = [
    movieType === "tv" && recentItem?.currentSeason && recentItem?.currentEpisode
      ? `S${recentItem.currentSeason}:E${recentItem.currentEpisode}`
      : "",
    activeEpisodeTitle,
    minutesLeft ? `${minuteToHour(minutesLeft)} left` : `${progressPercent}% watched`,
  ]
    .filter(Boolean)
    .join(" · ");

  // TMDB types this as a string, but the API sends the whole episode object.
  const nextEpisode = (
    movieDetails as unknown as {
      next_episode_to_air?: {
        air_date?: string;
        season_number?: number;
        episode_number?: number;
      } | null;
    }
  )?.next_episode_to_air;
  const nextEpisodeLine =
    movieType === "tv" && nextEpisode?.air_date
      ? `${
        nextEpisode.season_number && nextEpisode.episode_number
          ? `S${nextEpisode.season_number}:E${nextEpisode.episode_number}`
          : "Next episode"
      } airs ${ymdToDmy(nextEpisode.air_date)}`
      : "";

  const shareTitle = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movieTitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      // Dismissing the share sheet lands here too — nothing worth reporting.
    }
  };

  const metadataItems = [
    // Three is enough to place a title; the full list is in About below.
    movieDetails?.genres?.length
      ? movieDetails.genres
        .slice(0, 3)
        .map((genre) => genre.name)
        .join(" · ")
      : null,
    movieDetails?.release_date || movieDetails?.first_air_date
      ? ymdToDmy(movieDetails?.release_date || movieDetails?.first_air_date)
      : null,
    movieDetails?.runtime || movieDetails?.episode_run_time?.length
      ? minuteToHour(
        movieDetails?.runtime || movieDetails?.episode_run_time?.[0],
      )
      : null,
  ].filter(Boolean);

  const desktopMediaStage = {
    position: "absolute",
    top: 0,
    right: 0,
    width: "min(76vw, 1200px)",
    height: "88%",
    overflow: "hidden",
    borderBottomLeftRadius: "40px",
  } as const;

  return (
    <>
      <Card
        sx={{
          width: "100%",
          minHeight: { xs: "100svh", md: "100vh" },
          height: "auto",
          border: "none",
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <CardCover>
          {backdropPath ? (
            <Box
              sx={{
                position: "absolute",
                inset: { xs: 0, md: "0 0 auto auto" },
                width: { xs: "100%", md: desktopMediaStage.width },
                height: { xs: "100%", md: desktopMediaStage.height },
                overflow: "hidden",
                borderBottomLeftRadius: { xs: 0, md: desktopMediaStage.borderBottomLeftRadius },
              }}
            >
              {BlurImage({
                highQualitySrc: `https://image.tmdb.org/t/p/w1280${backdropPath}`,
                lowQualitySrc: `https://image.tmdb.org/t/p/w780${backdropPath}`,
                style: {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  transform: "scale(1.02)",
                  opacity: isVideoLoaded ? 0 : 1,
                  transition: "opacity 0.45s ease",
                },
                eager: true,
              })}
              {isTrailerAvailable ? (
                <iframe
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                  onLoad={() => {
                    setTimeout(() => {
                      setIsVideoLoaded(true);
                    }, 4000);
                  }}
                  /**
                   * A YouTube embed cannot `object-fit: cover`, so it is sized
                   * to the larger of the two dimensions that cover this stage
                   * (76vw wide, 88vh tall) and centred — the overflow is
                   * cropped, the way the backdrop image behind it crops. Left
                   * at 100%/100% the 16:9 video letterboxed into a band of
                   * picture between two thick black bars.
                   */
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    border: "none",
                    width: "max(100%, calc(88vh * 16 / 9))",
                    height: "max(100%, calc(76vw * 9 / 16))",
                    opacity: isVideoLoaded ? 1 : 0,
                    transition: "opacity 0.45s ease",
                    pointerEvents: "none",
                  }}
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${trailerKey}&cc_load_policy=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1`}
                />
              ) : null}
            </Box>
          ) : (
            <Box sx={{ width: "100%", height: "100%", backgroundColor: "#000" }} />
          )}
        </CardCover>
        <CardCover
          sx={{
            background: {
              xs: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.88) 56%, rgba(0,0,0,0.98) 100%)",
              md: "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 24%, rgba(0,0,0,0.92) 36%, rgba(0,0,0,0.58) 52%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0.72) 100%), linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.24) 46%, rgba(0,0,0,0.88) 100%)",
            },
          }}
        />
        <CardContent
          sx={{
            // Anchored to the bottom at every size. Centred, the block floated
            // in the middle of a phone screen with the artwork cropped behind
            // it and a third of the hero left empty underneath.
            justifyContent: "flex-end",
            alignItems: { xs: "center", md: "flex-start" },
            pt: { xs: "88px", md: "102px" },
            pb: { xs: "40px", md: "48px" },
            px: { xs: 2, sm: 3, md: 5, lg: 6 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "min(42vw, 520px)" },
                maxWidth: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.75, md: 2.25 },
                p: 0,
                borderRadius: 0,
                background: "transparent",
                border: "none",
                boxShadow: "none",
                backdropFilter: "none",
                alignItems: { xs: "center", md: "flex-start" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {movieLogo ? (
                <Box
                  component="img"
                  src={`https://image.tmdb.org/t/p/original${movieLogo}`}
                  alt={movieTitle}
                  sx={{
                    width: "auto",
                    maxWidth: { xs: "100%", md: "90%" },
                    maxHeight: { xs: "72px", md: "96px" },
                    objectFit: "contain",
                    objectPosition: { xs: "center center", md: "left center" },
                    filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9))",
                  }}
                />
              ) : (
                <Typography
                  level="h1"
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.05,
                  }}
                >
                  {movieTitle}
                </Typography>
              )}

              {movieDetails?.tagline ? (
                <Typography
                  level="title-md"
                  sx={{ color: "#a1a1a1", maxWidth: "40ch" }}
                >
                  {movieDetails.tagline}
                </Typography>
              ) : null}

              {metadataItems.length ? (
                <Typography
                  level="body-sm"
                  sx={{ color: "#a1a1a1" }}
                >
                  {metadataItems.join(" • ")}
                </Typography>
              ) : null}

              {/* One factual row. Everything here is a number or a label a
                  viewer can act on — the IMDb popularity meter and the AI's
                  age-warning sentence used to sit here and ran off the edge of
                  a phone screen; the warning now lives in the match tooltip. */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                  minWidth: 0,
                  maxWidth: "100%",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <IMDbRating mediaId={movieId} mediaType={movieType} />
                <ImdbRankBadges ranking={imdbState.details?.ranking ?? {}} />
                {certificate ? (
                  <Tooltip title="Age rating" variant="soft" size="sm">
                    <Chip
                      size="sm"
                      variant="outlined"
                      color="neutral"
                      sx={{ fontWeight: 600, maxWidth: "100%" }}
                    >
                      {certificate}
                    </Chip>
                  </Tooltip>
                ) : null}
                <MatchScore
                  movieTitle={movieTitle}
                  movieYear={(
                    movieDetails?.release_date ||
                    movieDetails?.first_air_date ||
                    ""
                  ).slice(0, 4)}
                  overview={movieDetails?.overview}
                  genres={movieDetails?.genres?.map((genre) => genre.name)}
                  certification={certificate || undefined}
                />
                {ratingItem ? (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    startDecorator={<Star sx={{ fontSize: 13, fill: "currentColor" }} />}
                    sx={{ fontWeight: 600 }}
                  >
                    You rated {ratingItem.rating}/10
                  </Chip>
                ) : null}
              </Box>

              {/* One primary action, two one-tap toggles, and a menu for the
                  rest. Six stacked buttons is what made this page feel like a
                  settings screen rather than a place to press play. */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                  width: "100%",
                  maxWidth: { xs: 420, md: 400 },
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0.75,
                    minWidth: 0,
                  }}
                >
                  <Button
                    onClick={() => {
                      navigate(playbackTarget.route);
                    }}
                    disabled={isReleaseBlocked || myselfData?.isLoading}
                    startDecorator={<PlayArrow sx={{ fontSize: 18 }} />}
                    size="lg"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      // Three fixed-width icon buttons share this row, so the
                      // label has to give way rather than widen the page.
                      fontSize: { xs: "0.9375rem", md: "1rem" },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {playLabel}
                  </Button>
                  <Tooltip
                    title={watchlistItem ? "In your watchlist" : "Add to watchlist"}
                    variant="soft"
                    size="sm"
                  >
                    <Button
                      variant="outlined"
                      color="neutral"
                      size="lg"
                      disabled={
                        myselfData?.isLoading ||
                        addToWatchlistData?.isLoading ||
                        removeFromWatchlistData?.isLoading
                      }
                      onClick={() => {
                        if (!isLoggedIn) {
                          navigate("/auth/login");
                          return;
                        }

                        if (watchlistItem) {
                          void removeFromWatchlist(movieType, movieId.toString());
                          return;
                        }

                        void addToWatchlist(
                          movieType,
                          movieId.toString(),
                          movieDetails.poster_path,
                          movieTitle,
                        );
                      }}
                      aria-label={
                        watchlistItem ? "Remove from watchlist" : "Add to watchlist"
                      }
                      sx={{ width: { xs: 44, md: 48 }, flexShrink: 0, px: 0 }}
                    >
                      {watchlistItem ? (
                        <Check sx={{ fontSize: 18 }} />
                      ) : (
                        <Add sx={{ fontSize: 18 }} />
                      )}
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      ratingItem
                        ? `Your rating: ${ratingItem.rating}/10`
                        : "Rate this title"
                    }
                    variant="soft"
                    size="sm"
                  >
                    <Button
                      variant="outlined"
                      color="neutral"
                      size="lg"
                      disabled={
                        myselfData?.isLoading ||
                        upsertRatingData?.isLoading ||
                        deleteRatingData?.isLoading
                      }
                      onClick={() => {
                        if (!isLoggedIn) {
                          navigate("/auth/login");
                          return;
                        }
                        setIsRatingOpen(true);
                      }}
                      aria-label="Rate this title"
                      sx={{ width: { xs: 44, md: 48 }, flexShrink: 0, px: 0 }}
                    >
                      {ratingItem ? (
                        <Star sx={{ fontSize: 18, fill: "currentColor" }} />
                      ) : (
                        <StarBorder sx={{ fontSize: 18 }} />
                      )}
                    </Button>
                  </Tooltip>
                  <Dropdown
                    open={collectionsMenuOpen}
                    onOpenChange={(_, o) => {
                      if (o) {
                        setCollectionsMenuOpen(true);
                        loadCollections();
                      } else setCollectionsMenuOpen(false);
                    }}
                  >
                    <MenuButton
                      slots={{ root: Button }}
                      slotProps={{
                        root: {
                          "aria-label": "More actions",
                          variant: "outlined",
                          color: "neutral",
                          size: "lg",
                          sx: { width: { xs: 44, md: 48 }, flexShrink: 0, px: 0 },
                        },
                      }}
                    >
                      <MoreHoriz sx={{ fontSize: 18 }} />
                    </MenuButton>
                    <Menu placement="bottom-end" sx={{ minWidth: 240, zIndex: 1300 }}>
                      {hasStartedWatching && (
                        <MenuItem
                          disabled={isReleaseBlocked || myselfData?.isLoading}
                          onClick={() => {
                            navigate(startOverEpisodeTarget.route);
                            setCollectionsMenuOpen(false);
                          }}
                        >
                          <Replay sx={{ fontSize: 18 }} />
                          {movieType === "tv"
                            ? "Start over this episode"
                            : "Play from beginning"}
                        </MenuItem>
                      )}
                      {hasStartedWatching && movieType === "tv" && (
                        <MenuItem
                          disabled={isReleaseBlocked || myselfData?.isLoading}
                          onClick={() => {
                            navigate(startOverSeriesTarget.route);
                            setCollectionsMenuOpen(false);
                          }}
                        >
                          <Replay sx={{ fontSize: 18 }} />
                          Start over the series
                        </MenuItem>
                      )}
                      {hasStartedWatching && <ListDivider />}
                      <MenuItem
                        disabled={
                          addToWatchlistData?.isLoading ||
                          removeFromWatchlistData?.isLoading
                        }
                        onClick={() => {
                          if (!isLoggedIn) {
                            navigate("/auth/login");
                            return;
                          }
                          if (watchlistItem)
                            void removeFromWatchlist(movieType, movieId.toString());
                          else
                            void addToWatchlist(
                              movieType,
                              movieId.toString(),
                              (movieDetails as any)?.poster_path,
                              movieTitle,
                            );
                          setCollectionsMenuOpen(false);
                        }}
                      >
                        {watchlistItem ? (
                          <Check sx={{ fontSize: 18 }} />
                        ) : (
                          <Add sx={{ fontSize: 18 }} />
                        )}
                        {watchlistItem ? "Remove from Watchlist" : "Add to Watchlist"}
                      </MenuItem>
                      {movieType === "tv" && isLoggedIn && (
                        <MenuItem
                          onClick={() => {
                            toggleFollow();
                            setCollectionsMenuOpen(false);
                          }}
                        >
                          {isFollowing ? (
                            <Notifications sx={{ fontSize: 18 }} />
                          ) : (
                            <NotificationsNone sx={{ fontSize: 18 }} />
                          )}
                          {isFollowing
                            ? "Stop following"
                            : "Follow for new episodes"}
                        </MenuItem>
                      )}
                      {collections.length > 0 && (
                        <>
                          <MenuItem
                            disabled
                            sx={{ fontSize: "0.72rem", opacity: 0.5, py: 0.5 }}
                          >
                            MY LISTS
                          </MenuItem>
                          {collections.map((col) => (
                            <MenuItem
                              key={col.id}
                              onClick={() => addToList(col.id)}
                              disabled={addingToList === col.id}
                            >
                              <PlaylistAdd sx={{ fontSize: 18 }} />
                              Add to "{col.name}"
                            </MenuItem>
                          ))}
                        </>
                      )}
                      <MenuItem
                        onClick={createListAndAdd}
                        disabled={addingToList === "new"}
                      >
                        <PlaylistAdd sx={{ fontSize: 18 }} />
                        Create new list &amp; add
                      </MenuItem>
                      <ListDivider />
                      <MenuItem
                        onClick={() => {
                          void shareTitle();
                          setCollectionsMenuOpen(false);
                        }}
                      >
                        <IosShare sx={{ fontSize: 18 }} />
                        Share
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </Box>

                {/* The whole of the old "Your library" card, as the one line
                    people actually read off it: where you are, what is left. */}
                {hasStartedWatching ? (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 3,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.18)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          borderRadius: 3,
                          backgroundColor: "#ededed",
                        }}
                      />
                    </Box>
                    <Typography
                      level="body-xs"
                      sx={{
                        color: "#a1a1a1",
                        textAlign: { xs: "center", md: "left" },
                      }}
                    >
                      {resumeLine}
                    </Typography>
                  </Box>
                ) : progressNote ? (
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "#707070",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    {progressNote}
                  </Typography>
                ) : null}

                {/* Placed with the resume line: this is the moment someone is
                    deciding whether they remember where they left off. */}
                {movieType === "tv" &&
                hasStartedWatching &&
                recentItem?.currentSeason &&
                recentItem?.currentEpisode ? (
                  <EpisodeRecap
                    variant="hero"
                    tmdbId={String(movieId)}
                    title={movieTitle}
                    seasonNumber={Number(recentItem.currentSeason)}
                    episodeNumber={Number(recentItem.currentEpisode)}
                  />
                ) : null}

                {nextEpisodeLine ? (
                  <Typography
                    level="body-xs"
                    startDecorator={<Calendar sx={{ fontSize: 13 }} />}
                    sx={{ color: "#a1a1a1" }}
                  >
                    {nextEpisodeLine}
                  </Typography>
                ) : null}

                {playButtonNote ? (
                  <Typography level="body-sm" sx={{ color: "#a1a1a1" }}>
                    {playButtonNote}
                  </Typography>
                ) : null}
              </Box>

              {overview ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    width: "100%",
                    // The synopsis is the one block of prose here: it reads as
                    // prose, so it is left-aligned even where the rest centres.
                    textAlign: "left",
                  }}
                >
                  <Typography
                    level="body-md"
                    sx={{
                      color: "#a1a1a1",
                      display:
                        isOverviewLong && !isOverviewExpanded
                          ? "-webkit-box"
                          : "block",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp:
                        isOverviewLong && !isOverviewExpanded ? 3 : "unset",
                      overflow: "hidden",
                    }}
                  >
                    {overview}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {isOverviewLong ? (
                      <Button
                        variant="plain"
                        size="sm"
                        onClick={() => setIsOverviewExpanded((current) => !current)}
                        sx={{
                          px: 0,
                          minHeight: 0,
                          color: "text.tertiary",
                          "&:hover": {
                            backgroundColor: "transparent",
                            color: "text.primary",
                          },
                        }}
                      >
                        {isOverviewExpanded ? "Show less" : "Read more"}
                      </Button>
                    ) : null}
                    <ParentalGuide
                      variant="inline"
                      mediaId={movieId}
                      mediaType={movieType}
                      title={movieTitle}
                      year={(
                        movieDetails?.release_date ||
                        movieDetails?.first_air_date ||
                        ""
                      ).slice(0, 4)}
                    />
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <RatingDialog
        open={isRatingOpen}
        title={movieTitle}
        titleLogoSrc={
          movieLogo ? `https://image.tmdb.org/t/p/original${movieLogo}` : undefined
        }
        initialRating={ratingItem?.rating || 0}
        onClose={() => setIsRatingOpen(false)}
        onSave={async (rating) => {
          await upsertRating(
            movieType,
            String(movieId),
            movieDetails?.poster_path || "",
            movieTitle,
            rating,
          );
        }}
        onDelete={
          ratingItem
            ? async () => {
              await deleteRating(movieType, String(movieId));
            }
            : undefined
        }
      />

      {/* Create new list modal */}
      <Dialog
        open={newListModalOpen}
        onClose={() => setNewListModalOpen(false)}
        title="Create a new list"
        description={`"${movieTitle}" will be added to it.`}
        width={400}
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setNewListModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreateListAndAdd}
              disabled={!newListName.trim()}
              loading={addingToList === "new"}
            >
              Create and add
            </Button>
          </>
        }
      >
        <Field label="List name">
          <Input
            autoFocus
            placeholder="e.g. Weekend picks"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmCreateListAndAdd()}
          />
        </Field>
      </Dialog>
    </>
  );
}

export default Header;
