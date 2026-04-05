"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardCover,
  Chip,
  IconButton,
  Typography,
} from "@mui/joy";
import { images, movieDetails, tvDetails, videos } from "../../tmdb-res";
import { useState } from "react";
import {
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
import StatusActions from "../watchlist/StatusActions";

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
    addToFavorites,
    addToFavoritesData,
    myselfData,
    removeFromFavorites,
    removeFromFavoritesData,
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
    (item) => item.id == movieId && item.type === movieType
  );
  const favoriteItem = (myselfData?.data as unknown as User)?.favorites?.find(
    (item) => item.id == movieId && item.type === movieType
  );
  const currentPreference = favoriteItem?.preference || watchlistItem?.preference;
  const favoritePreference = currentPreference === "dislike" ? "like" : currentPreference || "like";
  const progressPercent =
    watchlistItem?.duration && watchlistItem?.currentTime
      ? Math.min(
        100,
        Math.max(0, Math.round((watchlistItem.currentTime / watchlistItem.duration) * 100)),
      )
      : 0;
  const playLabel = movieType === "movie"
    ? watchlistItem
      ? watchlistItem.status == "watching"
        ? "Continue Watching"
        : watchlistItem.status == "watched"
          ? "Watch Again"
          : "Start Watching"
      : "Watch Now"
    : watchlistItem
      ? watchlistItem.status == "watching"
        ? `Continue S${watchlistItem.season}:E${watchlistItem.episode}`
        : watchlistItem.status == "watched"
          ? "Watch Again"
          : "Start Watching"
      : "Play Now";
  const progressNote = watchlistItem?.status == "watching"
    ? movieType === "movie"
      ? `${progressPercent}% done${watchlistItem.currentTime ? ` • Resume at ${minuteToHour(watchlistItem.currentTime)}` : ""}`
      : `${progressPercent}% done${watchlistItem.season && watchlistItem.episode ? ` • Last on S${watchlistItem.season}:E${watchlistItem.episode}` : ""}`
    : watchlistItem?.status == "watched"
      ? `Finished${watchlistItem.updatedAt ? ` • ${formatTimeAgo(watchlistItem.updatedAt)}` : ""}`
      : watchlistItem?.status == "planned"
        ? `Saved for later${watchlistItem.addedAt ? ` • Added ${formatTimeAgo(watchlistItem.addedAt)}` : ""}`
        : "";
  const tasteLabel = currentPreference === "love"
    ? "Loved"
    : currentPreference === "like"
      ? "Liked"
      : currentPreference === "dislike"
        ? "Not for me"
        : "";
  return (
    <Card
      sx={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        border: "none",
        "@media (max-width: 700px)": {
          height: "auto",
          minHeight: "100svh",
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
                    watchlistItem ? `/${movieType}/${movieId}${movieType == "tv" ? `/${watchlistItem.season}/${watchlistItem.episode}` : ""}/watch/${watchlistItem.currentTime ? watchlistItem.currentTime : 0}` :
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
                {playLabel}
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
              {progressNote ? (
                <Typography
                  level="body-xs"
                  textColor="neutral.300"
                  sx={{ width: { xs: "220px", md: "300px" }, textAlign: "center" }}
                >
                  {progressNote}
                </Typography>
              ) : null}
              <StatusActions
                mediaId={movieId}
                mediaType={movieType}
                poster={movieDetails?.poster_path}
                title={movieDetails?.title || movieDetails?.name || ""}
                duration={watchlistItem?.duration || 0}
                currentTime={watchlistItem?.currentTime || 0}
                season={watchlistItem?.season || (movieType == "tv" ? 1 : 0)}
                episode={watchlistItem?.episode || (movieType == "tv" ? 1 : 0)}
                currentStatus={watchlistItem?.status}
                width="300px"
                mobileWidth="220px"
              />
              <IconButton
                disabled={
                  myselfData?.isLoading ||
                  addToFavoritesData?.isLoading ||
                  removeFromFavoritesData?.isLoading
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoggedIn) {
                    navigate("/auth/login");
                    return;
                  }

                  favoriteItem
                    ? removeFromFavorites(movieType, movieId.toString())
                    : addToFavorites(
                      movieType,
                      movieId.toString(),
                      movieDetails.poster_path,
                      movieDetails?.title || movieDetails?.name || "",
                      watchlistItem?.status || "favorite",
                      watchlistItem?.duration || 0,
                      watchlistItem?.currentTime || 0,
                      watchlistItem?.season || (movieType == "tv" ? 1 : 0),
                      watchlistItem?.episode || (movieType == "tv" ? 1 : 0),
                      favoritePreference,
                    );
                }}
                sx={{
                  width: "300px",
                  borderRadius: "16px",
                  color: favoriteItem ? "rgb(96, 183, 255)" : "white",
                  border: "1px solid",
                  borderColor: favoriteItem ? "rgba(96, 183, 255, 0.65)" : "rgba(255,255,255,0.16)",
                  background: favoriteItem
                    ? "rgba(78, 168, 255, 0.14)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: favoriteItem ? "0 0 28px rgba(64, 156, 255, 0.24)" : "none",
                  gap: 1,
                  "&:hover": {
                    background: favoriteItem
                      ? "rgba(78, 168, 255, 0.2)"
                      : "rgba(255,255,255,0.1)",
                  },
                  "@media (max-width: 700px)": {
                  width: "220px",
                  },
                }}
              >
                {favoriteItem ? <Star /> : <StarBorder />}
                <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                  {favoriteItem ? "In Favorites" : "Add to Favorites"}
                </Typography>
              </IconButton>
              {(watchlistItem || currentPreference) && (
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
                  <Typography level="title-sm">Your progress</Typography>
                  <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                    {watchlistItem?.status ? (
                      <Chip
                        sx={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color:
                            watchlistItem.status === "watched"
                              ? "rgb(120, 255, 178)"
                              : watchlistItem.status === "watching"
                                ? "rgb(255, 220, 92)"
                                : "rgb(150, 188, 255)",
                        }}
                      >
                        {watchlistItem.status === "watched"
                          ? "Watched"
                          : watchlistItem.status === "watching"
                            ? "Watching"
                            : "Will watch"}
                      </Chip>
                    ) : null}
                    {tasteLabel ? (
                      <Chip
                        sx={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color:
                            currentPreference === "love"
                              ? "rgb(255, 139, 184)"
                              : currentPreference === "like"
                                ? "rgb(124, 214, 255)"
                                : "rgb(255, 166, 120)",
                        }}
                      >
                        {tasteLabel}
                      </Chip>
                    ) : null}
                    {watchlistItem?.status === "watching" && progressPercent > 0 ? (
                      <Chip
                        sx={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {progressPercent}% complete
                      </Chip>
                    ) : null}
                  </Box>
                  <Typography level="body-xs" textColor="neutral.300">
                    {watchlistItem?.status === "watching"
                      ? "This title is active in your library, so you can jump back in without searching for it."
                      : watchlistItem?.status === "watched"
                        ? "Finished titles stay here so AI can use them as stronger recommendation signals."
                        : "Saved titles stay in your will watch list until you start them."}
                  </Typography>
                  {watchlistItem?.updatedAt || watchlistItem?.addedAt ? (
                    <Typography level="body-xs" textColor="neutral.500">
                      {watchlistItem?.updatedAt
                        ? `Last activity ${formatTimeAgo(watchlistItem.updatedAt)}`
                        : `Added ${formatTimeAgo(watchlistItem.addedAt || "")}`}
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
  );
}
export default Header;
