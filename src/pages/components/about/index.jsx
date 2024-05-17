import React from 'react'
import Bg from '../../../assets/images/header-bg.png'
import { Link } from 'react-router-dom'
import { t } from 'i18next'

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
              {t("AboutPageTitle")}
            </h1>
            <p className="about-subtitle">
              {t("AboutPageSubtitle")}
            </p>
            <Link to="/" className='about-link'>{t("HeaderWatchNowText")}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About