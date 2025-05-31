import {
  Home,
  HomeOutlined,
  Login,
  Search,
  WatchLaterOutlined,
} from "@mui/icons-material";
import { Avatar, Badge, ButtonGroup, IconButton } from "@mui/joy";
import { useUsers } from "../../context/Users";
import { isLoggedIn } from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";
import { User } from "../../user";

function Navigation() {
  const { myselfData } = useUsers();
  const navigate = useNavigate();

  return (
    <ButtonGroup
      variant="plain"
      sx={{
        height: "3rem",
        position: "fixed",
        bottom: "-1px",
        left: 0,
        right: 0,
        zIndex: 1000,
        width: "100vw",
        display: "flex",
        background: "black",
        borderTop: "0.1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: 0,
        "& > *": { flex: 1 },
        "@media (min-width: 700px)": {
          display: "none",
        }
      }}
    >
      <IconButton onClick={() => navigate("/")}>
        {window.location.pathname == "/" ? <Home /> : <HomeOutlined />}
      </IconButton>
      <IconButton>
        <Search />
      </IconButton>
      <IconButton>
        <Badge
          badgeContent={(myselfData?.data as User)?.watchlist?.length || 0}
        >
          <WatchLaterOutlined />
        </Badge>
      </IconButton>
      {isLoggedIn ? (
        <IconButton>
          <Avatar>
            {myselfData?.isLoading ? null : (myselfData?.data as User)
                ?.profilePic ? (
              <img
                src={(myselfData?.data as User)?.profilePic}
                alt="Profile"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              (myselfData?.data as User)?.firstname.charAt(0).toUpperCase() +
              (myselfData?.data as User)?.lastname!.charAt(0).toUpperCase()
            )}
          </Avatar>
        </IconButton>
      ) : (
        <IconButton onClick={() => navigate("/auth/login")}>
          <Login />
        </IconButton>
      )}
    </ButtonGroup>
  );
}

export default Navigation;
