import React from "react";
import { useUser } from "../../contexts/User";
import SettingsComp from "../../components/users/Settings/Settings";
import NotFound from "../error/NotFound";
import SettingsSkeleton from "../../components/users/Settings/SettingsSkeleton";

function Settings() {
  const { user, isRealUser, isLoggedIn } = useUser();

  return isLoggedIn ? (
    !isRealUser.loading ? (
      <SettingsComp user={user} />
    ) : (
      <SettingsSkeleton />
    )
  ) : (
    <NotFound />
  );
}

export default Settings;
