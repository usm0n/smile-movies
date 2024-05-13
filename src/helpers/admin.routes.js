import AddIcon from "@mui/icons-material/Add";
import AddMovie from "../pages/admin/movie/AddMovie";
import HomeIcon from "@mui/icons-material/Home";
import index from "../pages/admin";
import EditIcon from "@mui/icons-material/Edit";
import EditMovie from "../pages/admin/movie/EditMovie";

export const AdminRoutes = [
  {
    title: "Main",
    icon: HomeIcon,
    path: "",
    element: index,
  },
  {
    title: "Add Movie",
    icon: AddIcon,
    path: "add-movie",
    element: AddMovie,
  },
  {
    title: "Edit Movie",
    icon: EditIcon,
    path: "edit-movie",
    element: EditMovie,
  },
];
