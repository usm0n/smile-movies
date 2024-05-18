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
import { Grid } from "@mui/material";
import { t } from "i18next";

function NewMovies({ movies, isLoading, language }) {
  return (
    <section className="new-movie">
      <div className="container">
        <h1 className="new-movie_title">{t("NewMoviesTitle")}</h1>
        <>
          <Swiper
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
            loop={true}
            pagination={{
              clickable: true,
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <NewMoviesSkeleton />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <NewMoviesSkeleton />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <NewMoviesSkeleton />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <NewMoviesSkeleton />
                </Grid>
              </div>
            ) : (
              <>
                {movies
                  .filter((m) => m.status.isNew == true)
                  .map((movie) => {
                    return (
                      <>
                        <SwiperSlide>
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
                      </>
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
