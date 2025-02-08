import NotFound from "../components/utils/NotFound";
import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Movie from "../pages/movie/Movie";
import TVEpisode from "../pages/tv/TVEpisode";
import TVSeasons from "../pages/tv/TVSeasons";
import TVSeries from "../pages/tv/TVSeries";
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
    path: "/tv/:tvId",
    element: <TVSeries />,
  },
  {
    path: "/tv/:tvId/season/:seasonNumber",
    element: <TVSeasons />,
  },
  {
    path: "/tv/:tvId/season/:seasonNumber/episode/:episodeNumber",
    element: <TVEpisode />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
