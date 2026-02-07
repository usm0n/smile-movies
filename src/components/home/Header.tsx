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
import { isLoggedIn, ymdToDmy } from "../../utilities/defaults";
import {
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  Check,
  PlayArrow,
} from "@mui/icons-material";
import { User } from "../../user";

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
    addToWatchlist,
    removeFromWatchlist,
    addToWatchlistData,
    removeFromWatchlistData,
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
    addToWatchlist: (type: "movie" | "tv", id: string, poster: string, status: string, duration: number, currentTime: number, season: number, episode: number) => void;
    removeFromWatchlist: (type: "movie" | "tv", id: string) => void;
    addToWatchlistData: ResponseType | null;
    removeFromWatchlistData: ResponseType | null;
    myselfData: ResponseType | null;
  }) => {
    const trendingResults = (trendingAllData?.data as searchMulti)?.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );
    const [activeIndex, setActiveIndex] = useState(0);

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

    useEffect(() => {
      trendingAll("week", 1);
    }, []);

    useEffect(() => {
      if (trendingResults?.[activeIndex].media_type == "movie") {
        movieVideos(trendingResults[activeIndex].id);
        movieImages(trendingResults[activeIndex].id);
      } else if (trendingResults?.[activeIndex].media_type == "tv") {
        tvVideos(trendingResults[activeIndex].id);
        tvImages(trendingResults[activeIndex].id);
      }
    }, [activeIndex, trendingResults]);

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

      const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
        (item) => item.id == details?.id
      )

      return (
        <Card
          onClick={() => {
            navigate(`/${details?.media_type}/${details?.id}`);
          }}
          sx={{
            width: "100%",
            height: "100vh",
            border: "none",
            "@media (max-width: 700px)": {
              height: "70vh",
            },
            cursor: "pointer",
          }}
        >
          <CardCover>
            <img
              src={`https://image.tmdb.org/t/p/original${details?.backdrop_path}`}
              style={{
                display: isVideoLoaded ? "none" : "block",
              }}
            />
            {isActive && (
              <iframe
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => {
                  if (isTrailerAvailable) {
                    setTimeout(() => {
                      setIsVideoLoaded(true);
                    }, 2000);
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
          <CardContent sx={{ justifyContent: "flex-end" }}>
            <Box
              sx={{
                gap: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "70px",
                "@media (max-width: 700px)": {
                  padding: "20px",
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
                {" • "}
                {details?.vote_average
                  ? `${details?.vote_average.toFixed(1)} / 10`
                  : "N/A"}
              </Typography>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    watchlistItem ? `/${details?.media_type}/${details?.id}${details?.media_type == "tv" ? `/${watchlistItem.season}/${watchlistItem.episode}` : ""}/watch/${watchlistItem.currentTime ? watchlistItem.currentTime : 0}` :
                      `/${details?.media_type}/${details?.id}${details?.media_type == "tv" ? `/1/1` : ""
                      }/watch`
                  );
                }}
                disabled={
                  new Date(
                    details?.release_date || details?.first_air_date || ""
                  ).getTime() > Date.now()
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
                {details?.media_type === "movie" ? (
                  watchlistItem ? (watchlistItem.status == "watching" && "Continue Watching" || watchlistItem.status == "new" && "Start Watching") : "Watch Now"
                ) : (
                  watchlistItem ? (watchlistItem.status == "watching" && `Continue S${watchlistItem.season}:E${watchlistItem.episode}` || watchlistItem.status == "new" && "Start Watching") : "Play Now"
                )}
              </Button>
              <Button
                disabled={
                  myselfData?.isLoading ||
                  addToWatchlistData?.isLoading ||
                  removeFromWatchlistData?.isLoading
                }
                onClick={(e) => {
                  e.stopPropagation();
                  !isLoggedIn
                    ? navigate("/auth/login")
                    : (myselfData?.data as unknown as User)?.watchlist?.find(
                      (item) => item.id == details.id
                    )
                      ? removeFromWatchlist(
                        details.media_type,
                        details.id.toString()
                      )
                      : addToWatchlist(
                        details.media_type,
                        details.id.toString(),
                        details.poster_path,
                        "new",
                        0,
                        0,
                        details.media_type == "tv" ? 1 : 0,
                        details.media_type == "tv" ? 1 : 0
                      );
                }}
                startDecorator={
                  (myselfData?.data as unknown as User)?.watchlist?.find(
                    (item) => item.id == details.id
                  ) ? (
                    <Check />
                  ) : (
                    <Add />
                  )
                }
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
                {(myselfData?.data as unknown as User)?.watchlist?.find(
                  (item) => item.id == details.id
                )
                  ? removeFromWatchlistData?.isLoading
                    ? "Removing from Watchlist..."
                    : "In Watchlist"
                  : addToWatchlistData?.isLoading
                    ? "Adding to Watchlist..."
                    : "Add to Watchlist"}
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
