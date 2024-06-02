import React from "react";
import { useUser } from "../../contexts/User";
import SettingsComp from "../../components/users/Settings";
import { backdropLoading } from "../../utilities/defaultFunctions";

function Settings() {
  const { user, isRealUser, updateUserById, statusUpdateUserById } = useUser();

  return !isRealUser.loading ? (
    <SettingsComp
      user={user}
      updateUserById={updateUserById}
      statusUpdateUserById={statusUpdateUserById}
    />
  ) : (
    backdropLoading(open)
  );
}

export default Settings;
