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
import { Box, Button, Typography } from "@mui/joy";
import { CalendarMonth, PlayCircle, Star } from "@mui/icons-material";

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
          <img
            className="backdrop_image"
            src="https://image.tmdb.org/t/p/original/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg"
          />
          <img
            className="poster_image"
            src="https://image.tmdb.org/t/p/original/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg"
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "white",
              display: "flex",
              gap: 3,
              "@media (max-width: 700px)": {
                width: "90%",
                flexDirection: "column",
              },
            }}
          >
            <Button
              sx={{
                gap: 1,
                background: "rgb(247, 203, 43)",
                ":hover": {
                  background: "rgba(247, 203, 43, 0.86)",
                },
                color: "black",
                border: "1px solid rgb(247, 203, 43)",
                padding: "10px 20px",
                width: "200px",
                "@media (max-width: 700px)": {
                  width: "100%",
                },
              }}
            >
              <Typography>Watch Now</Typography>
              <PlayCircle />
            </Button>
            <Button
              sx={{
                gap: 1,
                background: "transparent",
                ":hover": {
                  background: "rgb(247, 203, 43)",
                  color: "black",
                },
                color: "white",
                border: "1px solid rgb(247, 203, 43)",
                padding: "10px 20px",
                width: "200px",
                "@media (max-width: 700px)": {
                  width: "100%",
                },
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                }}
              >
                Watch list
              </Typography>
              <PlayCircle />
            </Button>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "15%",
              left: "5%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
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
                sx={{
                  color: "rgb(255, 255, 255, 0.8)",
                  textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <CalendarMonth /> 2024-12-19
              </Typography>
              <Typography
                sx={{
                  color: "rgb(255, 255, 255, 0.8)",
                  textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <Star /> 7
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "rgb(255, 255, 255, 0.8)",
                textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                width: "50%",
                "@media (max-width: 700px)": {
                  display: "none",
                },
              }}
            >
              Sonic, Knuckles, and Tails reunite against a powerful new
              adversary, Shadow, a mysterious villain with powers unlike
              anything they have faced before. With their abilities outmatched
              in every way, Team Sonic must seek out an unlikely alliance in
              hopes of stopping Shadow and protecting the planet.
            </Typography>
          </Box>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default Header;
