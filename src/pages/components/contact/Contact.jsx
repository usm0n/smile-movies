import React, { useState } from 'react'
import Img from '../../../assets/images/contact-bg.jpg'
import { Helmet } from 'react-helmet';

function Contact() {
  const [uName, setUName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(false)

  const handleInputChange = (event) => {
    setUName(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePhoneChange = (event) => {
    const enteredPhoneNumber = event.target.value;

    if (!(/^\d{0,12}$/.test(enteredPhoneNumber))) {
      setError('Telefon raqam 12 ta raqamdan ko\'p bo\'lmasligi kerak!');
      setActive(false)
      setTimeout(() => {
        setError('');
      }, 2000);
      return;
    }
    setPhone(enteredPhoneNumber);
  };


  const sendMessage = () => {
    if (!uName || !message || !phone) {
      setError('Iltimos, barcha maydonlarni to\'ldiring!');
      setActive(false)

      setTimeout(function () {
        setError('');
      }, 1600)
      return;
    }

    const formattedMessage = `Ismi: ${uName}\nEmail: ${email}\nIzoh: ${message}\nRaqam: ${phone}`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        chat_id: 5663095517,
        text: formattedMessage,
      }),
    };

    fetch(`https://api.telegram.org/bot6857149409:AAFf9oseOBFw59STi9FPo93jehcOBgjYOjQ/sendMessage`, requestOptions)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));

    setUName('');
    setMessage('');
    setEmail('')
    setPhone('')
    setError('Yuborildi');

    setTimeout(function () {
      setError('');
    }, 2000)

    setActive(true)
  };
  return (
    <section className="contact">
      <Helmet>
        <title>Smile Movie | Contact</title>
      </Helmet>
      <div className="contact-bg">
        <img src={Img} alt="" className="contact-bg_img" />
      </div>
      <div className="container">
        <div className="contact-content">
          <h1 className="contact-title">Fikr va takliflar uchun</h1>
          {error && <p className={active ? "contact-error active" : "contact-error"}>{error}</p>}
          <form className="contact-form">
            <div className="contact-items" data-aos="fade-down">
              <label className="contact-name">Name *</label>
              <input value={uName} required onChange={handleInputChange} type="text" className='contact-input' />
            </div>

            <div className="contact-items" data-aos="fade-down">
              <label className='contact-name'>Phone Number *</label>
              <input type="number" required value={phone} onChange={handlePhoneChange} className='contact-input' />
            </div>

            <div className="contact-items" data-aos="fade-down">
              <label className='contact-name'>Email </label>
              <input type="text" value={email} onChange={handleEmailChange} className='contact-input' />
            </div>

            <div className="contact-items" data-aos="fade-down">
              <label className='contact-name'>Message *</label>
              <input type="text" value={message} onChange={handleMessageChange} className='contact-input' />
            </div>
            <button onClick={sendMessage} className='contact-submit'>Send</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact