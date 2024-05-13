import React from 'react'
import Bg from '../../../assets/images/header-bg.png'
import { Link } from 'react-router-dom'

function About() {
  return (
    <section className='about'>
      <div className="about-bg">
        <img src={Bg} className='about-bg_img' alt="" />
      </div>
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h1 className='about-title'>
              No need to go to the cinema anymore
            </h1>
            <p className="about-subtitle">
              Our website offers you an online cinema. We wish you a pleasant holiday
            </p>
            <Link to="/" className='about-link'>Watch now</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About