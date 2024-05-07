import React from 'react'
import About from '../pages/components/about/About'
import Info from '../pages/components/about/Info'
import Accardion from '../pages/components/about/AccardionContext'
import Footer from '../components/Footer'

function AboutLayout() {
  return (
    <div className="about-section">
      <About/>
      <Info/>
      <Accardion/>
      <Footer/>
    </div>
  )
}

export default AboutLayout