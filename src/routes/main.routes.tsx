import NotFound from "../components/utils/NotFound";
import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Discover from "../pages/Discover";
import Movie from "../pages/movie/Movie";
import Search from "../pages/search/Search";
import TVSeries from "../pages/tv/TVSeries";
import Settings from "../pages/user";
import Watch from "../pages/video/Watch";
import Watchlist from "../pages/Watchlist";

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
    path: "/tv/:tvId",
    element: <TVSeries />,
  },
  {
    path: "/search/:query",
    element: <Search />,
  },
  {
    path: "/search/:query/:page",
    element: <Search />,
  },
  {
    path: "/:movieType/:movieId/:seasonId?/:episodeId?/watch/:startAt?",
    element: <Watch />,
  },
  {
    path: "/auth/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/discover/:type?/:page?",
    element: <Discover />,
  },
  {
    path: "/watchlist",
    element: <Watchlist/>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
