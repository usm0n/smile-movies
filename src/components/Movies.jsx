import React from 'react'
import Clock from '../assets/icons/ClockIcon'
import Calendar from '../assets/icons/CalendarIcon'
import { moviesData } from '../data/moviesData'
import Favourites from '../assets/icons/SolidStarIcon'

function Movies() {
    return (
        <section className="movie">
            <div className="container">
                <div className="movie-content">
                    <h1 className='movie-title'>Tarjima kinolar</h1>
                    <div className="movie-movies">
                        <div className="movie-cards">
                            {
                                moviesData.map((item) => (
                                    <div className="movie-card" key={item.id}>
                                        <img src={item.img} className='movie-img' alt={item.name} />
                                        <div className="movie-info">
                                            <h1 className='movie-name'>{item.name} </h1>
                                            <span className='movie-time'><Clock /> {item.time}</span>
                                            <span className='movie-date'>
                                                <span className='movie-item'>
                                                        <Calendar />
                                                    {item.date}
                                                </span> 
                                                
                                                <button className='movie-icon'>
                                                    <Favourites />
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default Movies