import { Box, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

/**
 * Vercel's 404: a centered split rule with the status on the left and the
 * explanation on the right.
 */
function NotFound({
  code = 404,
  message = "This page could not be found.",
}: {
  code?: number;
  message?: string;
}) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        px: 2,
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            pr: 3,
            borderRight: "1px solid",
            borderColor: "neutral.outlinedBorder",
            color: "text.primary",
          }}
        >
          {code}
        </Typography>
        <Typography level="body-md" sx={{ pl: 3 }}>
          {message}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button onClick={() => navigate("/")}>Go home</Button>
        <Button variant="outlined" color="neutral" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </Box>
    </Box>
  );
}

export default NotFound;
