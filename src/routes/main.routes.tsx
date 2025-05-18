import NotFound from "../components/utils/NotFound";
import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Movie from "../pages/movie/Movie";
import Search from "../pages/search/Search";
import TVSeries from "../pages/tv/TVSeries";
import Settings from "../pages/user";
import Watch from "../pages/video/Watch";

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
  // {
  //   path: "/:movieType/:movieId/watch",
  //   element: <Watch/>
  // },
  {
    path: "/:movieType/:movieId/:seasonId?/:episodeId?/watch",
    element: <Watch/>
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
