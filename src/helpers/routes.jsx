import Movie from "../components/Movie";
import HomeLayout from "../layout/HomeLayout";
import Favourites from "../pages/Favourites";
import Login from "../pages/Login";
import Register from "../pages/Register";
import WatchLater from "../pages/WatchLater";
export const routes = [
  {
    path: "/",
    element: <HomeLayout />,
  },

  {
    path: "/favourites",
    element: <Favourites/>,
  },

  {
    path: "/watch-later",
    element: <WatchLater/>,
  },

  {
    path: "/movie",
    element: <Movie/>
  },

  {
    path: "/login",
    element: <Login/>
  },

  {
    path: "/register",
    element: <Register/>
  }

];
