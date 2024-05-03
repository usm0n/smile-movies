import React, { useState } from "react";
import { linksData } from "../data/linksData";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "../assets/icons/MenuIcon";
import Search from "../assets/icons/Search";
import CloseIcon from "../assets/icons/CloseIcon";
import ClockIcon from "../assets/icons/ClockIcon";
import UserIcon from "../assets/icons/UserIcon";
import logo from "../assets/images/logo.png";
import Tooltip from "@mui/material/Tooltip";
import DropdownIcon from "../assets/icons/DropdownIcon";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useUser } from "../contexts/User";
import WatchLater from "@mui/icons-material/WatchLater";
import StarIcon from "@mui/icons-material/Star";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";

function Navbar() {
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);

  const { isLoggedIn } = useUser();

  const menuClose = () => {
    setActive(false);
    document.body.classList.remove("hidden");
  };

  const menuOpen = () => {
    setActive(true);
    document.body.classList.add("hidden");
  };

  const toggleDropDown = () => {
    setDown(!down);
  };

  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div
        className={active ? "nav-bg show" : "nav-bg"}
        onClick={menuClose}
      ></div>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-logo__list">
            <a href="/" className="nav-logo__title">
              <img
                src={logo}
                className="nav-logo_image"
                alt="Smile movies logo"
              />
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
                  to={item.path}
                >
                  {item.title}
                </Link>
              ))}
            </ul>
          </div>
          <div className="nav-search_bar">
            <input
              placeholder="Search"
              type="text"
              className="nav-search_input"
            />
            <button className="nav-search_btn">
              <Search />
            </button>
          </div>
          <div className="nav-pages">
            <div className="nav-page_links">
              <div className="nav-login_links">
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <Tooltip
                    className="nav-menu-profile"
                    title="Account settings"
                  >
                    <IconButton
                      onClick={() => setProfileMenu(!profileMenu)}
                      size="small"
                      sx={{ ml: 2 }}
                      aria-haspopup="true"
                    >
                      <Avatar sx={{ width: 32, height: 32 }}></Avatar>
                    </IconButton>
                  </Tooltip>
                  <div
                    className={
                      profileMenu
                        ? "nav-menu-profile_down show"
                        : "nav-menu-profile_down"
                    }
                  >
                    {isLoggedIn ? (
                      <>
                        <MenuItem>
                          <ListItemIcon>
                            <AccountCircleIcon fontSize="small" />
                          </ListItemIcon>
                          UserName
                        </MenuItem>
                        <Divider />
                        <MenuItem to="/watch-later">
                          <ListItemIcon>
                            <WatchLater fontSize="small" />
                          </ListItemIcon>
                          Watch Later
                        </MenuItem>
                        <MenuItem to="/favourites">
                          <ListItemIcon>
                            <StarIcon fontSize="small" />
                          </ListItemIcon>
                          Favourites
                        </MenuItem>
                        <MenuItem>
                          <ListItemIcon>
                            <Settings fontSize="small" />
                          </ListItemIcon>
                          Settings
                        </MenuItem>
                        <MenuItem>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          Logout
                        </MenuItem>
                      </>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          navigate("/login");
                          setProfileMenu(false);
                        }}
                      >
                        <ListItemIcon>
                          <LoginIcon fontSize="small" />
                        </ListItemIcon>
                        Sign in
                      </MenuItem>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={active ? "nav-items_box active" : "nav-items_box"}
              ></div>
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
}

export default Navbar;
