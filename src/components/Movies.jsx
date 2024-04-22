import React from 'react'
import Clock from '../assets/icons/ClockIcon'
import Calendar from '../assets/icons/CalendarIcon'
import { moviesData } from '../data/moviesData'
import Favourites from '../assets/icons/SolidStarIcon'

function Movies() {
    return (
        <section className="movies">
            <div className="container">
                <div className="movies-content">
                    <h1 className='movies-title'>Tarjima kinolar</h1>
                    <div className="movies-movies">
                        <div className="movies-cards">
                            {
                                moviesData.map((item) => (
                                    <div className="movies-card" key={item.id}>
                                        <img src={item.img} className='movies-img' alt={item.name} />
                                        <div className="movies-info">
                                            <h1 className='movies-name'>{item.name} </h1>
                                            <span className='movies-time'><Clock /> {item.time}</span>
                                            <span className='movies-date'>
                                                <span className='movies-item'>
                                                        <Calendar />
                                                    {item.date}
                                                </span> 
                                                
                                                <button className='movies-icon'>
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