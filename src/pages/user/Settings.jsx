import React from "react";
import { useUser } from "../../contexts/User";
import SettingsComp from "../../components/users/Settings";
import { backdropLoading } from "../../utilities/defaultFunctions";

function Settings() {
  const { user, isRealUser } = useUser();

  return !isRealUser.loading ? (
    <SettingsComp
      user={user}
    />
  ) : (
    backdropLoading(open)
  );
}

export default Settings;
