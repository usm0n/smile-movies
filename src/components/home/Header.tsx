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
import { Box, Card, CardContent, CardCover, Typography } from "@mui/joy";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Badge from "../ui/Badge";
import { useNavigate } from "react-router-dom";
import { ymdToDmy } from "../../utilities/defaults";
import { Add, Check, ArrowBackIos, ArrowForwardIos, PlayArrow, AutoAwesome } from "../ui/icons";
import { User } from "../../user";
import { useUsers } from "../../context/Users";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import {
  buildPlaybackAvailabilityKey,
  getPlaybackTarget,
} from "../../utilities/playbackTarget";
import { pickPreferredLogoPath } from "../../utilities/tmdbImages";

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
      return ((trendingAllData?.data as searchMulti)?.results || []).filter(
        (item) => item?.media_type !== "person",
      );
    }, [trendingAllData?.data]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [useLiteMode, setUseLiteMode] = useState(false);
    const [availabilityLookup, setAvailabilityLookup] = useState<
      Record<string, boolean | null>
    >({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const trailerData = useMemo(() => {
      const current = trendingResults?.[activeIndex];
      if (!current) return { trailerKey: null, isTrailerAvailable: false };

      const videoData =
        current.media_type === "movie"
          ? (movieVideosData as ResponseType)?.data
          : (tvVideosData as ResponseType)?.data;

      const filtered = (videoData as videos)?.results?.filter(
        (video) => video?.type === "Trailer",
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

      const logoPath = pickPreferredLogoPath(imgData?.logos);

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
        const recentItem = (
          myselfData?.data as unknown as User
        )?.recentlyWatched?.find(
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
          mediaType,
          tmdbId: String(details.id),
          season: mediaType === "tv" ? playbackTarget.season : undefined,
          episode: mediaType === "tv" ? playbackTarget.episode : undefined,
        };
      });

      let cancelled = false;
      setAvailabilityLookup({});

      if (!items.length) {
        setAvailabilityLoading(false);
        return () => {
          cancelled = true;
        };
      }

      setAvailabilityLoading(true);

      void providersAPI
        .getVixsrcAvailabilityBatch(items)
        .then((response) => {
          if (cancelled) return;

          const nextLookup = response.data.items.reduce<
            Record<string, boolean>
          >((acc, item) => {
            const key = buildPlaybackAvailabilityKey({
              mediaType: item.mediaType,
              tmdbId: item.tmdbId,
              season: item.season,
              episode: item.episode,
            });
            acc[key] = Boolean(item.available);
            return acc;
          }, {});

          setAvailabilityLookup(nextLookup);
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

      const watchlistItem = (
        myselfData?.data as unknown as User
      )?.watchlist?.find(
        (item) => item.id == String(details?.id) && item.type === mediaType,
      );
      const recentItem = (
        myselfData?.data as unknown as User
      )?.recentlyWatched?.find(
        (item) => item.id == String(details?.id) && item.type === mediaType,
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
          details?.release_date || details?.first_air_date || "",
        ).getTime() > Date.now();
      const availability = availabilityLookup[availabilityKey];
      const playButtonNote = isReleaseBlocked
        ? details?.status || ""
        : availabilityLoading && availability === null
          ? "Checking video availability..."
          : "";

      return (
        <Card
          onClick={() => {
            navigate(`/${details?.media_type}/${details?.id}`);
          }}
          sx={{
            width: "100%",
            height: "min(82vh, 760px)",
            border: "none",
            borderRadius: 0,
            backgroundColor: "background.body",
            overflow: "hidden",
            "@media (max-width: 700px)": {
              height: "auto",
              minHeight: "76svh",
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
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.85) 78%, #000 100%), linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%)",
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
                width: "100%",
                maxWidth: "var(--sm-page-max)",
                mx: "auto",
                px: { xs: 2.5, md: 6 },
                pb: { xs: 4, md: 7 },
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              {logoLoading ? (
                <Box
                  className="sm-shimmer"
                  sx={{ width: 240, height: 56, borderRadius: "8px" }}
                />
              ) : isActive && logoPath ? (
                <Box
                  component="img"
                  alt={details?.name || details?.title}
                  src={`https://image.tmdb.org/t/p/original${logoPath}`}
                  sx={{
                    width: "auto",
                    maxWidth: { xs: "72%", md: 420 },
                    maxHeight: { xs: 80, md: 110 },
                    objectFit: "contain",
                    objectPosition: "left bottom",
                  }}
                />
              ) : (
                <Typography level="h1" sx={{ maxWidth: 720 }}>
                  {details?.name || details?.title}
                </Typography>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge tone="neutral">
                  {details?.media_type === "movie" ? "Movie" : "TV Series"}
                </Badge>
                <Typography level="body-sm">
                  {ymdToDmy(details?.release_date || details?.first_air_date)}
                </Typography>
              </Box>

              {details?.overview && (
                <Typography
                  level="body-md"
                  sx={{
                    maxWidth: 560,
                    display: { xs: "none", md: "-webkit-box" },
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: "#a1a1a1",
                  }}
                >
                  {details.overview}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 0.5,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(playbackTarget.route);
                  }}
                  disabled={isReleaseBlocked}
                  startDecorator={<PlayArrow sx={{ fontSize: 18 }} />}
                >
                  {mediaType === "movie"
                    ? recentItem
                      ? Number(recentItem.currentTime || 0) > 0
                        ? "Continue watching"
                        : "Watch again"
                      : "Watch now"
                    : recentItem
                      ? Number(recentItem.currentTime || 0) > 0
                        ? `Continue S${recentItem.currentSeason}:E${recentItem.currentEpisode}`
                        : recentItem.nextSeason && recentItem.nextEpisode
                          ? `Continue S${recentItem.nextSeason}:E${recentItem.nextEpisode}`
                          : "Watch again"
                      : "Play now"}
                </Button>

                <Button
                  size="lg"
                  variant="outlined"
                  color="neutral"
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
                  loading={
                    addToWatchlistData?.isLoading || removeFromWatchlistData?.isLoading
                  }
                  startDecorator={
                    watchlistItem ? (
                      <Check sx={{ fontSize: 16 }} />
                    ) : (
                      <Add sx={{ fontSize: 16 }} />
                    )
                  }
                >
                  {watchlistItem ? "In watchlist" : "Add to watchlist"}
                </Button>

                <Button
                  size="lg"
                  variant="plain"
                  color="neutral"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/ai?prompt=${encodeURIComponent("Help me decide what to watch. Ask me a few questions about my mood, genre preferences, and how long I have — then give me personalised picks.")}`,
                    );
                  }}
                  startDecorator={<AutoAwesome sx={{ fontSize: 16 }} />}
                  sx={{ display: { xs: "none", md: "inline-flex" } }}
                >
                  Let AI pick
                </Button>
              </Box>

              {!isReleaseBlocked && playButtonNote && !availabilityLoading && (
                <Typography level="body-xs">{playButtonNote}</Typography>
              )}
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
              "--swiper-pagination-color": "#ffffff",
              "--swiper-pagination-bullet-inactive-color": "#525252",
              "--swiper-pagination-bullet-inactive-opacity": "1",
              "--swiper-pagination-bullet-size": "6px",
              "--swiper-pagination-bullet-horizontal-gap": "4px",
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
              className="sm-shimmer"
              sx={{
                width: "100%",
                height: "min(82vh, 760px)",
                "@media (max-width: 700px)": { height: "70vh" },
              }}
            />
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
          label="Previous title"
          className="custom-swiper-prev"
          variant="outlined"
          sx={{
            position: "absolute",
            top: "50%",
            left: 16,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderColor: "rgba(255,255,255,0.14)",
            display: { xs: "none", md: "inline-flex" },
            "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
          }}
        >
          <ArrowBackIos sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          label="Next title"
          className="custom-swiper-next"
          variant="outlined"
          sx={{
            position: "absolute",
            top: "50%",
            right: 16,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderColor: "rgba(255,255,255,0.14)",
            display: { xs: "none", md: "inline-flex" },
            "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
          }}
        >
          <ArrowForwardIos sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    );
  },
);

export default Header;
