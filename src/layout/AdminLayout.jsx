import React, { useEffect } from "react";
import AdminMenu from "../components/AdminMenu";
import Admin from "../pages/admin/AddMovie";
import { AdminRoutes } from "../helpers/admin.routes";
import { Route, Routes, useNavigate } from "react-router-dom";
import { routes } from "../helpers/routes";
import AddMovie from "../pages/admin/AddMovie";
import { useUser } from "../contexts/User";
import { Backdrop, CircularProgress } from "@mui/material";

function AdminLayout() {
  const { isAdmin } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin.result) {
      navigate("/");
    }
  }, []);
  return !isAdmin.loading ? (
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
  ) : (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default AdminLayout;
