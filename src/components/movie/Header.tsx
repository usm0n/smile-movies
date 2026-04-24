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
import {
  Add,
  Check,
  PlayArrow,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { formatTimeAgo, isLoggedIn, minuteToHour, ymdToDmy } from "../../utilities/defaults";
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
  const [useLiteMode, setUseLiteMode] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const navigate = useNavigate();
  const trailerKey = movieVideos?.results?.filter(
    (video) => video?.type == "Trailer"
  )[0]?.key;
  const isTrailerAvailable = movieVideos?.results?.filter(
    (video) => video?.type == "Trailer"
  ).length;
  const movieLogo = movieImages?.logos?.filter(
    (logo) => logo.iso_639_1 === "en"
  )[0]?.file_path;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(
      "(max-width: 700px), (prefers-reduced-motion: reduce)",
    );
    const updateLiteMode = () => setUseLiteMode(mediaQuery.matches);

    updateLiteMode();
    mediaQuery.addEventListener?.("change", updateLiteMode);

    return () => {
      mediaQuery.removeEventListener?.("change", updateLiteMode);
    };
  }, []);

  const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
    (item) => item.id == movieId && item.type === movieType
  );
  const recentItem = (myselfData?.data as unknown as User)?.recentlyWatched?.find(
    (item) => item.id == movieId && item.type === movieType
  );
  const ratingItem = (myselfData?.data as unknown as User)?.ratings?.find(
    (item) => item.id == movieId && item.type === movieType
  );
  const [availabilityState, setAvailabilityState] = useState({
    isLoading: true,
    available: null as boolean | null,
  });
  const progressPercent =
    recentItem?.duration && recentItem?.currentTime
      ? Math.min(
        100,
        Math.max(0, Math.round((recentItem.currentTime / recentItem.duration) * 100)),
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
    new Date(
      movieDetails?.release_date ||
      movieDetails?.first_air_date ||
      ""
    ).getTime() > Date.now();
  const playLabel = movieType === "movie"
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
  const progressNote = Number(recentItem?.currentTime || 0) > 0
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
      : availabilityState.available === false
        ? "Sorry, we don't have it."
        : "";
  return (
    <>
      <Card
        sx={{
          width: "100%",
          height: "100vh",
          minHeight: "100vh",
          border: "none",
          overflow: "hidden",
          "@media (max-width: 700px)": {
            height: "auto",
            minHeight: "100svh",
          },
        }}
      >
        <CardCover>
        {BlurImage({
          highQualitySrc: `https://image.tmdb.org/t/p/w1280${movieDetails?.backdrop_path}`,
          lowQualitySrc: `https://image.tmdb.org/t/p/w780${movieDetails?.backdrop_path}`,
          style: {
            display: isVideoLoaded ? "none" : "block",
          },
          eager: true,
        })}
        {!useLiteMode && isTrailerAvailable ? (
          <iframe
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            onLoad={() => {
              setTimeout(() => {
                setIsVideoLoaded(true);
              }, 1200);
            }}
            style={{
              display: isVideoLoaded ? "block" : "none",
              border: "none",
            }}
            width={"100%"}
            height={"100%"}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&mute=1&loop=1`}
          />
        ) : null}
      </CardCover>
      <CardCover
        sx={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
        }}
      />
      <CardContent
        sx={{
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          pt: { xs: "88px", sm: 0 },
          pb: { xs: "24px", sm: 0 },
        }}
      >
        <Box
          sx={{
            gap: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "70px",
            "@media (max-width: 700px)": {
              padding: "20px 20px 28px",
              gap: 2,
              alignItems: "center",
            },
          }}
        >
          {movieImages?.logos
            ?.filter((logo) => logo.iso_639_1 === "en")[0]
            ?.file_path.trim() ? (
            <Box
              component="img"
              src={`https://image.tmdb.org/t/p/original${movieLogo}`}
              sx={{
                width: "auto",
                maxHeight: "100px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 15px rgba(0,0,0,1))",
                "@media (max-width: 700px)": {
                  maxWidth: "100%",
                  margin: "0 auto",
                  height: "auto",
                },
              }}
            />
          ) : (
            <Typography
              sx={{
                textShadow: "0 0 8px rgba(0,0,0,0.7)",
              }}
              level="h1"
            >
              {movieDetails?.name || movieDetails?.title}
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              alignItems: "flex-end",
              "@media (max-width: 700px)": {
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <ButtonGroup
              variant="solid"
                sx={{
                  width: { xs: "220px", md: "300px" },
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
                      padding: "10px 0px",
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
                      movieDetails?.title || movieDetails?.name || "",
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
                    : undefined,
                }}
              >
                {playButtonNote}
              </Typography>
              {progressNote ? (
                <Typography
                  level="body-xs"
                  textColor="neutral.100"
                  sx={{ width: { xs: "220px", md: "300px" }, textAlign: "center", textShadow: "0 0 8px rgba(0,0,0,0.7)" }}
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
                  width: { xs: "220px", md: "300px" },
                  borderRadius: "16px",
                  color: ratingItem ? "rgb(255, 224, 130)" : "white",
                  border: "1px solid",
                  borderColor: ratingItem ? "rgba(255, 204, 92, 0.72)" : "rgba(255,255,255,0.28)",
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
                  {ratingItem ? `Your rating: ${ratingItem.rating}/10` : "Rate this title"}
                </Typography>
              </Button>
              {(watchlistItem || recentItem || ratingItem) && (
                <Box
                  sx={{
                    width: { xs: "220px", md: "300px" },
                    borderRadius: "18px",
                    px: 1.4,
                    py: 1.2,
                    background: "rgba(7, 14, 28, 0.72)",
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
                      In watchlist{watchlistItem.addedAt ? ` • Added ${formatTimeAgo(watchlistItem.addedAt)}` : ""}
                    </Typography>
                  ) : null}
                  {recentItem?.lastWatchedAt ? (
                    <Typography level="body-xs" textColor="neutral.300">
                      {progressNote || `Last watched ${formatTimeAgo(recentItem.lastWatchedAt)}`}
                    </Typography>
                  ) : null}
                  {ratingItem ? (
                    <Typography level="body-xs" textColor="neutral.300">
                      Rated {ratingItem.rating}/10{ratingItem.ratedAt ? ` • ${formatTimeAgo(ratingItem.ratedAt)}` : ""}
                    </Typography>
                  ) : null}
                </Box>
              )}
            </Box>
            <Box
              sx={{
                textShadow: "0 0 8px rgba(0,0,0,0.7)",
                "@media (max-width: 700px)": {
                  display: "flex",
                  flexDirection: "column-reverse",
                  alignItems: "center",
                },
              }}
            >
              {movieDetails?.overview && (
                <>
                  <Typography>
                    {movieDetails?.overview.length > 100 ? (
                      <>
                        {movieDetails?.overview.slice(0, 100)}...
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => alert(movieDetails?.overview)}
                        >
                          more
                        </Button>
                      </>
                    ) : (
                      movieDetails?.overview
                    )}
                  </Typography>
                </>
              )}
              <Typography level="body-sm">
                {movieDetails?.genres.length
                  ? movieDetails?.genres
                    ?.map((genre) => genre.name)
                    .join(", ") + " • "
                  : ""}
                {ymdToDmy(
                  movieDetails?.release_date || movieDetails?.first_air_date
                )}{" "}
                {movieDetails?.runtime || movieDetails?.episode_run_time?.length
                  ? " • " +
                  minuteToHour(
                    movieDetails?.runtime || movieDetails?.episode_run_time[0]
                  )
                  : ""}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mt: 1 }}>
                <IMDbRating mediaId={movieId} mediaType={movieType} />
                <MatchScore
                  movieTitle={movieDetails?.title || movieDetails?.name || ""}
                  movieYear={(movieDetails?.release_date || movieDetails?.first_air_date || "").slice(0, 4)}
                  overview={movieDetails?.overview}
                  genres={movieDetails?.genres?.map((g: any) => g.name)}
                />
                <ParentalGuide
                  mediaId={movieId}
                  mediaType={movieType}
                  title={movieDetails?.title || movieDetails?.name || ""}
                  year={(movieDetails?.release_date || movieDetails?.first_air_date || "").slice(0, 4)}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        </CardContent>
      </Card>
      <RatingDialog
        open={isRatingOpen}
        title={movieDetails?.title || movieDetails?.name || ""}
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
            movieDetails?.title || movieDetails?.name || "",
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
