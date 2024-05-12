import Movie from "../pages/Movie";
import HomeLayout from "../layout/HomeLayout";
import Favourites from "../pages/utils/Favourites";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import WatchLater from "../pages/utils/WatchLater";
import Search from "../pages/Search";
import AboutLayout from "../layout/AboutLayout";
import Contact from "../pages/components/contact/Contact";
import ContactLayout from "../layout/ContactLayout";
import AdminLayout from "../layout/AdminLayout";
import AddMovie from "../pages/admin/AddMovie";
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
    path: "/movie/:movieId",
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
    path: "/admin/*",
    element: <AdminLayout />,
  },

  {
    path: "/search/:value",
    element: <Search />,
  },

  {
    path: "/about",
    element: <AboutLayout />,
  },

  {
    path: "/contact",
    element: <ContactLayout/>
  }
];
