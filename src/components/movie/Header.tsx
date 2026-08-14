"use client";

import {
  Box,
  Card,
  CardContent,
  CardCover,
  Dropdown,
  Input,
  Menu,
  MenuButton,
  MenuItem,
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
import { Add, ArrowDropDown, Check, PlayArrow, Star, StarBorder, Replay, Notifications, NotificationsNone, PlaylistAdd } from "../ui/icons";
import {
  formatTimeAgo,
  isLoggedIn,
  minuteToHour,
  ymdToDmy,
} from "../../utilities/defaults";
import BlurImage from "../../utilities/blurImage";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import IMDbRating from "./IMDbRating";
import ParentalGuide from "./ParentalGuide";
import MatchScore from "./MatchScore";
import { collectionsAPI, Collection } from "../../service/api/smb/collections.api.service";
import RatingDialog from "../library/RatingDialog";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
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
  const isTrailerAvailable = Boolean(trailerKey);
  const movieLogo = getPreferredLogoPath(movieImages);
  const movieTitle = movieDetails?.title || movieDetails?.name || "";

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [movieId]);

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
  const overview = (
    movieType === "tv" && hasStartedWatching
      ? activeEpisodeDetails?.overview
      : movieDetails?.overview
  )?.trim() || "";
  const isOverviewLong = overview.length > 220;
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
  const progressNote =
    hasStartedWatching
      ? movieType === "movie"
        ? `${progressPercent}% done${recentItem?.currentTime ? ` • Resume at ${minuteToHour(recentItem.currentTime)}` : ""}`
        : `${progressPercent}% done${recentItem?.currentSeason && recentItem?.currentEpisode ? ` • Resume S${recentItem.currentSeason}:E${recentItem.currentEpisode}` : ""}`
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

  const metadataItems = [
    movieDetails?.genres?.length
      ? movieDetails.genres.map((genre) => genre.name).join(", ")
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
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "none",
                    width: "100%",
                    height: "100%",
                    opacity: isVideoLoaded ? 1 : 0,
                    transition: "opacity 0.45s ease",
                  }}
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${trailerKey}`}
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
            justifyContent: { xs: "center", md: "flex-end" },
            alignItems: { xs: "center", md: "flex-start" },
            pt: { xs: "88px", md: "102px" },
            pb: { xs: "24px", md: "48px" },
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
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.6, md: 2.2 },
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

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <IMDbRating mediaId={movieId} mediaType={movieType} />
                <MatchScore
                  movieTitle={movieTitle}
                  movieYear={(
                    movieDetails?.release_date ||
                    movieDetails?.first_air_date ||
                    ""
                  ).slice(0, 4)}
                  overview={movieDetails?.overview}
                  genres={movieDetails?.genres?.map((genre) => genre.name)}
                />
                <ParentalGuide
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

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  width: "100%",
                  maxWidth: { md: 360 },
                  alignItems: { xs: "center", md: "stretch" },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0.5,
                  }}
                >
                  <Button
                    onClick={() => {
                      navigate(playbackTarget.route);
                    }}
                    disabled={
                      isReleaseBlocked ||
                      myselfData?.isLoading
                    }
                    startDecorator={<PlayArrow sx={{ fontSize: 18 }} />}
                    size="lg"
                    sx={{ flex: 1 }}
                  >
                    {playLabel}
                  </Button>
                  <Button
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
                    size="lg"
                    aria-label={watchlistItem ? "Remove from watchlist" : "Add to watchlist"}
                    sx={{ minWidth: { xs: 48, md: 56 } }}
                  >
                    {watchlistItem ? (
                      <Check sx={{ fontSize: 18 }} />
                    ) : (
                      <Add sx={{ fontSize: 18 }} />
                    )}
                  </Button>
                  <Dropdown open={collectionsMenuOpen} onOpenChange={(_, o) => { if (o) { setCollectionsMenuOpen(true); loadCollections(); } else setCollectionsMenuOpen(false); }}>
                    <MenuButton
                      slots={{ root: Button }}
                      slotProps={{
                        root: {
                          "aria-label": "More list actions",
                          sx: {
                            minWidth: { xs: 40, md: 44 },
                            borderLeft: "1px solid rgba(0,0,0,0.12)",
                            padding: 0,
                          },
                        },
                      }}
                    >
                      <ArrowDropDown />
                    </MenuButton>
                    <Menu placement="bottom-end" sx={{ minWidth: 220, zIndex: 1300 }}>
                      <MenuItem
                        disabled={addToWatchlistData?.isLoading || removeFromWatchlistData?.isLoading}
                        onClick={() => {
                          if (!isLoggedIn) { navigate("/auth/login"); return; }
                          if (watchlistItem) void removeFromWatchlist(movieType, movieId.toString());
                          else void addToWatchlist(movieType, movieId.toString(), (movieDetails as any)?.poster_path, movieTitle);
                          setCollectionsMenuOpen(false);
                        }}
                      >
                        {watchlistItem ? <Check sx={{ fontSize: 18 }} /> : <Add sx={{ fontSize: 18 }} />}
                        {watchlistItem ? "Remove from Watchlist" : "Add to Watchlist"}
                      </MenuItem>
                      {collections.length > 0 && (
                        <>
                          <MenuItem disabled sx={{ fontSize: "0.72rem", opacity: 0.5, py: 0.5 }}>MY LISTS</MenuItem>
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
                      <MenuItem onClick={createListAndAdd} disabled={addingToList === "new"}>
                        <Add sx={{ fontSize: 18 }} />
                        Create new list &amp; add
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </Box>
                {hasStartedWatching ? (
                  <Box sx={{ width: "100%", display: "flex", gap: 0.5 }}>
                    <Button
                      variant="outlined"
                      color="neutral"
                      sx={{ flex: 1 }}
                      startDecorator={<Replay sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        navigate(startOverEpisodeTarget.route);
                      }}
                      disabled={isReleaseBlocked || myselfData?.isLoading}
                    >
                      Play from beginning
                    </Button>
                    {movieType === "tv" ? (
                      <Dropdown>
                        <MenuButton
                          slots={{ root: Button }}
                          aria-label="Start-over options"
                          slotProps={{ root: { variant: "outlined", color: "neutral" } }}
                          disabled={isReleaseBlocked || myselfData?.isLoading}
                        >
                          <ArrowDropDown sx={{ fontSize: 16 }} />
                        </MenuButton>
                        <Menu>
                          <MenuItem
                            onClick={() => {
                              navigate(startOverEpisodeTarget.route);
                            }}
                          >
                            Start over the episode
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              navigate(startOverSeriesTarget.route);
                            }}
                          >
                            Start over the series
                          </MenuItem>
                        </Menu>
                      </Dropdown>
                    ) : null}
                  </Box>
                ) : null}
                {playButtonNote ? (
                  <Typography level="body-sm" sx={{ color: "#a1a1a1" }}>
                    {playButtonNote}
                  </Typography>
                ) : null}
                {progressNote && !(watchlistItem || recentItem || ratingItem) ? (
                  <Typography
                    level="body-xs"
                    sx={{
                      textAlign: { xs: "center", md: "left" },
                      color: "#707070",
                    }}
                  >
                    {progressNote}
                  </Typography>
                ) : null}
                <Box sx={{ width: "100%", display: "flex", gap: 0.5 }}>
                <Button
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
                  variant="outlined"
                  color="neutral"
                  sx={{ flex: 1, minWidth: 0 }}
                  startDecorator={
                    ratingItem ? (
                      <Star sx={{ fontSize: 16, fill: "currentColor" }} />
                    ) : (
                      <StarBorder sx={{ fontSize: 16 }} />
                    )
                  }
                >
                  {ratingItem ? `Your rating: ${ratingItem.rating}/10` : "Rate this title"}
                </Button>
                {movieType === "tv" && isLoggedIn && (
                  <Button
                    onClick={() => {
                      const interests = (myselfData?.data as unknown as User)?.notificationInterests;
                      const followed = interests?.followedShows || [];
                      const isCurrentlyFollowing = followed.includes(String(movieId));
                      updateMyself({
                        notificationInterests: {
                          ...interests,
                          followedShows: isCurrentlyFollowing
                            ? followed.filter((id: string) => id !== String(movieId))
                            : [...followed, String(movieId)],
                        },
                      } as any);
                    }}
                    variant="outlined"
                    color="neutral"
                    sx={{ flex: 1, minWidth: 0 }}
                    startDecorator={
                      (myselfData?.data as unknown as User)?.notificationInterests?.followedShows?.includes(String(movieId)) ? (
                        <Notifications sx={{ fontSize: 16 }} />
                      ) : (
                        <NotificationsNone sx={{ fontSize: 16 }} />
                      )
                    }
                  >
                    {(myselfData?.data as unknown as User)?.notificationInterests?.followedShows?.includes(String(movieId))
                      ? "Following"
                      : "Follow"}
                  </Button>
                )}
                </Box>
                {(watchlistItem || recentItem || ratingItem) && (
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 1.25,
                      backgroundColor: "rgba(10,10,10,0.72)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography level="title-sm">Your library</Typography>
                    {watchlistItem?.addedAt ? (
                      <Typography level="body-xs" textColor="neutral.500">
                        In watchlist
                        {watchlistItem.addedAt
                          ? ` • Added ${formatTimeAgo(watchlistItem.addedAt)}`
                          : ""}
                      </Typography>
                    ) : null}
                    {recentItem?.lastWatchedAt ? (
                      <Typography level="body-xs" textColor="neutral.300">
                        {progressNote ||
                          `Last watched ${formatTimeAgo(recentItem.lastWatchedAt)}`}
                      </Typography>
                    ) : null}
                    {ratingItem ? (
                      <Typography level="body-xs" textColor="neutral.300">
                        Rated {ratingItem.rating}/10
                        {ratingItem.ratedAt
                          ? ` • ${formatTimeAgo(ratingItem.ratedAt)}`
                          : ""}
                      </Typography>
                    ) : null}
                  </Box>
                )}
              </Box>

              {overview ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {activeEpisodeTitle ? (
                    <Typography
                      level="title-md"
                      sx={{
                        color: "#ededed",
                      }}
                    >
                      {activeEpisodeTitle}
                    </Typography>
                  ) : null}
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
                        isOverviewLong && !isOverviewExpanded ? 4 : "unset",
                      overflow: "hidden",
                    }}
                  >
                    {overview}
                  </Typography>
                  {isOverviewLong ? (
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => setIsOverviewExpanded((current) => !current)}
                      sx={{
                        alignSelf: { xs: "center", md: "flex-start" },
                        px: 0,
                        minHeight: 0,
                        color: "text.tertiary",
                        "&:hover": { backgroundColor: "transparent", color: "text.primary" },
                      }}
                    >
                      {isOverviewExpanded ? "Less" : "More"}
                    </Button>
                  ) : null}
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
