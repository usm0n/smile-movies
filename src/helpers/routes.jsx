import AboutLayout from "../layout/AboutLayout";
import HomeLayout from "../layout/HomeLayout";
export const routes = [
  {
    path: "/",
    element: <HomeLayout />,
  },

  {
    path: "/about",
    element: <AboutLayout />,
  }

];
