"use client";
import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Settings from "./Settings";
import Devices from "./Devices";
import PrivacySettings from "./PrivacySettings";
import NotificationSettings from "./NotificationSettings";
import PageHeader from "../../components/ui/PageHeader";
import { Shimmer } from "../../components/ui/Skeleton";

const tabPaths = [
  "/user/settings",
  "/user/notifications",
  "/user/devices",
  "/user/privacy",
];

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
  const activeTab = Math.max(0, tabPaths.indexOf(location.pathname));

  useEffect(() => {
    if (myselfData) {
      setUserValue(myselfData?.data as User);
    }
    if (authResolved && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authResolved, isAuthenticated, myselfData, navigate]);

  const isLoading = !authResolved || myselfData?.isLoading;

  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        updateMyself(userValue);
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: "calc(var(--sm-nav-height) + 48px)",
          pb: 8,
        }}
      >
        <PageHeader
          title="Settings"
          description="Manage your account, notifications, devices and privacy."
          divider={false}
        />

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Shimmer height={40} />
            <Shimmer height={220} radius={12} />
            <Shimmer height={180} radius={12} />
          </Box>
        ) : (
          <Tabs
            value={activeTab === -1 ? initialTab : activeTab}
            onChange={(_, value) => navigate(tabPaths[(value as number) || 0])}
            sx={{ background: "transparent" }}
          >
            <TabList>
              <Tab>Account</Tab>
              <Tab>Notifications</Tab>
              <Tab>Devices</Tab>
              <Tab>Privacy</Tab>
            </TabList>
            <TabPanel value={0} sx={{ px: 0, pt: 4 }}>
              <Settings
                updateMyself={updateMyself}
                myselfData={myselfData}
                setUserValue={setUserValue}
                userValue={userValue}
                updatedMyselfData={updatedMyselfData}
              />
            </TabPanel>
            <TabPanel value={1} sx={{ px: 0, pt: 4 }}>
              <NotificationSettings userValue={userValue} setUserValue={setUserValue} />
            </TabPanel>
            <TabPanel value={2} sx={{ px: 0, pt: 4 }}>
              <Devices myselfData={myselfData} />
            </TabPanel>
            <TabPanel value={3} sx={{ px: 0, pt: 4 }}>
              <PrivacySettings
                userValue={userValue}
                setUserValue={setUserValue}
                updateMyself={updateMyself}
                updatedMyselfData={updatedMyselfData}
              />
            </TabPanel>
          </Tabs>
        )}
      </Box>
    </form>
  );
};

export default SettingsMain;
