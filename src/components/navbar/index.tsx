"use client";

import {
  AutoAwesome,
  Logout,
  Search,
  WarningRounded,
  Lock,
  LockOpen,
  SwitchAccount,
  PersonAdd,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Bookmark,
  Layers,
  Download,
  Compass,
  Home as HomeIcon,
  AdminPanelSettingsRounded,
  Person as PersonIcon,
  PhoneIphone,
  type IconProps,
} from "../ui/icons";
import highLogo from "../../assets/images/logo-1000.png";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Dropdown,
  List,
  ListItemButton,
  ListItemContent,
  Menu,
  MenuButton,
  MenuItem,
  ModalClose,
  Skeleton,
  Stack,
  Typography,
} from "@mui/joy";
import React, { useEffect, useMemo, useState, type ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { googleLogout } from "@react-oauth/google";
import { useTMDB } from "../../context/TMDB";
import { images, movieDetails, tvDetails } from "../../tmdb-res";
import PinLockModal from "../../components/account/PinLockModal";
import { savedAccountsManager, SavedAccount } from "../../utilities/savedAccounts";
import { pinLockStore, DEVICE_ID_KEY } from "../../utilities/pinLockStore";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Dialog from "../ui/Dialog";

const DETAIL_PAGE_REGEX = /^\/(movie|tv)\/([^/]+)$/;

// "/" and "/browse" render the same page, so only one of them is presented as a
// destination — /browse stays routable for old links and bookmarks.
type NavLink = { label: string; to: string; exact?: boolean };

const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/", exact: true },
  { label: "Discover", to: "/discover" },
  { label: "SmileAI", to: "/ai" },
];

// Library destinations used to live only inside the avatar menu. They are the
// primary return destinations, so signed-in users get them in the nav itself.
const LIBRARY_NAV_LINKS: NavLink[] = [
  { label: "Watchlist", to: "/watchlist" },
  { label: "My Lists", to: "/collections" },
];

const DRAWER_SECTIONS: {
  title?: string;
  links: (NavLink & { icon: ComponentType<IconProps> })[];
}[] = [
  {
    links: [
      { label: "Home", to: "/", icon: HomeIcon, exact: true },
      { label: "Discover", to: "/discover", icon: Compass },
      { label: "SmileAI", to: "/ai", icon: AutoAwesome },
    ],
  },
  {
    title: "Library",
    links: [
      { label: "Watchlist", to: "/watchlist", icon: Bookmark },
      { label: "My Lists", to: "/collections", icon: Layers },
      { label: "Downloads", to: "/downloads", icon: Download },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Settings", to: "/user/settings", icon: SettingsIcon },
      { label: "Get the app", to: "/download", icon: PhoneIphone },
    ],
  },
];

const isRouteActive = (pathname: string, to: string, exact?: boolean) =>
  exact || to === "/"
    ? pathname === to || (to === "/" && pathname === "/browse")
    : pathname === to || pathname.startsWith(`${to}/`);

const getPreferredLogoPath = (imageData?: images | null) =>
  imageData?.logos?.find((logo) => logo.iso_639_1 === "en")?.file_path ||
  imageData?.logos?.find((logo) => !logo.iso_639_1)?.file_path ||
  imageData?.logos?.[0]?.file_path ||
  null;

const openCommandMenu = () => window.dispatchEvent(new Event("smile:command"));

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

const Navbar: React.FC = () => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"setup" | "verify" | "change" | null>(
    null,
  );
  // Initialize from persisted store so lock survives page refresh
  const [isLocked, setIsLocked] = useState(false);
  const [showSwitchAccounts, setShowSwitchAccounts] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const { myselfData, logout, logoutData, isAuthenticated, authResolved } = useUsers();
  const { movieDetailsData, movieImagesData, tvSeriesDetailsData, tvImagesData } =
    useTMDB();
  const navigate = useNavigate();
  const location = useLocation();
  const user = myselfData?.data as User;

  // Enforce persisted lock state on mount and when user/device data loads
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const currentDeviceId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(DEVICE_ID_KEY) || ""
        : "";
    const currentDevice = user.devices?.find((d: any) => d.deviceId === currentDeviceId);
    const requirePassword = currentDevice?.requirePassword || "never";
    if (user.accountPin?.enabled && pinLockStore.isLocked(requirePassword)) {
      setIsLocked(true);
    }

    // When user leaves the tab/app, record the lock timestamp so timer works on return
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        user.accountPin?.enabled &&
        requirePassword !== "never"
      ) {
        pinLockStore.lock();
      }
      if (document.visibilityState === "visible" && user.accountPin?.enabled) {
        if (pinLockStore.isLocked(requirePassword)) {
          setIsLocked(true);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, user?.id]);

  const detailMatch = location.pathname.match(DETAIL_PAGE_REGEX);
  const detailType = detailMatch?.[1] as "movie" | "tv" | undefined;
  const detailId = detailMatch?.[2];
  const isDetailPage = Boolean(detailMatch);

  const detailData = useMemo(() => {
    if (!detailType || !detailId) {
      return { title: "", logoPath: null as string | null, isLoading: false };
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

  const navLinks = useMemo(
    () => (isAuthenticated ? [...NAV_LINKS, ...LIBRARY_NAV_LINKS] : NAV_LINKS),
    [isAuthenticated],
  );

  // Watchlist / My Lists / SmileAI moved into the nav proper, so this menu is
  // only account-scoped destinations now.
  const menuLinks = [
    { label: "Downloads", to: "/downloads", icon: Download },
    { label: "Settings", to: "/user/settings", icon: SettingsIcon },
  ];

  const renderAuthControls = () => {
    if (!authResolved) {
      return <Skeleton variant="circular" width={32} height={32} />;
    }

    if (!isAuthenticated) {
      return (
        <Button size="sm" onClick={() => navigate("/auth/login")}>
          Sign In
        </Button>
      );
    }

    return (
      <Dropdown>
        <MenuButton
          aria-label="Account menu"
          slotProps={{
            root: {
              sx: {
                p: 0,
                minHeight: 0,
                border: "none",
                borderRadius: "999px",
                background: "transparent",
                "&:hover": { background: "transparent", opacity: 0.85 },
              },
            },
          }}
        >
          <Avatar
            size="sm"
            src={user?.profilePic}
            sx={{ width: 32, height: 32, borderRadius: "999px" }}
          >
            {!user?.profilePic && (
              <>
                {user?.firstname?.slice(0, 1)}
                {user?.lastname?.slice(0, 1)}
              </>
            )}
          </Avatar>
        </MenuButton>
        <Menu placement="bottom-end" sx={{ minWidth: 248 }}>
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              cursor: "pointer",
              borderRadius: "4px",
              "&:hover": { backgroundColor: "background.level1" },
            }}
            onClick={() => navigate("/user/settings")}
          >
            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
              {user?.firstname} {user?.lastname}
            </Typography>
            <Typography
              level="body-xs"
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />

          {menuLinks.map((link) => (
            <MenuItem key={link.to} onClick={() => navigate(link.to)}>
              <link.icon sx={{ fontSize: 16 }} />
              <ListItemContent>{link.label}</ListItemContent>
            </MenuItem>
          ))}

          <Divider sx={{ my: 0.5 }} />

          {user?.accountPin?.enabled ? (
            <MenuItem
              onClick={() => {
                pinLockStore.lock();
                setIsLocked(true);
              }}
            >
              <Lock sx={{ fontSize: 16 }} />
              <ListItemContent>Lock account</ListItemContent>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => setPinModalMode("setup")}>
              <LockOpen sx={{ fontSize: 16 }} />
              <ListItemContent>Set up PIN lock</ListItemContent>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setSavedAccounts(savedAccountsManager.getAll());
              setShowSwitchAccounts(true);
            }}
          >
            <SwitchAccount sx={{ fontSize: 16 }} />
            <ListItemContent>Switch account</ListItemContent>
          </MenuItem>

          {!user?.isVerified && (
            <MenuItem
              onClick={() => navigate("/user/settings")}
              sx={{ color: "warning.plainColor" }}
            >
              <WarningRounded sx={{ fontSize: 16 }} />
              <ListItemContent>Verify your account</ListItemContent>
            </MenuItem>
          )}

          {(user?.handle || user?.isAdmin) && <Divider sx={{ my: 0.5 }} />}
          {user?.handle && (
            <MenuItem onClick={() => navigate(`/u/${user.handle}`)}>
              <PersonIcon sx={{ fontSize: 16 }} />
              <ListItemContent>Public profile</ListItemContent>
            </MenuItem>
          )}
          {user?.isAdmin && (
            <MenuItem onClick={() => navigate("/admin")}>
              <AdminPanelSettingsRounded sx={{ fontSize: 16 }} />
              <ListItemContent>Admin</ListItemContent>
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => setLogoutModal(true)}>
            <Logout sx={{ fontSize: 16 }} />
            <ListItemContent>Log out</ListItemContent>
          </MenuItem>
        </Menu>
      </Dropdown>
    );
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          height: "var(--sm-nav-height)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, md: 3 },
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px) saturate(180%)",
          borderBottom: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton
            label="Open menu"
            onClick={() => setDrawerOpen(true)}
            size="sm"
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: -0.5 }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box
            component="img"
            onClick={() => navigate("/")}
            src={highLogo}
            alt="Smile Movies"
            sx={{
              width: 92,
              cursor: "pointer",
              userSelect: "none",
              flexShrink: 0,
              transition: "opacity 150ms ease",
              ":hover": { opacity: 0.8 },
            }}
          />

          {isDetailPage && (
            <>
              <Typography
                aria-hidden
                sx={{
                  color: "neutral.600",
                  fontSize: 20,
                  lineHeight: 1,
                  mx: 0.25,
                  // Hidden at md, where the primary nav takes the space.
                  display: { xs: "block", md: "none", lg: "block" },
                }}
              >
                /
              </Typography>
              <Box
                sx={{
                  minWidth: 0,
                  display: { xs: "flex", md: "none", lg: "flex" },
                  alignItems: "center",
                  maxWidth: { xs: "34vw", sm: "42vw", lg: 220 },
                }}
              >
                {detailData.logoPath ? (
                  <Box
                    component="img"
                    src={`https://image.tmdb.org/t/p/original${detailData.logoPath}`}
                    alt={detailData.title || "Current title"}
                    sx={{
                      width: "100%",
                      maxWidth: 200,
                      maxHeight: 28,
                      objectFit: "contain",
                      objectPosition: "left center",
                    }}
                  />
                ) : detailData.title ? (
                  <Typography
                    level="title-sm"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {detailData.title}
                  </Typography>
                ) : detailData.isLoading ? (
                  <Box
                    className="sm-shimmer"
                    sx={{ width: 120, height: 16, borderRadius: "4px" }}
                  />
                ) : null}
              </Box>
            </>
          )}
        </Box>

        {/*
          Primary nav stays mounted on detail pages too — previously it was
          hidden there, leaving the logo as the only way out of /movie/:id.
        */}
        <Box
          component="nav"
          sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}
        >
          {navLinks.map((link) => {
            const active = isRouteActive(location.pathname, link.to, link.exact);
            return (
              <Box
                key={link.to}
                component="button"
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(link.to)}
                sx={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "body",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: "6px",
                  color: active ? "text.primary" : "text.secondary",
                  backgroundColor: active ? "background.level1" : "transparent",
                  transition: "color 150ms ease, background-color 150ms ease",
                  "&:hover": {
                    color: "text.primary",
                    backgroundColor: "background.level1",
                  },
                }}
              >
                {link.label}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Search is the ⌘K palette everywhere; this bar only triggers it. */}
        <Box
          component="button"
          type="button"
          onClick={openCommandMenu}
          aria-label="Search movies, shows and people"
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1,
            height: 32,
            width: { sm: 200, lg: 260 },
            px: 1.25,
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.surface",
            color: "text.tertiary",
            fontFamily: "body",
            fontSize: "0.8125rem",
            transition: "border-color 150ms ease, color 150ms ease",
            "&:hover": { borderColor: "#333", color: "text.secondary" },
          }}
        >
          <Search sx={{ fontSize: 15 }} />
          <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
            Search…
          </Box>
          <Box
            component="kbd"
            sx={{
              fontFamily: "code",
              fontSize: "0.6875rem",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              borderRadius: "4px",
              px: 0.5,
              lineHeight: 1.6,
            }}
          >
            {isMac ? "⌘K" : "Ctrl K"}
          </Box>
        </Box>

        <IconButton
          label="Search"
          onClick={openCommandMenu}
          size="sm"
          sx={{ display: { xs: "inline-flex", sm: "none" } }}
        >
          <Search sx={{ fontSize: 20 }} />
        </IconButton>

        {renderAuthControls()}
      </Box>

      <Dialog
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Log out"
        description="You'll need to sign in again to sync your watchlist and progress."
        width={420}
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              loading={logoutData?.isLoading}
              onClick={() => {
                logout();
                googleLogout();
              }}
            >
              Log out
            </Button>
          </>
        }
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="sm"
        slotProps={{ content: { sx: { width: 300 } } }}
      >
        <ModalClose />
        <Box sx={{ p: 2, pt: 7 }}>
          {!authResolved ? (
            <Box className="sm-shimmer" sx={{ height: 56, borderRadius: "8px" }} />
          ) : isAuthenticated ? (
            <Box
              onClick={() => navigateTo("/user/settings")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
                backgroundColor: "background.surface",
                cursor: "pointer",
              }}
            >
              <Avatar src={user?.profilePic} sx={{ borderRadius: "999px" }}>
                {!user?.profilePic && (
                  <>
                    {user?.firstname?.slice(0, 1)}
                    {user?.lastname?.slice(0, 1)}
                  </>
                )}
              </Avatar>
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography level="title-sm">
                  {user?.firstname} {user?.lastname}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {user?.email}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Button fullWidth onClick={() => navigateTo("/auth/login")}>
              Sign In
            </Button>
          )}

          {/*
            Grouped by intent: browse the catalogue, then your own library.
            "Browse" is gone as a separate entry (it renders the same page as
            Home), and the icons no longer collide — "Downloads" (offline
            titles) and "Get the app" previously shared the download icon.
          */}
          {DRAWER_SECTIONS.map((section, sectionIndex) => (
            <Box key={section.title ?? sectionIndex}>
              {section.title && (
                <Typography
                  level="body-xs"
                  sx={{
                    mt: sectionIndex === 0 ? 2 : 1.5,
                    px: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                    color: "text.tertiary",
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List
                sx={{
                  mt: section.title ? 0.5 : 2,
                  "--ListItem-paddingY": "10px",
                  "--ListItem-radius": "8px",
                }}
              >
                {section.links.map((link) => {
                  const active = isRouteActive(location.pathname, link.to, link.exact);
                  return (
                    <ListItemButton
                      key={`${link.label}-${link.to}`}
                      selected={active}
                      aria-current={active ? "page" : undefined}
                      onClick={() => navigateTo(link.to)}
                      sx={{
                        gap: 1.5,
                        fontSize: "0.9375rem",
                        fontWeight: active ? 600 : 400,
                        color: active ? "text.primary" : "text.secondary",
                      }}
                    >
                      <link.icon
                        sx={{
                          fontSize: 17,
                          color: active ? "text.primary" : "text.tertiary",
                        }}
                      />
                      {link.label}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          ))}

          {isAuthenticated && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Button
                fullWidth
                variant="outlined"
                color="danger"
                startDecorator={<Logout sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setDrawerOpen(false);
                  setLogoutModal(true);
                }}
              >
                Log out
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog
        open={showSwitchAccounts}
        onClose={() => setShowSwitchAccounts(false)}
        title="Switch account"
        description="Pick a saved account to sign in with."
        width={400}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {savedAccounts
            .filter((account) => account.id !== (user as any)?.id)
            .map((account) => (
              <Box
                key={account.id}
                onClick={() => {
                  setShowSwitchAccounts(false);
                  navigate(`/auth/login?hint=${encodeURIComponent(account.email)}`);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                  "&:hover": { backgroundColor: "background.level1" },
                }}
              >
                <Avatar
                  src={account.profilePic}
                  sx={{ width: 36, height: 36, borderRadius: "999px" }}
                >
                  {!account.profilePic && (
                    <>
                      {account.firstname?.slice(0, 1)}
                      {account.lastname?.slice(0, 1)}
                    </>
                  )}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography level="title-sm">
                    {account.firstname} {account.lastname}
                  </Typography>
                  <Typography level="body-xs">{account.email}</Typography>
                </Box>
              </Box>
            ))}
          {savedAccounts.filter((account) => account.id !== (user as any)?.id).length ===
            0 && (
            <Typography level="body-sm" sx={{ textAlign: "center", py: 2 }}>
              No other saved accounts.
            </Typography>
          )}
          <Button
            fullWidth
            startDecorator={<PersonAdd sx={{ fontSize: 16 }} />}
            variant="outlined"
            color="neutral"
            sx={{ mt: 0.5 }}
            onClick={() => {
              setShowSwitchAccounts(false);
              navigate("/auth/login");
            }}
          >
            Add account
          </Button>
        </Box>
      </Dialog>

      {pinModalMode && (
        <PinLockModal
          open
          mode={pinModalMode}
          onSuccess={() => {
            setPinModalMode(null);
            if (pinModalMode === "verify") {
              pinLockStore.unlock();
              setIsLocked(false);
            }
          }}
          onCancel={() => setPinModalMode(null)}
        />
      )}

      {isLocked && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Avatar
            src={user?.profilePic}
            sx={{ width: 64, height: 64, fontSize: 22, borderRadius: "999px" }}
          >
            {!user?.profilePic && (
              <>
                {user?.firstname?.slice(0, 1)}
                {user?.lastname?.slice(0, 1)}
              </>
            )}
          </Avatar>
          <Typography level="h3">
            {user?.firstname} {user?.lastname}
          </Typography>
          <Typography level="body-sm">Account locked</Typography>
          <Button
            startDecorator={<LockOpen sx={{ fontSize: 16 }} />}
            size="lg"
            onClick={() => setPinModalMode("verify")}
            sx={{ mt: 1 }}
          >
            Unlock
          </Button>
        </Box>
      )}
    </>
  );
};

export default Navbar;
