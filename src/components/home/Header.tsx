import { images, ResponseType, searchMulti, videos } from "../../tmdb-res";
import React, { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardCover,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { ymdToDmy } from "../../utilities/defaults";
import {
  Add,
  Check,
  ArrowBackIos,
  ArrowForwardIos,
  PlayArrow,
} from "@mui/icons-material";
import { User } from "../../user";
import { useUsers } from "../../context/Users";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import {
  buildPlaybackAvailabilityKey,
  getPlaybackTarget,
} from "../../utilities/playbackTarget";
import { isLikelyAnimeFromSummary } from "../../utilities/anime";

const Header = React.memo(
  ({
    trendingAll,
    trendingAllData,
    movieVideos,
    movieVideosData,
    tvVideos,
    tvVideosData,
    movieImages,
    movieImagesData,
    tvImages,
    tvImagesData,
    myselfData,
  }: {
    trendingAll: Function;
    trendingAllData: ResponseType;
    movieVideos: Function;
    movieVideosData: ResponseType;
    tvVideos: Function;
    tvVideosData: ResponseType;
    movieImages: Function;
    movieImagesData: ResponseType;
    tvImages: Function;
    tvImagesData: ResponseType;
    myselfData: ResponseType | null;
  }) => {
    const trendingResults = useMemo(() => {
      return (((trendingAllData?.data as searchMulti)?.results) || []).filter(
        (item) => item?.media_type !== "person"
      );
    }, [trendingAllData?.data]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [useLiteMode, setUseLiteMode] = useState(false);
    const [availabilityLookup, setAvailabilityLookup] = useState<Record<string, boolean | null>>({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const trailerData = useMemo(() => {
      const current = trendingResults?.[activeIndex];
      if (!current) return { trailerKey: null, isTrailerAvailable: false };

      const videoData =
        current.media_type === "movie"
          ? (movieVideosData as ResponseType)?.data
          : (tvVideosData as ResponseType)?.data;

      const filtered = (videoData as videos)?.results?.filter(
        (video) => video?.type === "Trailer"
      );

      return {
        trailerKey: filtered?.[0]?.key || null,
        isTrailerAvailable: filtered?.length > 0,
      };
    }, [activeIndex, movieVideosData, tvVideosData, trendingResults]);

    const { trailerKey, isTrailerAvailable } = trailerData;

    const logoData = useMemo(() => {
      const current = trendingResults?.[activeIndex];
      if (!current) return { logoPath: null };

      const imgData =
        current.media_type === "movie"
          ? ((movieImagesData as ResponseType)?.data as images)
          : ((tvImagesData as ResponseType)?.data as images);

      const logoLoading =
        current.media_type === "movie"
          ? (movieImagesData as ResponseType)?.isLoading
          : (tvImagesData as ResponseType)?.isLoading;

      const logoPath =
        imgData?.logos?.find((logo) => logo.iso_639_1 === "en")?.file_path ||
        null;

      return { logoPath, logoLoading };
    }, [activeIndex, movieImagesData, tvImagesData, trendingResults]);

    const { logoPath, logoLoading } = logoData;

    const navigate = useNavigate();
    const {
      addToWatchlist,
      addToWatchlistData,
      removeFromWatchlist,
      removeFromWatchlistData,
    } = useUsers();

    useEffect(() => {
      trendingAll("week", 1);
    }, []);

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

    useEffect(() => {
      const current = trendingResults[activeIndex];
      if (!current) return;
      if (current.media_type === "movie") {
        movieVideos(current.id);
        movieImages(current.id);
      } else if (current.media_type === "tv") {
        tvVideos(current.id);
        tvImages(current.id);
      }
    }, [activeIndex, trendingResults]);

    useEffect(() => {
      if (!trendingResults.length) {
        setAvailabilityLookup({});
        return;
      }

      const items = trendingResults.map((details) => {
        const mediaType = details.media_type as "movie" | "tv";
        const recentItem = (myselfData?.data as unknown as User)?.recentlyWatched?.find(
          (item) => item.id == String(details?.id) && item.type === mediaType,
        );
        const playbackTarget = getPlaybackTarget({
          mediaType,
          mediaId: details.id,
          recentItem,
        });

        return {
          key: buildPlaybackAvailabilityKey({
            mediaType,
            tmdbId: details.id,
            season: mediaType === "tv" ? playbackTarget.season : undefined,
            episode: mediaType === "tv" ? playbackTarget.episode : undefined,
          }),
          isAnimeCandidate: isLikelyAnimeFromSummary(details),
          mediaType,
          tmdbId: String(details.id),
          season: mediaType === "tv" ? playbackTarget.season : undefined,
          episode: mediaType === "tv" ? playbackTarget.episode : undefined,
        };
      });
      const animeBypassLookup = items.reduce<Record<string, boolean>>((acc, item) => {
        if (item.isAnimeCandidate) {
          acc[item.key] = true;
        }
        return acc;
      }, {});
      const nonAnimeItems = items.filter((item) => !item.isAnimeCandidate);

      let cancelled = false;
      setAvailabilityLookup(animeBypassLookup);

      if (!nonAnimeItems.length) {
        setAvailabilityLoading(false);
        return () => {
          cancelled = true;
        };
      }

      setAvailabilityLoading(true);

      void providersAPI
        .getVixsrcAvailabilityBatch(nonAnimeItems)
        .then((response) => {
          if (cancelled) return;

          const nextLookup = response.data.items.reduce<Record<string, boolean>>(
            (acc, item) => {
              const key = buildPlaybackAvailabilityKey({
                mediaType: item.mediaType,
                tmdbId: item.tmdbId,
                season: item.season,
                episode: item.episode,
              });
              acc[key] = Boolean(item.available);
              return acc;
            },
            {},
          );

          setAvailabilityLookup({
            ...animeBypassLookup,
            ...nextLookup,
          });
          setAvailabilityLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setAvailabilityLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [myselfData?.data, trendingResults]);

    const SlideContent = ({
      details,
      isActive,
      trailerKey,
      isTrailerAvailable,
    }: {
      details: any;
      isActive: boolean;
      trailerKey: string | null;
      isTrailerAvailable: boolean;
    }) => {
      const [isVideoLoaded, setIsVideoLoaded] = useState(false);
      const mediaType = details?.media_type as "movie" | "tv";

      const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
        (item) => item.id == String(details?.id) && item.type === mediaType
      );
      const recentItem = (myselfData?.data as unknown as User)?.recentlyWatched?.find(
        (item) => item.id == String(details?.id) && item.type === mediaType
      );
      const playbackTarget = getPlaybackTarget({
        mediaType,
        mediaId: details?.id,
        recentItem,
      });
      const availabilityKey = buildPlaybackAvailabilityKey({
        mediaType,
        tmdbId: details?.id,
        season: mediaType === "tv" ? playbackTarget.season : undefined,
        episode: mediaType === "tv" ? playbackTarget.episode : undefined,
      });
      const isReleaseBlocked =
        new Date(
          details?.release_date || details?.first_air_date || ""
        ).getTime() > Date.now();
      const availability = availabilityLookup[availabilityKey];
      const isAnimeCandidate = isLikelyAnimeFromSummary(details);
      const isUnavailable = !isAnimeCandidate && availability === false;
      const playButtonNote = isReleaseBlocked
        ? details?.status || ""
        : availabilityLoading && availability === null
          ? "Checking video availability..."
          : isUnavailable
            ? "Sorry, we don't have it."
            : "";

      return (
        <Card
          onClick={() => {
            navigate(`/${details?.media_type}/${details?.id}`);
          }}
          sx={{
            width: "100%",
            height: "100vh",
            border: "none",
            overflow: "hidden",
            "@media (max-width: 700px)": {
              height: "auto",
              minHeight: "100svh",
            },
            cursor: "pointer",
          }}
        >
          <CardCover>
            <img
              src={`https://image.tmdb.org/t/p/w1280${details?.backdrop_path}`}
              loading="eager"
              decoding="async"
              style={{
                display: isVideoLoaded ? "none" : "block",
              }}
            />
            {isActive && !useLiteMode && (
              <iframe
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                onLoad={() => {
                  if (isTrailerAvailable) {
                    setTimeout(() => {
                      setIsVideoLoaded(true);
                    }, 1200);
                  }
                }}
                style={{
                  display: isVideoLoaded ? "block" : "none",
                  border: "none",
                }}
                width={"100%"}
                height={"100%"}
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&mute=1&loop=1`}
              />
            )}
          </CardCover>
          <CardCover
            sx={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
            }}
          />
          <CardContent
            sx={{
              justifyContent: "flex-end",
              pt: { xs: "88px", sm: 0 },
              pb: { xs: "24px", sm: 0 },
            }}
          >
            <Box
              sx={{
                gap: 2,
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
              {logoLoading ? (
                <Skeleton variant="rectangular" width={250} height={70} />
              ) : isActive && logoPath ? (
                <Box
                  component="img"
                  src={`https://image.tmdb.org/t/p/original${logoPath}`}
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
                  {details?.name || details?.title}
                </Typography>
              )}
              <Typography
                color="neutral"
                sx={{
                  textShadow: "0 0 8px rgba(0,0,0,0.7)",
                }}
                level="body-md"
              >
                {details?.media_type === "movie" ? "Movie" : "TV Series"}
                {" • "}
                {ymdToDmy(details?.release_date || details?.first_air_date)}
              </Typography>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(playbackTarget.route);
                }}
                disabled={
                  isReleaseBlocked || isUnavailable
                }
                startDecorator={<PlayArrow />}
                sx={{
                  padding: "15px 0px",
                  width: "300px",
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
                    width: "220px",
                    padding: "10px 0px",
                  },
                }}
              >
                {mediaType === "movie" ? (
                  recentItem
                    ? Number(recentItem.currentTime || 0) > 0
                      ? "Continue Watching"
                      : "Watch Again"
                    : "Watch Now"
                ) : (
                  recentItem
                    ? Number(recentItem.currentTime || 0) > 0
                      ? `Continue S${recentItem.currentSeason}:E${recentItem.currentEpisode}`
                      : recentItem.nextSeason && recentItem.nextEpisode
                        ? `Continue S${recentItem.nextSeason}:E${recentItem.nextEpisode}`
                        : "Watch Again"
                    : "Play Now"
                )}
              </Button>
              {!isReleaseBlocked && isUnavailable && !availabilityLoading && (
                <Typography
                  level="body-sm"
                  sx={{
                    minHeight: "20px",
                    textShadow: "0 0 8px rgba(0,0,0,0.7)",
                  color: isUnavailable && !availabilityLoading && !isReleaseBlocked
                    ? "rgb(255, 166, 120)"
                    : "inherit",
                }}
              >
                {playButtonNote}
              </Typography>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (watchlistItem) {
                    void removeFromWatchlist(mediaType, String(details.id));
                    return;
                  }
                  void addToWatchlist(
                    mediaType,
                    String(details.id),
                    details.poster_path || "",
                    details.name || details.title || "",
                  );
                }}
                disabled={
                  addToWatchlistData?.isLoading ||
                  removeFromWatchlistData?.isLoading
                }
                startDecorator={watchlistItem ? <Check /> : <Add />}
                variant="solid"
                sx={{
                  width: "300px",
                  padding: "15px 0px",
                  backgroundColor: watchlistItem ? "rgb(255, 255, 255, 0.8)" : "white",
                  color: watchlistItem ? "black" : "black",
                  "&:hover": {
                    backgroundColor: watchlistItem
                      ? "rgb(255, 255, 255, 0.7)"
                      : "rgb(255, 255, 255, 0.9)",
                  },
                  "&:active": {
                    backgroundColor: watchlistItem
                      ? "rgb(255, 255, 255, 0.6)"
                      : "rgb(255, 255, 255, 0.8)",
                  },
                  "@media (max-width: 700px)": {
                    width: "220px",
                    padding: "10px 0px",
                  },
                }}
              >
                {watchlistItem ? "In Watchlist" : "Add to Watchlist"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    };

    return (
      <Box sx={{ position: "relative" }}>
        <Swiper
          style={
            {
              // @ts-ignore
              "--swiper-pagination-color": "#FFBA08",
              "--swiper-pagination-bullet-inactive-color": "#999999",
              "--swiper-pagination-bullet-inactive-opacity": "1",
              "--swiper-pagination-bullet-size": "7px",
              "--swiper-pagination-bullet-horizontal-gap": "3px",
            } as any
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          slidesPerView={1}
          effect={"fade"}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: ".custom-swiper-next",
            prevEl: ".custom-swiper-prev",
          }}
          modules={[EffectFade, Autoplay, Pagination, Navigation]}
        >
          {trendingAllData?.isLoading ? (
            <Box
              sx={{
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "@media (max-width: 700px)": {
                  height: "70vh",
                },
              }}
            >
              <Skeleton
                sx={{
                  background: "gray",
                }}
              />
            </Box>
          ) : (
            trendingResults?.map((details, index) => (
              <SwiperSlide key={details.id}>
                <SlideContent
                  details={details}
                  isActive={index === activeIndex}
                  trailerKey={trailerKey}
                  isTrailerAvailable={isTrailerAvailable}
                />
              </SwiperSlide>
            ))
          )}
        </Swiper>
        <IconButton
          className="custom-swiper-prev"
          sx={{
            position: "absolute",
            top: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            left: 16,
            zIndex: 10,
            borderRadius: "50%",
          }}
        >
          <ArrowBackIos />
        </IconButton>
        <IconButton
          className="custom-swiper-next"
          sx={{
            position: "absolute",
            top: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            right: 16,
            zIndex: 10,
            borderRadius: "50%",
          }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>
    );
  }
);

export default Header;
