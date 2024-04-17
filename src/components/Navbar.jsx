import React, { useEffect, useState } from "react";
import { linksData } from '../data/linksData'
import { Link } from "react-router-dom";
import MenuIcon from '../assets/icons/MenuIcon'
import CloseIcon from '../assets/icons/CloseIcon'

function Navbar() {
  const [active, setActive] = useState(false);

  const menuClose = () => {
    setActive(false);
      document.body.classList.remove('hidden');
  };

  const menuOpen = () => {
    setActive(true);
      document.body.classList.add('hidden');
  };

  return (
    <nav className="nav">
      <div className={active ? "nav-bg show" : "nav-bg"} onClick={menuClose}></div>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-logo__list">
            <a href="/" className="nav-logo__title">
              Logo
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
                  smooth={true}
                  offset={0}
                  duration={600}
                >
                  {item.title}
                </Link>
              ))}
            </ul>
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
