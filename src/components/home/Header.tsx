import { Swiper, SwiperSlide } from "swiper/react";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";

import { EffectFade, Navigation } from "swiper/modules";
import { Box, Typography } from "@mui/joy";
import { CalendarMonth, Star } from "@mui/icons-material";
import { useTMDB } from "../../context/TMDB";
import { useEffect } from "react";
import { trendingAll } from "../../tmdb-res";
import { Skeleton } from "@mui/material";

function Header() {
  const { trendingAll, trendingAllData } = useTMDB();

  useEffect(() => {
    trendingAll("week", 1);
  }, []);
  return (
    <div>
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
        modules={[EffectFade, Navigation]}
        className="mySwiper"
      >
        {trendingAllData?.isLoading ? (
          <Skeleton
            sx={{
              backgroundColor: "rgb(255, 255, 255, 0.5)",
            }}
            variant="rectangular"
            width="100%"
            height={600}
          />
        ) : (
          (trendingAllData?.data as trendingAll)?.results.map(
            (movie, index) => {
              return (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      transition: "all 0.2s ease-in-out",
                      ":hover": {
                        cursor: "pointer",
                        filter: "brightness(90%)",
                      },
                    }}
                  >
                    {movie.backdrop_path ? (
                      <img
                        className="backdrop_image"
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                      />
                    ) : (
                      <img
                        className="backdrop_image"
                        src="https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png"
                      />
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: "0%",
                        boxShadow: "0px -200px 100px rgba(0, 0, 0, 0.9) inset",
                        width: "100%",
                        "@media (max-width: 800px)": {
                          height: "100%",
                          boxShadow: "0 -200px 500px rgba(0, 0, 0, 0.9) inset",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "end",
                          gap: 5,
                          width: "90%",
                          margin: "0 auto",
                          padding: "100px 0",
                          "@media (max-width: 1000px)": {
                            padding: "50px 0",
                          },
                          "@media (max-width: 800px)": {
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                            padding: "150px 0",
                            background: "rgb(0, 0, 0, 0.3)",
                            backdropFilter: "blur(10px)",
                          },
                        }}
                      >
                        {movie.poster_path ? (
                          <img
                            className="poster_image"
                            src={`https://image.tmdb.org/t/p/original${movie?.poster_path}`}
                          />
                        ) : (
                          <img
                            className="poster_image"
                            src="https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg"
                          />
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            "@media (max-width: 800px)": {
                              width: "90%",
                            },
                          }}
                        >
                          <Typography
                            level="h2"
                            letterSpacing={1}
                            textColor={"common.white"}
                            sx={{
                              textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                            }}
                          >
                            {movie?.title || movie?.name}
                          </Typography>
                          {movie?.title !== movie?.original_title ||
                            (movie?.name !== movie?.original_name && (
                              <Typography
                                level="h4"
                                letterSpacing={1}
                                textColor={"neutral.300"}
                                sx={{
                                  textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                                }}
                              >
                                {movie?.original_title || movie?.original_name}
                              </Typography>
                            ))}
                          <Box display={"flex"} gap={2}>
                            <Typography
                              textColor={"neutral.300"}
                              startDecorator={
                                <CalendarMonth sx={{ color: "lightgray" }} />
                              }
                            >
                              {movie?.release_date || movie?.first_air_date}
                            </Typography>
                            <Typography
                              textColor={"neutral.300"}
                              startDecorator={
                                <Star sx={{ color: "lightgray" }} />
                              }
                            >
                              {movie?.vote_average}
                            </Typography>
                          </Box>
                          <Typography
                            textColor={"neutral.300"}
                            sx={{
                              textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                              "@media (max-width: 800px)": {
                                display: "none",
                              },
                            }}
                          >
                            {movie?.overview}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </SwiperSlide>
              );
            }
          )
        )}
      </Swiper>
    </div>
  );
}

export default Header;
