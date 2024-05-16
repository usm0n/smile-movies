import React from 'react'
import Img from '../../../assets/images/phones-removebg.png'

function Info() {   
  return (
    <section className="info">
        <div className="container">
            <div className="info-content">
                <h1 className='info-title'>Bizning web sayt haqida</h1>
                <p className="info-subtitle">Biz kinolar, seriallar va multfilmlarni bir joyga yig'gan holda Smile Movie onlayn kinoteatirini yaratdik. Siz bizning web saytda oxirgi premyeralarni O'zbek, Ingliz va Rus tillarida tomosha qilishingiz mumkin bo'ladi. Smlie movie o'z foydalanuvchilariga har doim eng yaxshisini ulashadi. Bizdan uzoqlashmang!</p>

                <div className="info-about">
                    <div className="info-text">
                        <div className="info-numbers">
                            <h1 className='info-number'>1000+</h1>
                            <span className='info-span'>Foydalanuvchilar</span>
                        </div>
                        <div className="info-numbers">
                            <h1 className='info-number'>900+</h1>
                            <span className='info-span'>Kinolar</span>
                        </div>                        

                        <div className="info-numbers">
                            <h1 className='info-number'>600+</h1>
                            <span className='info-span'>Seriallar</span>
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