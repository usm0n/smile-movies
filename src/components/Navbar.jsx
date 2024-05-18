import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { linksData } from "../data/linksData";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "../assets/icons/MenuIcon";
import Search from "../assets/icons/Search";
import CloseIcon from "../assets/icons/CloseIcon";
import logo from "../assets/images/logo.png";
import Tooltip from "@mui/material/Tooltip";
import {
  Autocomplete,
  Avatar,
  Badge,
  Divider,
  IconButton,
  ListItemIcon,
  MenuItem,
  Skeleton,
  TextField,
} from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useUser } from "../contexts/User";
import WatchLater from "@mui/icons-material/WatchLater";
import StarIcon from "@mui/icons-material/Star";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import TranslateIcon from "@mui/icons-material/Translate";
import { language, setLanguage } from "../utilities/defaultFunctions";
import { useAllMovies } from "../contexts/Movies";
import { useWatchLater } from "../contexts/WatchLater";

function Navbar() {
  const [active, setActive] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const [translateMenu, setTranslateMenu] = useState(false);
  const [searchMenu, setSearchMenu] = useState(false);
  const [searchValue, setSearchValue] = useState();

  const { isLoggedIn, user, isRealUser, logoutUser, statusLogout, isAdmin } =
    useUser();
  const { allMovies } = useAllMovies();
  const { watchlater } = useWatchLater();
  const { t } = useTranslation();

  const menuClose = () => {
    setActive(false);
    document.body.classList.remove("hidden");
  };

  const menuNavigation = (link) => {
    setProfileMenu(false);
    navigate(link);
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
    if (searchValue.length) {
      setSearchMenu(false);
      navigate(`/search/${searchValue}`);
    }
  };

  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div
        className={active ? "nav-bg show" : "nav-bg"}
        onClick={menuClose}
      ></div>
      <form
        className={
          searchMenu ? "nav-search_bar_down show" : "nav-search_bar_down"
        }
      >
        <Autocomplete
          sx={{
            backgroundColor: "#fff",
            width: "95%",
            margin: "0 auto",
            borderRadius: "5px",
          }}
          disableClearable
          freeSolo
          options={allMovies.movies}
          onChange={(e, value) => setSearchValue(value.title[language])}
          getOptionLabel={(option) => `${option.title[language]}`}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                type: "search",
              }}
              onChange={handleSearchValue}
              placeholder={t("SearchPlaceholder")}
              type="text"
              className="nav-search_bar_down-input"
            />
          )}
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
                  {item[language].title}
                </Link>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSearchSubmit} className="nav-search_bar">
            <Autocomplete
              disableClearable
              freeSolo
              options={allMovies.movies}
              onChange={(e, value) => setSearchValue(value.title[language])}
              getOptionLabel={(option) => `${option.title[language]}`}
              renderInput={(params) => (
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                    width: "410px",
                    borderRadius: "5px",
                  }}
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    type: "search",
                  }}
                  onChange={handleSearchValue}
                  placeholder={t("SearchPlaceholder")}
                  type="text"
                />
              )}
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
                  <Tooltip className="nav-menu-profile">
                    <IconButton
                      onClick={() => profileMenuOpen()}
                      size="small"
                      sx={{ mr: 1 }}
                      aria-haspopup="true"
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.firstname ? user.firstname.slice(0, 1) : null}
                      </Avatar>
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
                        <Badge
                          color="warning"
                          badgeContent={watchlater.result.length}
                        >
                          <MenuItem
                            onClick={() => menuNavigation("/watch-later")}
                          >
                            <ListItemIcon>
                              <WatchLater fontSize="small" />
                            </ListItemIcon>
                            {t("MenuWatchLaterText")}
                          </MenuItem>
                        </Badge>
                        <MenuItem onClick={() => menuNavigation("/favourites")}>
                          <ListItemIcon>
                            <StarIcon fontSize="small" />
                          </ListItemIcon>
                          {t("MenuFavouritesText")}
                        </MenuItem>
                        <MenuItem>
                          <ListItemIcon>
                            <Settings fontSize="small" />
                          </ListItemIcon>
                          {t("MenuSettingsText")}
                        </MenuItem>
                        <MenuItem onClick={() => logoutUser()}>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          {statusLogout.loading
                            ? t("MenuLogoutLoadingText")
                            : t("MenuLogoutText")}
                        </MenuItem>
                        {isAdmin.result && (
                          <>
                            <Divider />
                            <MenuItem onClick={() => menuNavigation("/admin")}>
                              <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                              </ListItemIcon>
                              Admin
                            </MenuItem>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <MenuItem
                          onClick={() => {
                            menuNavigation("/login");
                            setProfileMenu(false);
                          }}
                        >
                          <ListItemIcon>
                            <LoginIcon fontSize="small" />
                          </ListItemIcon>
                          {t("MenuLoginText")}
                        </MenuItem>
                        <Divider/>
                        <MenuItem
                          onClick={() => {
                            menuNavigation("/register");
                            setProfileMenu(false);
                          }}
                        >
                          <ListItemIcon>
                            <LoginIcon fontSize="small" />
                          </ListItemIcon>
                          {t("signUp")}
                        </MenuItem>
                      </>
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
                O'zbekcha
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
                Русский
              </MenuItem>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
