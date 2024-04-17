import React from 'react'
import { Helmet } from 'react-helmet'

function About() {
    return (
        <div className='about'>
            <Helmet>
                <title>About</title>
                <meta name="description" content="Bu sahifa biz haqimizda" />
            </Helmet>
            This about page About
        </div>
    )
}

export default About