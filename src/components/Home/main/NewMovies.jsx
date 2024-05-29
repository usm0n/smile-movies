import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import WatchLater from "@mui/icons-material/WatchLater";
import NewMoviesSkeleton from "./../../MovieCard/Skeleton/NewMoviesSkeleton";
import { t } from "i18next";

function NewMovies({ movies, isLoading, language }) {
  return (
    <section className="new-movie">
      <div className="container">
        <h1 className="new-movie_title">{t("NewMoviesTitle")}</h1>
        <>
          <Swiper
            style={{
              "--swiper-pagination-color": "#FFBA08",
              "--swiper-pagination-bullet-inactive-color": "#999999",
              "--swiper-pagination-bullet-inactive-opacity": "1",
              "--swiper-pagination-bullet-size": "10px",
              "--swiper-pagination-bullet-horizontal-gap": "5px",
            }}
            slidesPerView={4}
            spaceBetween={30}
            breakpoints={{
              280: {
                slidesPerView: 1,
                spaceBetween: 70,
              },

              500: {
                slidesPerView: 2,
                spaceBetween: 70,
              },

              870: {
                slidesPerView: 3,
                spaceBetween: 70,
              },

              1200: {
                slidesPerView: 4,
                spaceBetween: 70,
              },
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <NewMoviesSkeleton />
                </SwiperSlide>
              ))
            ) : (
              <>
                {movies
                  .filter((m) => m.status.isNew == true)
                  .map((movie, index) => {
                    return (
                        <SwiperSlide key={index}>
                          <Link
                            to={`/movie/${movie._id}`}
                            className="new-movie_card"
                          >
                            <img
                              src={movie.image.portrait}
                              className="new-movie_img"
                              alt="Flash Movie"
                            />
                            <div className="new-movie_info">
                              <h1 className="new-movie_name">
                                {movie.title[language].substring(0, 20)}
                                {movie.title[language].length > 20 ? "..." : ""}
                              </h1>
                              <p className="new-movie_parts">
                                <WatchLater /> {movie.duration.hour}:
                                {movie.duration.min}:00
                              </p>
                              <p className="new-movie_date">
                                <CalendarMonthIcon />
                                {movie.releaseDate.day}.
                                {movie.releaseDate.month}.
                                {movie.releaseDate.year}
                              </p>
                            </div>
                          </Link>
                        </SwiperSlide>
                    );
                  })}
                {movies.filter((m) => m.status.isNew).length == 0 && (
                  <h1 style={{ textAlign: "center" }}>{t("NoNewMovies")}</h1>
                )}
              </>
            )}
          </Swiper>
        </>
      </div>
    </section>
  );
}

export default NewMovies;
