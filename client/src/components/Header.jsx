import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import img from '../assets/images/header.jpeg'
import VideoPlayerIcon from '../assets/icons/VideoPlayerIcon'
import ClockIcon from '../assets/icons/ClockIcon'
import SolidStarIcon from '../assets/icons/SolidStarIcon'
import CalendarIcon from '../assets/icons/CalendarIcon'

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import {swiperData} from "../data/swiperData"

function Header() {
  return (
    <section className="header">

      <>
        <Swiper
          slidesPerView={1}
          effect={'fade'}
          spaceBetween={30}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          className="mySwiper"
        >

          {
            swiperData.map((item, key) => (
              <SwiperSlide>
                <img src={item.img} className='header-bg' alt="" />
                <div className='header-items'>
                  <div className='header-links'>
                    <Link className='header-link'>{item.linkName} <VideoPlayerIcon /></Link>
                    <Link className='header-link_later'>{item.linkLater} <ClockIcon/> </Link>
                  </div>
                </div>

                <div className="container">
                  <div className="header-info">
                    <h1 className='header-title'>{item.movieName}</h1>
                    {/* <Skeleton variant='text' sx={{width: "100%", color: "white"}}/> */}
                    <div className="header-texts">
                      <div className="header-item">
                        <CalendarIcon />
                        <span className='header-year'>{item.year}</span>
                      </div>

                      <div className="header-item">
                        <ClockIcon />
                        <span className='header-year'>{item.time}</span>
                      </div>

                      <div className="header-item">
                        <span className="header-icon">
                          <SolidStarIcon />
                        </span>
                        <span className='header-year'>{item.grade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          }

        </Swiper>
      </>
    </section>
  )
}

export default Header