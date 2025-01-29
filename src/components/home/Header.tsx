import { Swiper, SwiperSlide } from "swiper/react";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";

import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";
import { Box, Typography } from "@mui/joy";
import { CalendarMonth, Star } from "@mui/icons-material";

function Header() {
  return (
    <div>
      <Swiper
        style={
          {
            "--swiper-pagination-color": "#FFBA08",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "10px",
            "--swiper-pagination-bullet-horizontal-gap": "5px",
          } as any
        }
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
        <SwiperSlide>
          <Box
            sx={{
              transition: "all 0.2s ease-in-out",
              ":hover": {
                cursor: "pointer",
                opacity: 0.8,
              },
            }}
          >
            <img
              className="backdrop_image"
              src="https://image.tmdb.org/t/p/original/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg"
            />
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
                    padding: "250px 0",
                  },
                }}
              >
                <img
                  className="poster_image"
                  src="https://image.tmdb.org/t/p/original/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg"
                />
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
                    sx={{
                      color: "white",
                      textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    Sonic The Hedgehog 3
                  </Typography>
                  <Box display={"flex"} gap={2}>
                    <Typography
                      textColor={"neutral.300"}
                      startDecorator={<CalendarMonth />}
                    >
                      2024-12-19
                    </Typography>
                    <Typography
                      textColor={"neutral.300"}
                      startDecorator={<Star />}
                    >
                      7
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      color: "rgb(255, 255, 255, 0.8)",
                      textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                      "@media (max-width: 800px)": {
                        display: "none",
                      },
                    }}
                  >
                    Sonic, Knuckles, and Tails reunite against a powerful new
                    adversary, Shadow, a mysterious villain with powers unlike
                    anything they have faced before. With their abilities
                    outmatched in every way, Team Sonic must seek out an
                    unlikely alliance in hopes of stopping Shadow and protecting
                    the planet.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default Header;
