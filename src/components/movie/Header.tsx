"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardCover,
  Typography,
} from "@mui/joy";
import { images, movieDetails, tvDetails, videos } from "../../tmdb-res";
import { useEffect, useMemo, useState } from "react";
import { Add, Check, PlayArrow, Star, StarBorder } from "@mui/icons-material";
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
import RatingDialog from "../library/RatingDialog";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import { getPlaybackTarget } from "../../utilities/playbackTarget";
import { isLikelyAnimeFromDetails } from "../../utilities/anime";

const getPreferredLogoPath = (movieImages: images) =>
  movieImages?.logos?.find((logo) => logo.iso_639_1 === "en")?.file_path ||
  movieImages?.logos?.find((logo) => !logo.iso_639_1)?.file_path ||
  movieImages?.logos?.[0]?.file_path ||
  null;

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
  } = useUsers();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
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
  const overview = movieDetails?.overview?.trim() || "";
  const isOverviewLong = overview.length > 220;
  const backdropPath = movieDetails?.backdrop_path || movieDetails?.poster_path;

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [movieId]);

  const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
    (item) => item.id == movieId && item.type === movieType,
  );
  const recentItem = (myselfData?.data as unknown as User)?.recentlyWatched?.find(
    (item) => item.id == movieId && item.type === movieType,
  );
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
  const isReleaseBlocked =
    new Date(movieDetails?.release_date || movieDetails?.first_air_date || "")
      .getTime() > Date.now();
  const isAnimeCandidate = isLikelyAnimeFromDetails(movieDetails);
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
    Number(recentItem?.currentTime || 0) > 0
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

    if (isAnimeCandidate) {
      setAvailabilityState({
        isLoading: false,
        available: true,
      });
      return () => {
        cancelled = true;
      };
    }

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
  }, [isAnimeCandidate, movieId, movieType, playbackTarget.episode, playbackTarget.season]);

  const playButtonNote = isReleaseBlocked
    ? movieDetails?.status || ""
    : availabilityState.isLoading && availabilityState.available === null
      ? "Checking video availability..."
      : availabilityState.available === false
        ? "Sorry, we don't have it."
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
          height: { xs: "auto", md: "100vh" },
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
                    }, 250);
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
                    filter: "drop-shadow(0 0 18px rgba(0,0,0,1))",
                  }}
                />
              ) : (
                <Typography
                  level="h1"
                  sx={{
                    textShadow: "0 0 8px rgba(0,0,0,0.7)",
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1,
                  }}
                >
                  {movieTitle}
                </Typography>
              )}

              {movieDetails?.tagline ? (
                <Typography
                  level="title-md"
                  sx={{ color: "rgba(255,255,255,0.72)", maxWidth: "32ch" }}
                >
                  {movieDetails.tagline}
                </Typography>
              ) : null}

              {metadataItems.length ? (
                <Typography
                  level="body-sm"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {metadataItems.join(" • ")}
                </Typography>
              ) : null}

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
                <ButtonGroup
                  variant="solid"
                  sx={{
                    width: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      navigate(playbackTarget.route);
                    }}
                    disabled={
                      isReleaseBlocked ||
                      myselfData?.isLoading ||
                      availabilityState.available === false
                    }
                    startDecorator={<PlayArrow />}
                    sx={{
                      flex: 1,
                      padding: "15px 0px",
                      color: "black",
                      transition: "all 0.1s ease-in-out",
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "rgb(255, 255, 255, 0.9)",
                      },
                      "&:active": {
                        backgroundColor: "rgb(255, 255, 255, 0.8)",
                      },
                      "@media (max-width: 700px)": {
                        padding: "12px 0px",
                      },
                    }}
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
                    sx={{
                      minWidth: { xs: "54px", md: "64px" },
                      color: "black",
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "rgb(255, 255, 255, 0.9)",
                      },
                      "&:active": {
                        backgroundColor: "rgb(255, 255, 255, 0.8)",
                      },
                    }}
                  >
                    {watchlistItem ? <Check /> : <Add />}
                  </Button>
                </ButtonGroup>
                <Typography
                  level="body-sm"
                  sx={{
                    minHeight: "20px",
                    color:
                      availabilityState.available === false &&
                      !availabilityState.isLoading &&
                      !isReleaseBlocked
                        ? "rgb(255, 166, 120)"
                        : "rgba(255,255,255,0.72)",
                  }}
                >
                  {playButtonNote}
                </Typography>
                {progressNote ? (
                  <Typography
                    level="body-xs"
                    sx={{
                      textAlign: { xs: "center", md: "left" },
                      color: "rgba(255,255,255,0.76)",
                    }}
                  >
                    {progressNote}
                  </Typography>
                ) : null}
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
                  sx={{
                    width: "100%",
                    borderRadius: "16px",
                    color: ratingItem ? "rgb(255, 224, 130)" : "white",
                    border: "1px solid",
                    borderColor: ratingItem
                      ? "rgba(255, 204, 92, 0.72)"
                      : "rgba(255,255,255,0.28)",
                    background: ratingItem
                      ? "linear-gradient(180deg, rgba(75, 52, 5, 0.92) 0%, rgba(34, 23, 3, 0.92) 100%)"
                      : "linear-gradient(180deg, rgba(14, 22, 39, 0.9) 0%, rgba(6, 10, 18, 0.92) 100%)",
                    gap: 1,
                    boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
                    backdropFilter: "blur(18px)",
                    "&:hover": {
                      background: ratingItem
                        ? "linear-gradient(180deg, rgba(94, 67, 9, 0.95) 0%, rgba(43, 29, 4, 0.95) 100%)"
                        : "linear-gradient(180deg, rgba(22, 33, 57, 0.96) 0%, rgba(10, 16, 28, 0.96) 100%)",
                    },
                  }}
                >
                  {ratingItem ? <Star /> : <StarBorder />}
                  <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                    {ratingItem
                      ? `Your rating: ${ratingItem.rating}/10`
                      : "Rate this title"}
                  </Typography>
                </Button>
                {(watchlistItem || recentItem || ratingItem) && (
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: "18px",
                      px: 1.4,
                      py: 1.2,
                      background: "rgba(7, 14, 28, 0.48)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(14px)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.8,
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
                  <Typography
                    level="body-md"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
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
                        color: "rgb(255,216,77)",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "rgb(255,228,132)",
                        },
                      }}
                    >
                      {isOverviewExpanded ? "Less" : "More"}
                    </Button>
                  ) : null}
                </Box>
              ) : null}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  mt: 0.5,
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
    </>
  );
}

export default Header;
