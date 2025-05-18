"use client";
import { Box, Tab, TabList, TabPanel, Tabs, useColorScheme } from "@mui/joy";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useEffect, useState } from "react";
import { backdropLoading, isLoggedIn } from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings";
import Devices from "./Devices";
import PrivacySettings from "./PrivacySettings";

const SettingsMain = () => {
  const { myselfData, updateMyself, updatedMyselfData } = useUsers();
  const [userValue, setUserValue] = useState<User>(myselfData?.data as User);

  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (myselfData) {
      setUserValue(myselfData?.data as User);
    }
    if (!isLoggedIn) {
      navigate("/auth/login");
    }
  }, [myselfData]);
  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        updateMyself(userValue);
      }}
    >
      {backdropLoading(myselfData?.isLoading, colorScheme)}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Tabs
          sx={{
            background: "transparent",
            width: "90%",
          }}
        >
          <TabList>
            <Tab>Settings</Tab>
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
            <Devices myselfData={myselfData} />
          </TabPanel>
          <TabPanel value={2}>
            <PrivacySettings userValue={userValue} />
          </TabPanel>
        </Tabs>
      </Box>
    </form>
  );
};

export default SettingsMain;
