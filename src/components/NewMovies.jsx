import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import flash from '../assets/images/flash.jpeg'

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, Pagination, Navigation } from 'swiper/modules';

function NewMovies() {
    return (
        <section className="new-movie">
            <div className="container">
                <h1 className='new-movie_title'>Yangi kinolar</h1>
                <>
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={30}
                        breakpoints={
                            {
                                280: {
                                    slidesPerView: 1,
                                    spaceBetween: 70,
                                },

                                500: {
                                    slidesPerView: 2,
                                    spaceBetween: 70
                                },

                                870: {
                                    slidesPerView: 3,
                                    spaceBetween: 70
                                },

                                1200: {
                                    slidesPerView: 4,
                                    spaceBetween: 70
                                }
                            }
                        }
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

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="new-movie_card">
                                <img src={flash} className='new-movie_img' alt="Flash Movie" />
                                <div className="new-movie_info">
                                    <h1 className="new-movie_name">The Flash</h1>
                                    <p className="new-movie_parts">Series/S 2/EP 9</p>
                                    <p className="new-movie_date">11/05/23</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </>
            </div>
        </section>
    )
}

export default NewMovies