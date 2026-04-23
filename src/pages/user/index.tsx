"use client";
import { Box, Tab, TabList, TabPanel, Tabs, useColorScheme } from "@mui/joy";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useEffect, useState } from "react";
import { backdropLoading } from "../../utilities/defaults";
import { useLocation, useNavigate } from "react-router-dom";
import Settings from "./Settings";
import Devices from "./Devices";
import PrivacySettings from "./PrivacySettings";
import NotificationSettings from "./NotificationSettings";

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

  const { colorScheme } = useColorScheme();
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
  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        updateMyself(userValue);
      }}
    >
      {backdropLoading(!authResolved || myselfData?.isLoading, colorScheme)}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "100px",
          width: "100%",
        }}
      >
        <Tabs
          value={activeTab === -1 ? initialTab : activeTab}
          onChange={(_, value) => navigate(tabPaths[(value as number) || 0])}
          sx={{
            background: "transparent",
            width: "90%",
          }}
        >
          <TabList>
            <Tab>Account</Tab>
            <Tab>Notifications</Tab>
            <Tab>Devices</Tab>
            <Tab>Privacy Settings</Tab>
          </TabList>
          <TabPanel value={0}>
            <Settings
              updateMyself={updateMyself}
              myselfData={myselfData}
              setUserValue={setUserValue}
              userValue={userValue}
              updatedMyselfData={updatedMyselfData}
            />
          </TabPanel>
          <TabPanel value={1}>
            <NotificationSettings
              userValue={userValue}
              setUserValue={setUserValue}
            />
          </TabPanel>
          <TabPanel value={2}>
            <Devices myselfData={myselfData} />
          </TabPanel>
          <TabPanel value={3}>
            <PrivacySettings
              userValue={userValue}
              setUserValue={setUserValue}
              updateMyself={updateMyself}
              updatedMyselfData={updatedMyselfData}
            />
          </TabPanel>
        </Tabs>
      </Box>
    </form>
  );
};

export default SettingsMain;
