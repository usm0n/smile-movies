import React from "react";
import AdminMenu from "../components/AdminMenu";
import Admin from "../pages/admin/AddMovie";
import { AdminRoutes } from "../helpers/admin.routes";
import { Route, Routes } from "react-router-dom";
import { routes } from "../helpers/routes";
import AddMovie from "../pages/admin/AddMovie";

function AdminLayout() {
  return (
    <>
      <AdminMenu />
      <Routes>
        {AdminRoutes.map((item) => {
          return (
            <Route
              path={item.path}
              element={<item.element />}
              key={item.path}
            />
          );
        })}
      </Routes>
    </>
  );
}

export default AdminLayout;
