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
                    <h1 className='movies-title'>Seriallar</h1>
                    <div className="movies-cards">
                        {
                            seriesData.map((item) => (
                                <div className="movies-card" key={item.id}>
                                    <img src={item.img} className='movies-img' alt={item.name} />
                                    <div className="movies-info">
                                        <h1 className='movies-name'>{item.name} </h1>
                                        <span className='movies-time'><SeriesIcon /> {item.parts} qism</span>
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
    </section>
  )
}

export default Series