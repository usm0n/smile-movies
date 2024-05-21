import React, { useEffect } from "react";
import AdminMenu from "../components/Admin/Menu/index";
import { AdminRoutes } from "../helpers/admin.routes";
import { Route, Routes, useNavigate } from "react-router-dom";
import { routes } from "../helpers/routes";
import { useUser } from "../contexts/User";
import { Backdrop, CircularProgress } from "@mui/material";
import NotFound from "../pages/error/NotFound";

function AdminLayout() {
  const { isAdmin, user } = useUser();

  return !isAdmin.loading ? (
    <>
      {!isAdmin.result ? (
        <NotFound />
      ) : (
        <>
          {" "}
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
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default AdminLayout;
