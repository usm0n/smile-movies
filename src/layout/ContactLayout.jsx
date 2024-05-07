import React from 'react'
import Contact from '../pages/components/contact/Contact'
import Footer from '../components/Footer'

function ContactLayout() {
  return (
    <section className="contact-section">
        <Contact/>
        <Footer/>
    </section>
  )
}

export default ContactLayout