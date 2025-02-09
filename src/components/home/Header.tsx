import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Skeleton } from "@mui/joy";
import { CalendarMonth, Star } from "@mui/icons-material";
import { useTMDB } from "../../context/TMDB";
import React, { useEffect } from "react";
import { trendingAll } from "../../tmdb-res";
import { useNavigate } from "react-router-dom";
import { SwiperSlide, Swiper } from "swiper/react";

const Header: React.FC = () => {
  const { trendingAll, trendingAllData } = useTMDB();
  const navigate = useNavigate();

  useEffect(() => {
    trendingAll("week", 1);
  }, []);
  return (
    <>
      <Swiper
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
        {trendingAllData?.isLoading ? (
          <Skeleton
            sx={{
              backgroundColor: "rgb(255, 255, 255, 0.5)",
            }}
            width="100%"
            height={600}
          />
        ) : (
          (trendingAllData?.data as trendingAll)?.results
            .filter((movie) => movie?.media_type !== "person")
            .map((movie, index) => {
              return (
                <SwiperSlide key={index}>
                  <div
                    onClick={() =>
                      navigate(
                        movie?.media_type === "movie"
                          ? `/movie/${movie.id}`
                          : `/tv/${movie.id}`
                      )
                    }
                    style={{
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                  >
                    {movie.backdrop_path ? (
                      <img
                        className="backdrop_image"
                        loading="lazy"
                        srcSet={`
                        https://image.tmdb.org/t/p/w200${movie.backdrop_path} 200w,
                        https://image.tmdb.org/t/p/w500${movie.backdrop_path} 500w
                      `}
                        sizes="(max-width: 800px) 200px, 500px"
                        src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                      />
                    ) : (
                      <img
                        loading="eager"
                        className="backdrop_image"
                        src="https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png"
                      />
                    )}
                    <div className="backdrop_image_overlay">
                      <div className="backdrop_image_overlay_content">
                        {movie.poster_path ? (
                          <img
                            loading="eager"
                            className="poster_image"
                            src={`https://image.tmdb.org/t/p/w200${movie?.poster_path}`}
                          />
                        ) : (
                          <img
                            loading="eager"
                            className="poster_image"
                            src="https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg"
                          />
                        )}
                        <div className="backdrop_image_overlay_content_info">
                          <h1
                            style={{
                              color: "white",
                              textShadow: "0 0 10px rgb(0, 0, 0)",
                            }}
                          >
                            {movie?.title || movie?.name}
                          </h1>
                          {movie?.title !== movie?.original_title ||
                            (movie?.name !== movie?.original_name && (
                              <h3
                                style={{
                                  color: "rgba(255, 255, 255, 0.7)",
                                  textShadow: "0 0 10px rgb(0, 0, 0)",
                                }}
                              >
                                {movie?.original_title || movie?.original_name}
                              </h3>
                            ))}
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                            }}
                          >
                            <h4
                              style={{
                                textShadow: "0 0 10px rgb(0, 0, 0)",
                                color: "rgb(255, 255, 255, 0.7)",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <CalendarMonth sx={{ color: "lightgray" }} />{" "}
                              {movie?.release_date || movie?.first_air_date}
                            </h4>
                            <h4
                              style={{
                                textShadow: "0 0 10px rgb(0, 0, 0)",
                                color: "rgb(255, 255, 255, 0.7)",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <Star sx={{ color: "lightgray" }} />{" "}
                              {movie?.vote_average}
                            </h4>
                          </div>
                          <h4 className="backdrop_image_overlay_content_info_overview">
                            {movie?.overview}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
        )}
      </Swiper>
    </>
  );
};

export default Header;
