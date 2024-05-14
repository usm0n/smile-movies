import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import img from "../assets/images/header.jpeg";
import VideoPlayerIcon from "../assets/icons/VideoPlayerIcon";
import ClockIcon from "../assets/icons/ClockIcon";
import SolidStarIcon from "../assets/icons/SolidStarIcon";
import CalendarIcon from "../assets/icons/CalendarIcon";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import { Box, Skeleton } from "@mui/material";
import WatchLater from "@mui/icons-material/WatchLater";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
import { dialog, snackbar } from "../utilities/defaultFunctions";
import Check from "@mui/icons-material/Check";

function Header({
  isLoading,
  movies,
  language,
  addWatchLater,
  statusAddWatchLater,
  isLoggedIn,
  removeWatchLater,
  statusRemoveWatchLater,
  user,
}) {
  const [open, setOpen] = useState();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login", { replace: true });
  };

  const handleAddWatchLater = (movieId) => {
    if (!isLoggedIn) {
      setOpen(true);
    } else {
      addWatchLater(movieId);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleRemoveWatchLater = (movieId) => {
    removeWatchLater(movieId);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return !isLoading ? (
    <section className="header">
      {dialog(
        "You are not logged in!",
        "To add to Watch Later, you must sign in first.",
        open,
        handleClose,
        handleClick
      )}
      {statusAddWatchLater.isSuccess &&
        snackbar("success", "Added to Watch Later")}
      {statusAddWatchLater.isError &&
        snackbar("error", "Error at adding to Watch Later")}
      {statusAddWatchLater.isAlreadyIn &&
        snackbar("warning", "Movie already added to Watch Later")}
      {statusRemoveWatchLater.isSuccess &&
        snackbar("success", "Removed from Watch Later")}
      {statusRemoveWatchLater.isError &&
        snackbar("error", "Error at removing from Watch Later")}
      {statusRemoveWatchLater.isNotFound &&
        snackbar("warning", "Movie not found in Watch Later")}
      <>
        <Swiper
          style={{
            "--swiper-pagination-color": "#FFBA08",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "10px",
            "--swiper-pagination-bullet-horizontal-gap": "5px"
          }}
          slidesPerView={1}
          effect={"fade"}
          spaceBetween={30}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          className="mySwiper"
        >
          {movies
            .filter((m) => m.status.isTrending)
            .map((movie, key) => (
              <SwiperSlide>
                <img
                  src={movie.image.fullscreen}
                  className="header-bg"
                  alt=""
                />
                <img
                  src={movie.image.portrait}
                  className="header-bg portrait"
                  alt=""
                />
                <div className="header-items">
                  <div className="header-info">
                    <h1 className="header-title">{movie.title[language]}</h1>
                    <div className="header-texts">
                      <div className="header-item">
                        <CalendarIcon />
                        <span className="header-year">
                          {movie.releaseDate.year}
                        </span>
                      </div>

                      <div className="header-item">
                        <WatchLater />
                        <span className="header-year">
                          {movie.duration.hour}:{movie.duration.min}:00
                        </span>
                      </div>

                      <div className="header-item">
                        <span className="header-icon">
                          <SolidStarIcon />
                        </span>
                        <span className="header-year">{movie.rating.imdb}</span>
                      </div>
                    </div>
                  </div>
                  <div className="header-links">
                    <Link to={`/movie/${movie._id}`} className="header-link">
                      <PlayCircleFilledOutlinedIcon /> Watch now
                    </Link>
                    {user.watchlater && user.watchlater.includes(movie._id) ? (
                      <button
                        disabled={
                          statusRemoveWatchLater.loading ||
                          statusRemoveWatchLater.isSuccess
                        }
                        onClick={() => handleRemoveWatchLater(movie._id)}
                        className={
                          statusRemoveWatchLater.loading ||
                            statusRemoveWatchLater.isSuccess
                            ? "header-link_later disabled"
                            : "header-link_later"
                        }
                      >
                        {statusRemoveWatchLater.loading ? (
                          "Loading..."
                        ) : (
                          <>
                            <Check /> In Watch Later
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={
                          statusAddWatchLater.loading ||
                          statusAddWatchLater.isSuccess
                        }
                        onClick={() => handleAddWatchLater(movie._id)}
                        className={
                          statusAddWatchLater.loading ||
                            statusAddWatchLater.isSuccess
                            ? "header-link_later disabled"
                            : "header-link_later"
                        }
                      >
                        {statusAddWatchLater.loading ? (
                          "Loading..."
                        ) : (
                          <>
                            <WatchLater />
                            Watch Later
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="container"></div>
              </SwiperSlide>
            ))}
        </Swiper>
        {movies.filter((m) => m.status.isTrending).length === 0 && (
          <h1 style={{ textAlign: "center" }}>There's no Trending Movies</h1>
        )}
      </>
    </section>
  ) : (
    <Skeleton
      variant="rectangular"
      animation="pulse"
      sx={{
        backgroundColor: "#ffffff2f",
        width: "100%",
        height: "85vh",
      }}
    />
  );
}

export default Header;
