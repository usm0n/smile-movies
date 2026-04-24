"use client";

import {
  AutoAwesome,
  Logout,
  Search,
  WarningRounded,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import highLogo from "../../assets/images/logo-1000.png";
import {
  Autocomplete,
  AutocompleteOption,
  Avatar,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Dropdown,
  IconButton,
  List,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Modal,
  ModalClose,
  ModalDialog,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { googleLogout } from "@react-oauth/google";
import { useTMDB } from "../../context/TMDB";
import { images, movieDetails, searchMulti, tvDetails } from "../../tmdb-res";

const DETAIL_PAGE_REGEX = /^\/(movie|tv)\/([^/]+)$/;

const getPreferredLogoPath = (imageData?: images | null) =>
  imageData?.logos?.find((logo) => logo.iso_639_1 === "en")?.file_path ||
  imageData?.logos?.find((logo) => !logo.iso_639_1)?.file_path ||
  imageData?.logos?.[0]?.file_path ||
  null;

const Navbar: React.FC = () => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [searchVisibility, setSearchVisibility] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { myselfData, logout, logoutData, isAuthenticated, authResolved } =
    useUsers();
  const [searchValue, setSearchValue] = useState("");
  const {
    searchMultiAC,
    searchMultiACData,
    movieDetailsData,
    movieImagesData,
    tvSeriesDetailsData,
    tvImagesData,
  } = useTMDB();
  const navigate = useNavigate();
  const location = useLocation();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = myselfData?.data as User;

  const detailMatch = location.pathname.match(DETAIL_PAGE_REGEX);
  const detailType = detailMatch?.[1] as "movie" | "tv" | undefined;
  const detailId = detailMatch?.[2];
  const isDetailPage = Boolean(detailMatch);

  const detailData = useMemo(() => {
    if (!detailType || !detailId) {
      return {
        title: "",
        logoPath: null as string | null,
        isLoading: false,
      };
    }

    if (detailType === "movie") {
      const movieData = movieDetailsData?.data as movieDetails | undefined;
      const imageData = movieImagesData?.data as images | undefined;
      const isMatchingTitle = String(movieData?.id || "") === detailId;
      const isMatchingImages = String(imageData?.id || "") === detailId;

      return {
        title: isMatchingTitle ? movieData?.title || movieData?.original_title || "" : "",
        logoPath: isMatchingImages ? getPreferredLogoPath(imageData) : null,
        isLoading:
          (movieDetailsData?.isLoading && !isMatchingTitle) ||
          (movieImagesData?.isLoading && !isMatchingImages),
      };
    }

    const tvData = tvSeriesDetailsData?.data as tvDetails | undefined;
    const imageData = tvImagesData?.data as images | undefined;
    const isMatchingTitle = String(tvData?.id || "") === detailId;
    const isMatchingImages = String(imageData?.id || "") === detailId;

    return {
      title: isMatchingTitle ? tvData?.name || tvData?.original_name || "" : "",
      logoPath: isMatchingImages ? getPreferredLogoPath(imageData) : null,
      isLoading:
        (tvSeriesDetailsData?.isLoading && !isMatchingTitle) ||
        (tvImagesData?.isLoading && !isMatchingImages),
    };
  }, [
    detailId,
    detailType,
    movieDetailsData?.data,
    movieDetailsData?.isLoading,
    movieImagesData?.data,
    movieImagesData?.isLoading,
    tvImagesData?.data,
    tvImagesData?.isLoading,
    tvSeriesDetailsData?.data,
    tvSeriesDetailsData?.isLoading,
  ]);

  const navigateTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleSearchSubmit = () => {
    const trimmedSearch = searchValue.trim();
    if (trimmedSearch) {
      navigate(`/search/${trimmedSearch}`);
      setSearchValue("");
      setSearchVisibility(false);
    }
  };

  const searchResults = (
    searchMultiACData?.data as searchMulti
  )?.results?.filter(
    (result, index, self) =>
      index ===
      self.findIndex(
        (r) => (r.name || r.title) === (result.name || result.title),
      ),
  );

  const renderAuthControls = () => (
    <Box
      sx={{
        display: "flex",
        "@media (max-width: 700px)": { display: "none" },
      }}
    >
      {!authResolved ? (
        <Skeleton variant="circular" width={40} height={40} />
      ) : !isAuthenticated ? (
        <Button
          onClick={() => navigate("/auth/login")}
          sx={{
            background: "rgb(255,216,77)",
            color: "black",
            ":hover": { background: "rgb(255,216,77)", opacity: 0.8 },
          }}
        >
          Sign In
        </Button>
      ) : myselfData?.isLoading ? (
        <Dropdown>
          <MenuButton
            sx={{
              border: "none",
              ":hover": { backgroundColor: "transparent" },
            }}
          >
            <Avatar />
          </MenuButton>
          <Menu>
            <MenuItem>
              <Avatar />
              <Stack onClick={() => navigate("/user/settings")}>
                <Skeleton variant="text" sx={{ width: "120px" }} />
                <Skeleton
                  variant="text"
                  sx={{ width: "100px", height: "15px" }}
                />
              </Stack>
            </MenuItem>
          </Menu>
        </Dropdown>
      ) : (
        <Dropdown>
          <MenuButton
            sx={{
              border: "none",
              ":hover": { backgroundColor: "transparent" },
            }}
          >
            <Avatar sx={{ border: "1px solid gray" }} src={user?.profilePic}>
              {!user?.profilePic && (
                <>
                  {user?.firstname?.slice(0, 1)}
                  {user?.lastname?.slice(0, 1)}
                </>
              )}
            </Avatar>
          </MenuButton>
          <Menu>
            <MenuItem>
              <Avatar src={user?.profilePic}>
                {!user?.profilePic && (
                  <>
                    {user?.firstname?.slice(0, 1)}
                    {user?.lastname?.slice(0, 1)}
                  </>
                )}
              </Avatar>
              <Stack
                onClick={() => navigate("/user/settings")}
                sx={{ cursor: "pointer" }}
              >
                <Typography>
                  {user?.firstname} {user?.lastname}
                </Typography>
                <Typography level="body-xs">{user?.email}</Typography>
              </Stack>
              <Tooltip title="Logout">
                <IconButton onClick={() => setLogoutModal(true)} color="danger">
                  <Logout />
                </IconButton>
              </Tooltip>
            </MenuItem>
            <MenuItem onClick={() => navigate("/watchlist")}>
              <ListItemContent>Watchlist</ListItemContent>
            </MenuItem>
            {user?.handle && (
              <MenuItem onClick={() => navigate(`/u/${user.handle}`)}>
                <ListItemContent>Public Profile</ListItemContent>
              </MenuItem>
            )}
            {user?.isAdmin && (
              <MenuItem onClick={() => navigate("/admin")}>
                <ListItemContent>Admin</ListItemContent>
              </MenuItem>
            )}
          </Menu>
        </Dropdown>
      )}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          backdropFilter: isDetailPage ? "blur(18px)" : "blur(20px)",
          boxShadow: isDetailPage
            ? "0 18px 40px rgba(0,0,0,0.34)"
            : "0 0 30px rgba(255,255,255,0.1)",
          padding: isDetailPage ? "14px 18px" : "15px 20px",
          color: "#f5f5f5",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: isDetailPage
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.03)",
          background: isDetailPage
            ? "linear-gradient(180deg, rgba(2,4,10,0.94), rgba(2,4,10,0.74))"
            : "rgba(5,9,19,0.52)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: "white",
              display: "none",
              "@media (max-width: 700px)": { display: "flex" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            onClick={() => navigate("/")}
            src={highLogo}
            alt="Smile Movies Logo"
            sx={{
              width: isDetailPage ? "92px" : "100px",
              filter: "drop-shadow(0 0 10px rgba(0,0,0,1))",
              cursor: "pointer",
              transition: "200ms",
              ":active": { transform: "scale(0.95)" },
              userSelect: "none",
              flexShrink: 0,
            }}
          />
          {isDetailPage ? (
            <>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.42)",
                  lineHeight: 1,
                }}
              >
                /
              </Typography>
              <Box
                sx={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  maxWidth: { xs: "38vw", sm: "42vw", md: "260px" },
                }}
              >
                {detailData.logoPath ? (
                  <Box
                    component="img"
                    src={`https://image.tmdb.org/t/p/original${detailData.logoPath}`}
                    alt={detailData.title || "Current title logo"}
                    sx={{
                      width: "100%",
                      maxWidth: "230px",
                      maxHeight: "40px",
                      objectFit: "contain",
                      objectPosition: "left center",
                      filter: "drop-shadow(0 0 12px rgba(0,0,0,0.9))",
                    }}
                  />
                ) : detailData.title ? (
                  <Typography
                    level="title-md"
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {detailData.title}
                  </Typography>
                ) : detailData.isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: 140, height: 28, borderRadius: 10 }}
                  />
                ) : null}
              </Box>
            </>
          ) : null}
        </Box>

        {!isDetailPage ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
          >
            <Autocomplete
              size="lg"
              inputValue={searchValue}
              onInputChange={(_event, value) => {
                setSearchValue(value);
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }

                const trimmedValue = value.trim();
                if (!trimmedValue) {
                  void searchMultiAC("", 1);
                  return;
                }

                searchTimeoutRef.current = setTimeout(() => {
                  void searchMultiAC(trimmedValue, 1);
                }, 300);
              }}
              sx={{
                width: "420px",
                "@media (max-width: 1000px)": {
                  display: searchVisibility ? "flex" : "none",
                  position: "absolute",
                  top: "70px",
                  left: "10px",
                  right: "10px",
                  width: "auto",
                },
              }}
              options={searchResults ?? []}
              getOptionLabel={(option) => option?.title || option?.name || ""}
              renderOption={(props, option) => (
                <AutocompleteOption {...props}>
                  <ListItemDecorator
                    onClick={() => {
                      setSearchValue("");
                      setSearchVisibility(false);
                      navigate(`/${option.media_type}/${option.id}`);
                    }}
                  >
                    {option.poster_path || option.profile_path ? (
                      <img
                        loading="lazy"
                        width="40"
                        src={`https://image.tmdb.org/t/p/w92${option.profile_path || option.poster_path}`}
                        alt=""
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 40,
                          height: 60,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </ListItemDecorator>
                  <ListItemContent
                    onClick={() => {
                      setSearchValue("");
                      setSearchVisibility(false);
                      navigate(`/${option.media_type}/${option.id}`);
                    }}
                    sx={{ fontSize: "md" }}
                  >
                    {option.title || option.name}
                    <Typography level="body-xs" textColor="text.tertiary">
                      {option.media_type === "movie"
                        ? "Movie"
                        : option.media_type === "tv"
                          ? "TV Show"
                          : option.media_type === "person"
                            ? "Person"
                            : ""}
                    </Typography>
                  </ListItemContent>
                </AutocompleteOption>
              )}
              placeholder="Search movies & TV shows..."
              startDecorator={
                <Tooltip title="Ask AI — describe a movie, get recommendations">
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/ai");
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      px: 0.8,
                      py: 0.4,
                      borderRadius: 6,
                      background:
                        "linear-gradient(135deg, rgba(255,216,77,0.2), rgba(255,160,0,0.15))",
                      border: "1px solid rgba(255,216,77,0.35)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      userSelect: "none",
                      "&:hover": { background: "rgba(255,216,77,0.3)" },
                    }}
                  >
                    <AutoAwesome
                      sx={{ fontSize: 14, color: "rgb(255,216,77)" }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgb(255,216,77)",
                        lineHeight: 1,
                      }}
                    >
                      AI
                    </Typography>
                  </Box>
                </Tooltip>
              }
              endDecorator={
                <IconButton onClick={handleSearchSubmit} size="sm">
                  <Search />
                </IconButton>
              }
            />
          </form>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        <Box display="flex" gap={1} alignItems="center">
          {!isDetailPage ? (
            <IconButton
              onClick={() => setSearchVisibility(!searchVisibility)}
              sx={{
                borderRadius: "50%",
                ":hover": { backgroundColor: "rgb(0,0,0,0.2)" },
                "@media (min-width: 1000px)": { display: "none" },
              }}
            >
              <Search sx={{ color: "white" }} />
            </IconButton>
          ) : null}
          {renderAuthControls()}
        </Box>
      </Box>

      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          sx={{ width: { xs: "min(92vw, 420px)", sm: 500 } }}
        >
          <DialogTitle>
            <WarningRounded /> Confirmation
          </DialogTitle>
          <Divider />
          <DialogContent>Are you sure you want to log out?</DialogContent>
          <DialogActions>
            <Button
              disabled={logoutData?.isLoading}
              variant="solid"
              color="danger"
              onClick={() => {
                logout();
                googleLogout();
              }}
            >
              {logoutData?.isLoading ? "Loading..." : "Log out"}
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ModalClose />
        <Box padding={2} paddingTop={7}>
          <List>
            {!authResolved ? (
              <Skeleton variant="rectangular" width="100%" height={40} />
            ) : isAuthenticated ? (
              myselfData?.isLoading ? (
                <ListItemButton sx={{ justifyContent: "space-between" }}>
                  <Skeleton variant="circular" width={50} height={40} />
                  <Skeleton variant="text" width="100%" />
                </ListItemButton>
              ) : (
                <ListItemButton sx={{ justifyContent: "space-between" }}>
                  <Avatar src={user?.profilePic}>
                    {!user?.profilePic && (
                      <>
                        {user?.firstname?.slice(0, 1)}
                        {user?.lastname?.slice(0, 1)}
                      </>
                    )}
                  </Avatar>
                  <Stack
                    onClick={() => navigateTo("/user/settings")}
                    sx={{ flex: 1, cursor: "pointer", ml: 1 }}
                  >
                    <Typography>
                      {user?.firstname} {user?.lastname}
                    </Typography>
                    <Typography level="body-xs">
                      {(user?.email?.length ?? 0) > 20
                        ? user?.email?.slice(0, 20) + "..."
                        : user?.email}
                    </Typography>
                  </Stack>
                  <IconButton
                    onClick={() => setLogoutModal(true)}
                    color="danger"
                  >
                    <Logout />
                  </IconButton>
                </ListItemButton>
              )
            ) : (
              <Button onClick={() => navigateTo("/auth/login")}>Sign in</Button>
            )}
          </List>
          <Divider />
          <List
            size="lg"
            component="nav"
            sx={{ "& > div": { justifyContent: "center" } }}
          >
            <ListItemButton onClick={() => navigateTo("/")} sx={{ fontWeight: "lg" }}>
              Home
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/browse")}>
              Browse
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/ai")} sx={{ gap: 1 }}>
              <AutoAwesome sx={{ fontSize: 18, color: "rgb(255,216,77)" }} />
              SmileAI
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/download")}>
              Download
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/discover")}>
              Discover
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/watchlist")}>
              Watchlist
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
