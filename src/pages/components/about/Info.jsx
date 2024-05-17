import React from 'react'
import Img from '../../../assets/images/phones-removebg.png'
import { t } from 'i18next'

function Info() {   
  return (
    <section className="info">
        <div className="container">
            <div className="info-content">
                <h1 className='info-title'>{t("AboutOurWebsiteText")}</h1>
                <p className="info-subtitle">{t("AboutOutWebsiteSubtitle")}</p>

                <div className="info-about">
                    <div className="info-text">
                        <div className="info-numbers">
                            <h1 className='info-number'>1000+</h1>
                            <span className='info-span'>{t("AboutUsers")}</span>
                        </div>
                        <div className="info-numbers">
                            <h1 className='info-number'>900+</h1>
                            <span className='info-span'>{t("AboutMovies")}</span>
                        </div>                        

                        <div className="info-numbers">
                            <h1 className='info-number'>600+</h1>
                            <span className='info-span'>{t("AboutSeries")}</span>
                        </div>
                    </div>
                    <img src={Img} className='info-img' alt="" />
                </div>
            </div>
        </div>
    </section>
  )
}

export default Info