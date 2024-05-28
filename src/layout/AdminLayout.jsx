import React from "react";
import AdminMenu from "../components/Admin/Menu/index";
import { AdminRoutes } from "../helpers/admin.routes";
import { Route, Routes } from "react-router-dom";
import { useUser } from "../contexts/User";
import NotFound from "../pages/error/NotFound";
import { backdropLoading } from "../utilities/defaultFunctions";

function AdminLayout() {
  const { isAdmin, user } = useUser();

  return !isAdmin.loading ? (
    <>
      {!isAdmin.result ? (
        <NotFound />
      ) : (
        <>
          <AdminMenu user={user} />
          <Routes>
            {AdminRoutes.map((item) => {
              return (
                <Route
                  path={item.path}
                  element={item.element}
                  key={item.path}
                />
              );
            })}
          </Routes>
        </>
      )}
    </>
  ) : (
    backdropLoading(open)
  );
}

export default AdminLayout;
