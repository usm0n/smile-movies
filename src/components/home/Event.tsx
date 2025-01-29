import { Box, Typography } from "@mui/joy";
import EventMC from "../cards/EventMC";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ArrowForwardIos } from "@mui/icons-material";

function Event({ eventTitle }: { eventTitle: string }) {
  return (
    <Box
      sx={{
        paddingTop: "100px",
        width: "90%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Typography
        endDecorator={<ArrowForwardIos />}
        level="h1"
        sx={{
          color: "rgb(255, 216, 77)",
          "@media (max-width: 800px)": {
            fontSize: "25px",
          },
          ":hover": {
            cursor: "pointer",
            opacity: 0.8,
            transition: "all 0.2s ease-in-out",
            textDecoration: "underline",
          },
        }}
      >
        {eventTitle}
      </Typography>
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
          slidesPerView={4}
          spaceBetween={30}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 30,
            },
            700: {
              slidesPerView: 2,
              spaceBetween: 50,
            },
            1111: {
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
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
          <SwiperSlide>
            <EventMC />
          </SwiperSlide>
        </Swiper>
      </div>
    </Box>
  );
}

export default Event;
