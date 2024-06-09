import Movie from "../pages/Movie";
import HomeLayout from "../layout/HomeLayout";
import Favourites from "../pages/utils/Favourites";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import WatchLater from "../pages/utils/WatchLater";
import Search from "../pages/Search";
import AboutLayout from "../layout/AboutLayout";
import ContactLayout from "../layout/ContactLayout";
import AdminLayout from "../layout/AdminLayout";
import Premium from "../pages/components/premium/Premium";
import NotFound from "../pages/error/NotFound";
import Settings from "../pages/user/Settings";
import AllMovies from "../pages/movies/AllMovies";

export const routes = [
  {
    path: "/",
    element: <HomeLayout />,
  },

  {
    path: "/uz",
    element: <HomeLayout />,
  },

  {
    path: "/ru",
    element: <HomeLayout />,
  },

  {
    path: "/en",
    element: <HomeLayout />,
  },

  {
    path: "/favourites",
    element: <Favourites />,
  },

  {
    path: "*",
    element: <NotFound />,
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
    element: <Search backTo={"/"} linkTo={`/movie`} />,
  },

  {
    path: "/search/:value/:page",
    element: <Search backTo={"/"} linkTo={`/movie`} />,
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
    element: <Premium />,
  },

  {
    path: "/settings",
    element: <Settings />,
  },

  {
    path: "/movies",
    element: <AllMovies MovieType={"movie"} MoviesType={"movies"} />,
  },

  {
    path: "/series",
    element: <AllMovies MovieType={"series"} MoviesType={"series"} />,
  },

  {
    path: "/cartoons",
    element: <AllMovies MovieType={"cartoon"} MoviesType={"cartoons"} />,
  },

  {
    path: "/movies/:page",
    element: <AllMovies MovieType={"movie"} MoviesType={"movies"} />,
  },

  {
    path: "/series/:page",
    element: <AllMovies MovieType={"series"} MoviesType={"series"} />,
  },

  {
    path: "/cartoons/:page",
    element: <AllMovies MovieType={"cartoon"} MoviesType={"cartoons"} />,
  },
];
