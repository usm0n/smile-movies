import React from 'react'
import img from '../assets/images/movie.jpeg'
import Calendar from '../assets/icons/CalendarIcon'
import Clock from '../assets/icons/ClockIcon'
import Favourite from '../assets/icons/SolidStarIcon'

function Movie() {
    return (
        <section className="movie">
            <div className="container">
                <div className="movie-content">
                    <div className="movie-image">
                        <img src={img} alt="movie photo" className='movie-img' />
                    </div>
                    <div className="movie-info">
                        <div className="movie-items">
                            <h1 className='movie-name'>Silo</h1>
                            <button className='movie-btn'>Add to favourite</button>
                        </div>
                        <div className="movie-text">
                            <div className="movie-number_info">
                                <span className='movie-info_title'>
                                    <Calendar />
                                    2023
                                </span>

                                <span className='movie-info_title'>
                                    <Clock />
                                    50:38
                                </span>

                                <span className='movie-info_title'>
                                    <span className="movie-info_icon">
                                        <Favourite />
                                    </span>
                                    8.5
                                </span>

                            </div>

                            <p className="movie-subtitle">
                                In a ruined and toxic future, a community exists in a giant underground silo that plunges
                                hundreds of stories deep. There, men and women live in a society full of regulations they
                                believe are meant to protect them.
                            </p>

                            <div className="movie-country">
                                <h1 className='movie-country_name'>Country : United States</h1>
                                <h1 className='movie-release'>Date Release : 05 2023</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Movie