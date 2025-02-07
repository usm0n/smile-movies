import NotFound from "../components/utils/NotFound";
import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Movie from "../pages/movie/Movie";
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
  {
    path: "/movie/:movieId",
    element: <Movie />,
  },
  {
    path: "*",
    element: <NotFound/>
  }
];
