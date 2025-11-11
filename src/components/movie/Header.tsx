"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardCover,
  Typography,
} from "@mui/joy";
import { images, movieDetails, tvDetails, videos } from "../../tmdb-res";
import { useState } from "react";
import { Add, Check, PlayArrow } from "@mui/icons-material";
import { isLoggedIn, minuteToHour, ymdToDmy } from "../../utilities/defaults";
import BlurImage from "../../utilities/blurImage";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";

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
    myselfData,
    addToWatchlistData,
    removeFromWatchlistData,
    addToWatchlist,
    removeFromWatchlist,
  } = useUsers();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
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

  const watchlistItem = (myselfData?.data as unknown as User)?.watchlist?.find(
    (item) => item.id == movieId
  );
  return (
    <Card
      sx={{
        width: "100%",
        height: "100vh",
        border: "none",
        "@media (max-width: 700px)": {
          height: "70vh",
        },
      }}
    >
      <CardCover>
        {BlurImage({
          highQualitySrc: `https://image.tmdb.org/t/p/original${movieDetails?.backdrop_path}`,
          lowQualitySrc: `https://image.tmdb.org/t/p/original${movieDetails?.backdrop_path}`,
          style: {
            display: isVideoLoaded ? "none" : "block",
          },
        })}
        <iframe
          onLoad={() => {
            if (isTrailerAvailable) {
              setTimeout(() => {
                setIsVideoLoaded(true);
              }, 2000);
            } else {
              setIsVideoLoaded(false);
              (window as any).onYouTubeIframeAPIReady.stopVideo();
            }
          }}
          onErrorCapture={() => {
            setIsVideoLoaded(false);
          }}
          style={{
            display: isVideoLoaded ? "block" : "none",
            border: "none",
          }}
          width={"100%"}
          height={"100%"}
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${trailerKey}&hd=1&vq=hd1080`}
        />
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
            gap: 5,
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
              <Button
                onClick={() => {
                  navigate(
                    watchlistItem ? `/${movieType}/${movieId}${movieType == "tv" ? `/${watchlistItem.season}/${watchlistItem.episode}` : ""}/watch` :
                      `/${movieType}/${movieId}${movieType == "tv" ? `/1/1` : ""
                      }/watch`
                  );
                }}
                disabled={
                  new Date(
                    movieDetails?.release_date ||
                    movieDetails?.first_air_date ||
                    ""
                  ).getTime() > Date.now() || myselfData?.isLoading
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
                {movieType === "movie" ? (
                  watchlistItem ? (watchlistItem.status == "watching" && "Continue Watching" || watchlistItem.status == "new" && "Start Watching") : "Watch Now"
                ) : (
                  watchlistItem ? (watchlistItem.status == "watching" && `Continue S${watchlistItem.season}:E${watchlistItem.episode}` || watchlistItem.status == "new" && "Start Watching") : "Play Now"
                )}
              </Button>
              <Typography level="body-sm">
                {new Date(
                  movieDetails?.release_date ||
                  movieDetails?.first_air_date ||
                  ""
                ).getTime() > Date.now()
                  ? movieDetails?.status
                  : ""}
              </Typography>
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
                      (item) => item.id == movieId
                    )
                      ? removeFromWatchlist(movieType, movieId.toString())
                      : addToWatchlist(
                        movieType,
                        movieId.toString(),
                        movieDetails.poster_path,
                        "new",
                        0, 0, movieType == "tv" ? 1 : 0, movieType == "tv" ? 1 : 0
                      );
                }}
                startDecorator={
                  (myselfData?.data as unknown as User)?.watchlist?.find(
                    (item) => item.id == movieId
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
                  (item) => item.id == movieId
                )
                  ? removeFromWatchlistData?.isLoading
                    ? "Removing from Watchlist..."
                    : "In Watchlist"
                  : addToWatchlistData?.isLoading
                    ? "Adding to Watchlist..."
                    : "Add to Watchlist"}
              </Button>
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
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
export default Header;
