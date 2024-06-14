import React from "react";
import Contact from "../pages/components/contact/Contact";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";

function ContactLayout() {
  return (
    <section className="contact-section">
      <Helmet>
        <title>Contact - Smile Movies</title>
        <meta name="description" content="Biz bilan bog'lanish orqali savollaringizga javob oling - Smile Movies" />
      </Helmet>
      <Contact />
      <Footer />
    </section>
  );
}

export default ContactLayout;
