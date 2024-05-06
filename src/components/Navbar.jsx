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
  Skeleton,
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
import TranslateIcon from "@mui/icons-material/Translate";
import { language, setLanguage } from "../utilities/defaultFunctions";

function Navbar() {
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const [translateMenu, setTranslateMenu] = useState(false);
  const [searchMenu, setSearchMenu] = useState(false);
  const [searchValue, setSearchValue] = useState();

  const { isLoggedIn, user, isRealUser, logoutUser, statusLogout } = useUser();

  const menuClose = () => {
    setActive(false);
    document.body.classList.remove("hidden");
  };

  const profileMenuOpen = () => {
    setProfileMenu(!profileMenu);
    setTranslateMenu(false);
  };
  const translateMenuOpen = () => {
    setTranslateMenu(!translateMenu);
    setProfileMenu(false);
  };

  const menuOpen = () => {
    setActive(true);
    document.body.classList.add("hidden");
  };

  const handleSearchValue = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.length > 3) {
      setSearchMenu(false);
      navigate(`/search/${searchValue}`);
    }
  };

  const toggleDropDown = () => {
    setDown(!down);
  };

  const navigate = useNavigate();

  return (
    <nav className="nav">
      <form
        onSubmit={handleSearchSubmit}
        className={
          searchMenu ? "nav-search_bar_down show" : "nav-search_bar_down"
        }
      >
        <input
          onChange={(e) => handleSearchValue(e)}
          placeholder="Search"
          className="nav-search_bar_down-input"
          type="text"
        />
        <button
          onClick={handleSearchSubmit}
          className="nav-search_bar_down-btn-search"
        >
          <Search />
        </button>
        <button
          onClick={() => setSearchMenu(false)}
          className="nav-search_bar_down-btn"
        >
          <CloseIcon />
        </button>
      </form>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-items">
            <button className="nav-menu" onClick={menuOpen}>
              <MenuIcon />
            </button>
          </div>
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
          <form onSubmit={handleSearchSubmit} className="nav-search_bar">
            <input
              onChange={handleSearchValue}
              placeholder="Search"
              type="text"
              className="nav-search_input"
            />
            <button className="nav-search_btn">
              <Search />
            </button>
          </form>
          <div className="nav-search_bar mobile">
            <Link
              onClick={() => setSearchMenu(true)}
              className="nav-search_btn mobile"
            >
              <Search />
            </Link>
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
                      onClick={() => profileMenuOpen()}
                      size="small"
                      sx={{ mr: 1 }}
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
                          {isRealUser.loading ? (
                            <Skeleton
                              sx={{
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ) : (
                            user.firstname
                          )}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => navigate("/watch-later")}>
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
                        <MenuItem onClick={() => logoutUser()}>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          {statusLogout.loading ? "Logging out..." : "Log out"}
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
            </div>
          </div>
          <div className="nav-translate">
            <Link
              onClick={() => translateMenuOpen()}
              className="nav-translate-btn"
            >
              <TranslateIcon />
              {language && language.toUpperCase()}
            </Link>
            <div
              className={
                translateMenu ? "nav-translate-down show" : "nav-translate-down"
              }
            >
              <MenuItem
                className="nav-translate-down-link"
                onClick={() => {
                  setLanguage("uz");
                  window.location.reload();
                }}
              >
                Uzbek
              </MenuItem>
              <Divider />
              <MenuItem
                className="nav-translate-down-link"
                onClick={() => {
                  setLanguage("en");
                  window.location.reload();
                }}
              >
                English
              </MenuItem>
              <Divider />
              <MenuItem
                className="nav-translate-down-link"
                onClick={() => {
                  setLanguage("ru");
                  window.location.reload();
                }}
              >
                Russian
              </MenuItem>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
