"use client";

import {
  DarkMode,
  LightMode,
  Logout,
  Search,
  Source,
  WarningRounded,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import highLogo from "../../assets/images/logo-1000.png";
// import lowLogo from "../../assets/images/logo-100.png";
import {
  Autocomplete,
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
  useColorScheme,
} from "@mui/joy";
import { isLoggedIn } from "../../utilities/defaults";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { googleLogout } from "@react-oauth/google";
import { useTMDB } from "../../context/TMDB";
import { searchMulti } from "../../tmdb-res";

const Navbar: React.FC = () => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [searchVisibility, setSearchVisibility] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colorScheme, setMode } = useColorScheme();
  const { myselfData, logout, deleteDeviceData } = useUsers();
  const [searchValue, setSearchValue] = useState("");
  const { searchMultiAC, searchMultiACData } = useTMDB();
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };
  const handleSearchSubmit = () => {
    if (searchValue) {
      navigate(`/search/${searchValue}`);
      setSearchValue("");
      setSearchVisibility(false);
    }
  };
  const searchResults = (
    searchMultiACData?.data as searchMulti
  )?.results?.filter(
    (item) => item.media_type !== "person" && item.poster_path
  );
  const user = myselfData?.data as User;

  return (
    <Box
      sx={{
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 30px rgba(255, 255, 255, 0.1)",
        padding: "15px",
        paddingLeft: "20px",
        paddingRight: "20px",
        color: "#f5f5f5",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        // "@media (max-width: 700px)": {
        //   display: "none",
        // },
      }}
    >
      <Box display={"flex"}>
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            color: "white",
            display: "none",
            "@media (max-width: 700px)": {
              display: "flex",
            },
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
            width: "100px",
            filter: "drop-shadow(0 0 10px rgba(0,0,0,1))",
            cursor: "pointer",
            transition: "200ms",
            ":active": {
              transform: "scale(0.95)",
            },
          }}
        />
      </Box>
      {/* <Box
        sx={{
          textShadow: "0 0 3px rgb(0, 0, 0, 0.7)",
          "@media (max-width: 700px)": {
            display: "none",
          },
        }}
        display={"flex"}
        gap={1}
      >
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/download">Download</Link>
      </Box> */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
      >
        <Autocomplete
          size="lg"
          onInputChange={(_event, value) => {
            setSearchValue("");
            searchMultiAC(value, 1);
            setSearchValue(value);
          }}
          sx={{
            width: "400px",
            "@media (max-width: 1000px)": {
              display: searchVisibility ? "flex" : "none",
              position: "absolute",
              top: "90px",
              left: "10px",
              right: "10px",
              width: "auto",
            },
          }}
          options={searchResults ? searchResults : []}
          getOptionLabel={(option) => option?.title || option?.name || ""}
          placeholder="Search"
          endDecorator={
            <IconButton onClick={handleSearchSubmit}>
              <Search />
            </IconButton>
          }
        />
      </form>
      <Box display={"flex"} gap={1} alignItems={"center"}>
        <IconButton
          onClick={() => setSearchVisibility(!searchVisibility)}
          sx={{
            transition: "200ms",
            borderRadius: "50%",
            ":hover": {
              backgroundColor: "rgb(0, 0, 0, 0.2)",
            },
            "@media (min-width: 1000px)": {
              display: "none",
            },
          }}
        >
          <Search sx={{ color: colorScheme == "dark" ? "white" : "black" }} />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            "@media (max-width: 700px)": {
              display: "none",
            },
          }}
        >
          {!isLoggedIn ? (
            <Button
              onClick={() => navigate("/auth/login")}
              sx={{
                background: "rgb(255, 216, 77)",
                color: "black",
                ":hover": {
                  background: "rgb(255, 216, 77)",
                  color: "black",
                  opacity: 0.8,
                  transition: "200ms",
                },
              }}
            >
              Sign In
            </Button>
          ) : myselfData?.isLoading ? (
            <Dropdown>
              <MenuButton
                sx={{
                  border: "none",
                  transition: "200ms",
                  ":hover": {
                    backgroundColor: "transparent",
                  },
                  ":active": {
                    scale: 1.1,
                  },
                }}
              >
                <Avatar></Avatar>
              </MenuButton>
              <Menu>
                <MenuItem>
                  <Avatar></Avatar>
                  <Tooltip title="View Profile">
                    <Stack onClick={() => navigate("/user/settings")}>
                      <Skeleton variant="text" sx={{ width: "120px" }} />
                      <Skeleton
                        variant="text"
                        sx={{ width: "100px", height: "15px" }}
                      />
                    </Stack>
                  </Tooltip>
                  <Tooltip title="Logout">
                    <IconButton
                      disabled
                      onClick={() => setLogoutModal(true)}
                      color="danger"
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </MenuItem>
              </Menu>
            </Dropdown>
          ) : (
            <Dropdown>
              <MenuButton
                sx={{
                  border: "none",
                  transition: "200ms",
                  ":hover": {
                    backgroundColor: "transparent",
                  },
                  ":active": {
                    scale: 1.1,
                  },
                }}
              >
                <Avatar
                  sx={{
                    border: "1px solid gray",
                  }}
                >
                  {!user?.profilePic ? (
                    <>
                      {user?.firstname?.slice(0, 1)}
                      {user?.lastname?.slice(0, 1)}
                    </>
                  ) : (
                    <img
                      src={user?.profilePic}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Avatar>
              </MenuButton>
              <Menu>
                <MenuItem>
                  <Avatar>
                    {!user?.profilePic ? (
                      <>
                        {user?.firstname?.slice(0, 1)}
                        {user?.lastname?.slice(0, 1)}
                      </>
                    ) : (
                      <img
                        src={user?.profilePic}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Avatar>
                  <Tooltip title="View Profile">
                    <Stack onClick={() => navigate("/user/settings")}>
                      <Typography>
                        {user?.firstname} {user?.lastname}
                      </Typography>
                      <Typography level="body-xs">{user?.email}</Typography>
                    </Stack>
                  </Tooltip>
                  <Tooltip title="Logout">
                    <IconButton
                      onClick={() => setLogoutModal(true)}
                      color="danger"
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </MenuItem>
              </Menu>
            </Dropdown>
          )}
        </Box>
        <Dropdown>
          <MenuButton
            sx={{
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
            }}
          >
            {colorScheme === "light" ? (
              <LightMode sx={{ color: "rgb(255, 200, 0)" }} />
            ) : (
              <DarkMode sx={{ color: "white" }} />
            )}
          </MenuButton>
          <Menu>
            <MenuItem onClick={() => setMode("system")}>
              <Typography startDecorator={<Source />}>System Theme</Typography>
            </MenuItem>
            <MenuItem onClick={() => setMode("light")}>
              <Typography startDecorator={<LightMode />}>
                Light Theme
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => setMode("dark")}>
              <Typography startDecorator={<DarkMode />}>Dark Theme</Typography>
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
        <ModalDialog minWidth={500} variant="outlined" role="alertdialog">
          <DialogTitle>
            <WarningRounded />
            Confirmation
          </DialogTitle>
          <Divider />
          <DialogContent>Are you sure you want to log out?</DialogContent>
          <DialogActions>
            <Button
              disabled={deleteDeviceData?.isLoading}
              variant="solid"
              color="danger"
              onClick={() => {
                logout();
                googleLogout();
              }}
            >
              {deleteDeviceData?.isLoading ? "Loading..." : "Log out"}
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
            {isLoggedIn ? (
              myselfData?.isLoading ? (
                <ListItemButton
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
                  <Skeleton variant="circular" width={50} height={40} />
                  <Skeleton variant="text" width={"100%"} />
                </ListItemButton>
              ) : (
                <ListItemButton
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
                  <Avatar>
                    {!user?.profilePic ? (
                      <>
                        {user?.firstname?.slice(0, 1)}
                        {user?.lastname?.slice(0, 1)}
                      </>
                    ) : (
                      <img
                        src={user?.profilePic}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Avatar>
                  <Tooltip title="View Profile">
                    <Stack onClick={() => navigateTo("/user/settings")}>
                      <Typography>
                        {user?.firstname} {user?.lastname}
                      </Typography>
                      <Typography level="body-xs">
                        {user?.email.length > 15
                          ? user?.email.slice(0, 15) + "..."
                          : user?.email}
                      </Typography>
                    </Stack>
                  </Tooltip>
                  <Tooltip title="Logout">
                    <IconButton
                      onClick={() => setLogoutModal(true)}
                      color="danger"
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              )
            ) : (
              <Button onClick={() => navigateTo("/auth/login")}>Sign in</Button>
            )}
          </List>
          <br />
          <Divider />
          <List
            size="lg"
            component="nav"
            sx={{
              flex: "none",
              fontSize: "xl",
              "& > div": { justifyContent: "center" },
            }}
          >
            <ListItemButton
              onClick={() => navigateTo("/")}
              sx={{ fontWeight: "lg" }}
            >
              Home
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/about")}>
              About
            </ListItemButton>
            <ListItemButton onClick={() => navigateTo("/contact")}>
              Contact
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};
export default Navbar;
