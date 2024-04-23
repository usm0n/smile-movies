import React, { useState } from "react";
import { linksData } from '../data/linksData'
import { Link } from "react-router-dom";
import MenuIcon from '../assets/icons/MenuIcon'
import Search from '../assets/icons/Search'
import CloseIcon from '../assets/icons/CloseIcon'
import ClockIcon from '../assets/icons/ClockIcon'
import StarIcon from '../assets/icons/StarIcon'
import UserIcon from '../assets/icons/UserIcon'
import logo from '../assets/images/logo.png'

function Navbar() {
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  const menuClose = () => {
    setActive(false);
    document.body.classList.remove('hidden');
  };

  const menuOpen = () => {
    setActive(true);
    document.body.classList.add('hidden');
  };

  const toggleDropDown = () => {
    setDown(!down)
  }

  return (
    <nav className="nav">
      <div className={active ? "nav-bg show" : "nav-bg"} onClick={menuClose}></div>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-logo__list">
            <a href="/" className="nav-logo__title">
              <img src={logo} className="nav-logo_image" alt="Smile movies logo" />
            </a>
          </div>
          <div className={active ? "nav-list active" : "nav-list"}>
            <button className="nav-menu__close" onClick={menuClose}>
              <CloseIcon />
            </button>
            <ul className="nav-links">
              {linksData.map((item, key) => (
                <Link
                  key={item.id}
                  className="nav-link"
                  onClick={menuClose}
                  to={item.title}
                >
                  {item.title}
                </Link>
              ))}
            </ul>
          </div>
          <div className="nav-search_bar">
            <input type="text" className="nav-search_input" />
            <button className="nav-search_btn">
              <Search />
            </button>
          </div>
          <div className="nav-pages">
            <div className="nav-all">
              <button className="nav-all_btn" onClick={toggleDropDown}>All</button>
            </div>
            <div className={down ? "nav-dropdown active" : "nav-dropdown"}>
              <div className={active ? "nav-dropdown_content active" : "nav-dropdown_content" && down ? "nav-dropdown_content active" : "nav-dropdown_content"}>
                <Link className="nav-dropdown_link">Kinolar</Link>
                <Link className="nav-dropdown_link">Seriallar</Link>
                <Link className="nav-dropdown_link">Tarjima kinolar</Link>
                <Link className="nav-dropdown_link">Yangi kinolar</Link>
                <Link className="nav-dropdown_link">Multfilmlar</Link>
              </div>
            </div>
            <div className="nav-page_links">
              <div className="nav-login_links">
                <Link className="nav-login_link">Login /</Link>
                <Link className="nav-login_link">Singup</Link>
                <Link className="nav-user_icon">
                  <UserIcon />
                </Link>
              </div>
              <div className={active ? "nav-items_box active" : "nav-items_box"}>
                <Link to="/watch-later" className="nav-favourites_link">
                  <ClockIcon />
                  <span className="nav-clock_text">
                    Watch-later
                  </span>
                </Link>
                <Link to="/favourites" className="nav-favourites_link">
                  <StarIcon />
                  <span className="nav-favourites_text">
                    Favourites
                  </span>
                </Link>

              </div>
            </div>
          </div>
          <div className="nav-items">
            <button className="nav-menu" onClick={menuOpen}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
