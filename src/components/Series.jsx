import React from 'react'
import { seriesData } from '../data/seriesData'
import SeriesIcon from '../assets/icons/SeriesIcon'
import Calendar from '../assets/icons/CalendarIcon'
import Favourites from '../assets/icons/SolidStarIcon'

function Series() {
  return (
    <section className="series">
        <div className="container">
            <div className="series-content">
                    <h1 className='movie-title'>Seriallar</h1>
                    <div className="movie-cards">
                        {
                            seriesData.map((item) => (
                                <div className="movie-card" key={item.id}>
                                    <img src={item.img} className='movie-img' alt={item.name} />
                                    <div className="movie-info">
                                        <h1 className='movie-name'>{item.name} </h1>
                                        <span className='movie-time'><SeriesIcon /> {item.parts} qism</span>
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
    </section>
  )
}

export default Series