import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export const mainRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  }
];
