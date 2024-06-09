import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SmallMovieCardSkeleton from "../../MovieCard/Skeleton/SmallMovieCardSkeleton";
import { t } from "i18next";
import SmallMovieCard from "../../MovieCard/SmallMovieCard";

function NewMovies({ movies, isLoading }) {
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
                  <SmallMovieCardSkeleton />
                </SwiperSlide>
              ))
            ) : (
              <>
                {movies
                  .filter((m) => m.status.isNew == true)
                  .map((movie, index) => {
                    return (
                      <SwiperSlide key={index}>
                        <SmallMovieCard
                          linkTo={`/movie/${movie._id}`}
                          movie={movie}
                        />
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
