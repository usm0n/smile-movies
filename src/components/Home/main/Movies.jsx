import React from "react";
import { useAllMovies } from "../../../contexts/Movies";
import MovieSkeletonCard from "../../movieCard/Skeleton/MovieCardSkeleton";
import MovieCard from "../../movieCard/MovieCard";
import { Grid } from "@mui/material";
import { t } from "i18next";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

function Movies({ allMovies, language, MoviesTitle, MoviesType, NoMovies }) {
  return (
    <section className="movies">
      <div className="container">
        <div className="movies-content">
          <h1 className="movies-title">{MoviesTitle}</h1>
          <div className="movies-movies">
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
                    spaceBetween: 30,
                  },
                  700: {
                    slidesPerView: 2,
                    spaceBetween: 50,
                  },
                  870: {
                    slidesPerView: 3,
                  },
                  1200: {
                    slidesPerView: 4,
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
                {allMovies.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <SwiperSlide key={index}>
                      <MovieSkeletonCard />
                    </SwiperSlide>
                  ))
                ) : allMovies.movies.filter((m) => m.status.type === MoviesType)
                    .length > 0 ? (
                  allMovies.movies
                    .filter((m) => m.status.type === MoviesType)
                    .map((movie) => {
                      return (
                        <SwiperSlide key={movie._id}>
                          <MovieCard
                            linkTo={`/movie/${movie._id}`}
                            movie={movie}
                            language={language}
                          />
                        </SwiperSlide>
                      );
                    })
                ) : (
                  <h1 style={{ textAlign: "center" }}>{NoMovies}</h1>
                )}
              </Swiper>
            </>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Movies;
