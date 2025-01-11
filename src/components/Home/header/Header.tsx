import { Swiper, SwiperSlide } from "swiper/react";
import SolidStarIcon from "@mui/icons-material/StarBorder";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import { Skeleton } from "@mui/material";
import WatchLater from "@mui/icons-material/WatchLater";
import { trendingMovie } from "../../../interfaces/tmdb.js";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";

function Header({
  isLoading,
  movies,
}: {
  isLoading: boolean;
  movies: trendingMovie;
}) {

  return !isLoading ? (
    <section className="header">
      <>
        <Swiper
          style={{
            "--swiper-pagination-color": "#FFBA08",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "10px",
            "--swiper-pagination-bullet-horizontal-gap": "5px",
          } as React.CSSProperties}
          slidesPerView={1}
          effect={"fade"}
          spaceBetween={30}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          className="mySwiper"
        >
          {movies?.results.map((movie, index) => (
            <SwiperSlide key={index}>
              <img
                src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
                className="header-bg"
                alt=""
              />
              <img
                src={`http://image.tmdb.org/t/p/original${movie.poster_path}`}
                className="header-bg portrait"
                alt=""
              />
              <div className="header-items">
                <div className="header-info">
                  <h1 className="header-title">{movie.title}</h1>
                  <div className="header-texts">
                    <div className="header-item">
                      <CalendarIcon />
                      <span className="header-year">{movie.release_date}</span>
                    </div>

                    <div className="header-item">
                      <WatchLater />
                      <span className="header-year"></span>
                    </div>

                    <div className="header-item">
                      <span className="header-icon">
                        <SolidStarIcon />
                      </span>
                      <span className="header-year">{movie.vote_average}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container"></div>
            </SwiperSlide>
          ))}
        </Swiper>
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
