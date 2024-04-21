import React from 'react'
import { Link } from 'react-router-dom'
import Home from '../assets/icons/Home'
import UserIcon from '../assets/icons/UserIcon'
import ClockIcon from '../assets/icons/ClockIcon'
import Star from '../assets/icons/SolidStarIcon'

function BottomNavbar() {
  return (
    <nav className="bottom-nav">
        <div className="container">
            <div className="bottom-nav_content">
                <div className="bottom-nav_links">
                    <Link to="/" className='bottom-nav_link'>
                        <Home/>
                        Home
                    </Link>
                    <Link to="/watch-later" className='bottom-nav_link'>
                        <ClockIcon/>
                        Watch later
                    </Link>
                    <Link to="/favourites" className='bottom-nav_link'>
                        <Star/>
                        Favourites
                    </Link>
                    <Link className='bottom-nav_link'>
                        <UserIcon/>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default BottomNavbar