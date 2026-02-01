import { Box, Button, IconButton, Typography } from "@mui/joy";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useNavigate } from "react-router-dom";

function Pagination({
  currentPage,
  totalPages,
  whereTo,
}: {
  currentPage: number;
  totalPages: number | null;
  whereTo: string;
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        mt: 4,
        flexWrap: "wrap",
      }}
    >
      <IconButton
        variant="outlined"
        disabled={currentPage === 1}
        onClick={() => navigate(`${whereTo}/1`)}
        size="sm"
      >
        <KeyboardDoubleArrowLeftIcon />
      </IconButton>
      <IconButton
        variant="outlined"
        disabled={currentPage === 1}
        onClick={() => navigate(`${whereTo}/${currentPage - 1}`)}
        size="sm"
      >
        <KeyboardArrowLeftIcon />
      </IconButton>

      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
        {Array.from({
          length: Math.min(5, Math.max(1, (totalPages || 1) - Math.max(0, currentPage - 3))),
        }).map((_, i) => {
          const pageNum = Math.max(1, currentPage - 2) + i;
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "solid" : "outlined"}
              color={currentPage === pageNum ? "primary" : "neutral"}
              size="sm"
              onClick={() => navigate(`${whereTo}/${pageNum}`)}
              sx={{ minWidth: "32px" }}
            >
              {pageNum}
            </Button>
          );
        })}
      </Box>

      <Typography level="body-sm" sx={{ mx: 1, whiteSpace: "nowrap" }}>
        {currentPage} / {totalPages || 1}
      </Typography>

      <IconButton
        variant="outlined"
        disabled={currentPage === (totalPages || 1)}
        onClick={() => navigate(`${whereTo}/${currentPage + 1}`)}
        size="sm"
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton
        variant="outlined"
        disabled={currentPage === (totalPages || 1)}
        onClick={() => navigate(`${whereTo}/${totalPages || 1}`)}
        size="sm"
      >
        <KeyboardDoubleArrowRightIcon />
      </IconButton>
    </Box>
  );
}

export default Pagination;
