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
import EditMovie from "../pages/admin/movie/EditMovie";
import SearchEditMovie from "../pages/Search/EditMovie";
import Premium from '../pages/components/Premium'
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
    path: "/admin/edit-movie/:movieId",
    element: <EditMovie />,
  },

  {
    path: "/admin/edit-movie/search/:value",
    element: <SearchEditMovie />,
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
    element: <ContactLayout />,
  },

  {
    path: "/premium",
    element: <Premium/>
  }
];
