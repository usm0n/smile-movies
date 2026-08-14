"use client";
import { Box, Typography } from "@mui/joy";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Settings from "./Settings";
import Connections from "./Connections";
import Devices from "./Devices";
import PrivacySettings from "./PrivacySettings";
import NotificationSettings from "./NotificationSettings";
import PageHeader from "../../components/ui/PageHeader";
import { Shimmer } from "../../components/ui/Skeleton";
import {
  DevicesOther,
  KeyRounded,
  Notifications,
  Person,
  ShieldRounded,
} from "../../components/ui/icons";

/**
 * Settings shell.
 *
 * Vercel's account settings put navigation in a left rail beside the panels
 * rather than in a tab strip above them, which is what lets each section grow
 * without the nav getting crowded. On narrow screens the rail collapses into a
 * horizontally scrolling strip.
 */

const SECTIONS = [
  {
    path: "/user/settings",
    label: "Account",
    icon: Person,
    description: "Your profile, avatar and public page.",
  },
  {
    path: "/user/connections",
    label: "Login connections",
    icon: KeyRounded,
    description: "Google, Apple, phone, emails and password.",
  },
  {
    path: "/user/notifications",
    label: "Notifications",
    icon: Notifications,
    description: "What we email you and how often.",
  },
  {
    path: "/user/devices",
    label: "Devices",
    icon: DevicesOther,
    description: "Approve, lock and remove your devices.",
  },
  {
    path: "/user/privacy",
    label: "Privacy",
    icon: ShieldRounded,
    description: "What your public profile reveals.",
  },
] as const;

const SettingsMain = ({ initialTab = 0 }: { initialTab?: number }) => {
  const {
    myselfData,
    updateMyself,
    updatedMyselfData,
    isAuthenticated,
    authResolved,
  } = useUsers();
  const [userValue, setUserValue] = useState<User>(myselfData?.data as User);

  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = useMemo(() => {
    const index = SECTIONS.findIndex(
      (section) => section.path === location.pathname,
    );
    return index === -1 ? initialTab : index;
  }, [initialTab, location.pathname]);

  useEffect(() => {
    if (myselfData) {
      setUserValue(myselfData?.data as User);
    }
    if (authResolved && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authResolved, isAuthenticated, myselfData, navigate]);

  const isLoading = !authResolved || myselfData?.isLoading;
  const active = SECTIONS[activeIndex] || SECTIONS[0];

  const renderSection = () => {
    switch (active.path) {
      case "/user/connections":
        return <Connections />;
      case "/user/notifications":
        return (
          <NotificationSettings userValue={userValue} setUserValue={setUserValue} />
        );
      case "/user/devices":
        return <Devices myselfData={myselfData} />;
      case "/user/privacy":
        return (
          <PrivacySettings
            userValue={userValue}
            setUserValue={setUserValue}
            updateMyself={updateMyself}
            updatedMyselfData={updatedMyselfData}
          />
        );
      default:
        return (
          <Settings
            updateMyself={updateMyself}
            myselfData={myselfData}
            setUserValue={setUserValue}
            userValue={userValue}
            updatedMyselfData={updatedMyselfData}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1080,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        pt: "calc(var(--sm-nav-height) + 48px)",
        pb: 8,
      }}
    >
      <PageHeader
        title="Settings"
        description="Manage your account, sign-in methods, notifications, devices and privacy."
        divider={false}
      />

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Shimmer height={40} />
          <Shimmer height={220} radius={12} />
          <Shimmer height={180} radius={12} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, md: 5 },
            gridTemplateColumns: { xs: "1fr", md: "216px minmax(0, 1fr)" },
            alignItems: "start",
          }}
        >
          <Box
            component="nav"
            aria-label="Settings sections"
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 0.5,
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 1, md: 0 },
              position: { md: "sticky" },
              top: { md: "calc(var(--sm-nav-height) + 24px)" },
              // Hide the scrollbar on the mobile strip; the overflow is
              // obvious from the clipped last item.
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.path === active.path;
              return (
                <Box
                  key={section.path}
                  component="button"
                  type="button"
                  onClick={() => navigate(section.path)}
                  aria-current={isActive ? "page" : undefined}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 1,
                    whiteSpace: "nowrap",
                    borderRadius: "md",
                    border: "1px solid",
                    borderColor: isActive ? "neutral.outlinedBorder" : "transparent",
                    backgroundColor: isActive ? "background.level1" : "transparent",
                    color: isActive ? "text.primary" : "text.secondary",
                    font: "inherit",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 120ms, color 120ms",
                    "&:hover": {
                      backgroundColor: "background.level1",
                      color: "text.primary",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                  {section.label}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ mb: 3, display: { xs: "none", md: "block" } }}>
              <Typography level="title-lg" sx={{ fontWeight: 600 }}>
                {active.label}
              </Typography>
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                {active.description}
              </Typography>
            </Box>
            {renderSection()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SettingsMain;
