import React from 'react'
import logo from '../../../assets/images/logo.png'
import Footer from '../../../components/Footer'

function Premium() {
  return (
    <section className="premium">
      <div className="container">
        <div className="premium-content">
          <img src={logo} className='premium-image' alt="Smile Movie logo" />
          <h1 className='premium-title'>Tez kunda Premium tariflarimizdan foydalanishingiz mumkin. Hozirda tuzatish ishlari ketmoqda!</h1>
        </div>
      </div>
      <Footer/>
    </section>
  )
}

export default Premium