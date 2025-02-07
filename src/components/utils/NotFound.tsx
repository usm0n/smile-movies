import { WarningAmberOutlined } from "@mui/icons-material";
import { Box, Link, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      justifyContent={"center"}
      alignItems={"center"}
      height={"100vh"}
    >
      <WarningAmberOutlined sx={{ fontSize: "100px" }} />
      <Typography level="h1">Page Not Found</Typography>
      <Typography level="body-lg">
        The page you are looking for does not exist. Please check the URL and
        try again or go back to the{" "}
        <Link onClick={() => navigate("/")}>homepage</Link>.
      </Typography>
    </Box>
  );
}

export default NotFound;
