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
import { dialog } from "../utilities/defaultFunctions";

function Header({ isLoading, movies, language }) {
  const [open, setOpen] = useState();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/login", { replace: true });
  };
  const handleClose = () => {
    setOpen(false);
  };
  return !isLoading ? (
    <section className="header">
      {dialog(
        "You are not logged in!",
        "To add to Watch Later, you must sign in or sign up first.",
        open,
        handleClose,
        handleClick
      )}
      <>
        <Swiper
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
                    <Link to={`/${movie._id}`} className="header-link">
                      Watch Now <PlayCircleFilledOutlinedIcon />
                    </Link>
                    <Link
                      onClick={() => setOpen(true)}
                      className="header-link_later"
                    >
                      Watch Later <WatchLater />{" "}
                    </Link>
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
