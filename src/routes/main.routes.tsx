import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";

export const mainRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
  },
  {
    path: "/login",
    element: <Login />,
  }
];
