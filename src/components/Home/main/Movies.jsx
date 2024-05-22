import React from "react";
import { useAllMovies } from "../../../contexts/Movies";
import MovieSkeletonCard from "../../MovieCard/Skeleton/MovieCardSkeleton";
import MovieCard from "../../MovieCard/MovieCard";
import { Grid } from "@mui/material";
import { t } from "i18next";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

function Movies({ allMovies, language }) {
  console.log("Movies component rendered");

  return (
    <section className="movies">
      <div className="container">
        <div className="movies-content">
          <h1 className="movies-title">{t("MoviesTitle")}</h1>
          <div className="movies-movies">
            <div className="movies-cards">
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
                {allMovies.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <SwiperSlide key={index}>
                      <MovieSkeletonCard />
                    </SwiperSlide>
                  ))
                ) : allMovies.movies.filter((m) => m.status.type === "movie").length > 0 ? (
                  allMovies.movies
                    .filter((m) => m.status.type === "movie")
                    .map((movie) => {
                      return(
                        <SwiperSlide key={movie._id}>
                          <MovieCard
                            linkTo={`/movie/${movie._id}`}
                            movie={movie}
                            language={language}
                          />
                        </SwiperSlide>
                      )
                    })
                ) : (
                  <h1>{t("NoMovies")}</h1>
                )}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Movies;
