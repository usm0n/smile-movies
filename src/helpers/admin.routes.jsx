import AddIcon from "@mui/icons-material/Add";
import AddMovie from "../pages/admin/movie/AddMovie";
import HomeIcon from "@mui/icons-material/Home";
import Index from "../pages/admin";
import EditIcon from "@mui/icons-material/Edit";
import EditMovie from "../pages/admin/movie/EditMovie";
import SearchEditMovie from "../pages/Search/index";
import DeleteMovie from "../pages/admin/movie/DeleteMovie";
import SearchDeleteMovie from "../pages/Search/index";
import DeleteMovieComp from "../components/Admin/main/DeleteMovie";

export const AdminRoutes = [
  {
    title: "Main",
    icon: <HomeIcon />,
    path: "",
    element: <Index />,
  },
  {
    title: "Add Movie",
    icon: <AddIcon />,
    path: "add-movie",
    element: <AddMovie />,
  },
  {
    title: "Edit Movie",
    icon: <EditIcon />,
    path: "edit-movie",
    element: <EditMovie />,
  },
  {
    title: "Edit Movie",
    icon: <EditIcon />,
    path: "edit-movie/:movieId",
    element: <EditMovie />,
  },
  {
    title: "Search Edit Movie",
    path: "edit-movie/search/:value",
    element: <SearchEditMovie backTo={"/admin/edit-movie"} linkTo={"/admin/edit-movie"}/>,
  },
  {
    title: "Delete Movie",
    path: "delete-movie",
    element: <DeleteMovie />,
  },
  {
    title: "Delete Movie",
    path: "delete-movie/:movieId",
    element: <DeleteMovieComp />,
  },
  {
    title: "Search Delete Movie",
    path: "delete-movie/search/:value",
    element: <SearchDeleteMovie backTo={"/admin/delete-movie"} linkTo={"/admin/delete-movie"}/>,
  },
];
