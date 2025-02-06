import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Settings from "../pages/user/Settings";

export const mainRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
  {
    path: "/user/settings",
    element: <Settings />,
  },
];
