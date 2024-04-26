import React, { useState } from 'react'
import bg from '../assets/images/login-bg.png'
import { Link } from 'react-router-dom'

function Login() {
    return (
        <section className="login">
            <div className="login-bg">
                <img src={bg} className='login-img' alt="" />
            </div>

            <div className="container">
                <div className="login-content">
                    <div className="login-card">
                        <h1 className='login-title'>Login</h1>

                        <form className='login-form'>
                            <input type="text" placeholder='Phone number' className='login-input' />
                            <input type="password" placeholder='Password' className='login-input' />

                            <button className='login-btn'>Signin</button>
                            <Link to="/register" className='login-btn'>Register</Link>
                        </form>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Login