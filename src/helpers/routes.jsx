import Movie from "../pages/Movie";
import HomeLayout from "../layout/HomeLayout";
import Favourites from "../pages/utils/Favourites";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import WatchLater from "../pages/utils/WatchLater";
import Admin from "../pages/admin/Admin";
import Search from "../pages/Search";
import AboutLayout from "../layout/AboutLayout";
export const routes = [
  {
    path: "/",
    element: <HomeLayout />,
  },

  {
    path: "/favourites",
    element: <Favourites />,
  },

  {
    path: "/watch-later",
    element: <WatchLater />,
  },

  {
    path: "/:movieId",
    element: <Movie />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/admin",
    element: <Admin />,
  },

  {
    path: "/search/:value",
    element: <Search />,
  },

  {
    path: "/about",
    element: <AboutLayout />,
  },
];
