import { Box, Typography } from "@mui/joy";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "../ui/icons";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

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
  const lastPage = totalPages || 1;
  const pageCount = Math.min(5, Math.max(1, lastPage - Math.max(0, currentPage - 3)));

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 0.75,
        mt: 4,
        flexWrap: "wrap",
      }}
    >
      <IconButton
        label="First page"
        variant="outlined"
        disabled={currentPage === 1}
        onClick={() => navigate(`${whereTo}/1`)}
        size="sm"
      >
        <KeyboardDoubleArrowLeft sx={{ fontSize: 16 }} />
      </IconButton>
      <IconButton
        label="Previous page"
        variant="outlined"
        disabled={currentPage === 1}
        onClick={() => navigate(`${whereTo}/${currentPage - 1}`)}
        size="sm"
      >
        <KeyboardArrowLeft sx={{ fontSize: 16 }} />
      </IconButton>

      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", mx: 0.5 }}>
        {Array.from({ length: pageCount }).map((_, i) => {
          const pageNum = Math.max(1, currentPage - 2) + i;
          const active = currentPage === pageNum;
          return (
            <Button
              key={pageNum}
              aria-current={active ? "page" : undefined}
              variant={active ? "solid" : "outlined"}
              color="neutral"
              size="sm"
              onClick={() => navigate(`${whereTo}/${pageNum}`)}
              sx={{
                minWidth: 32,
                px: 0,
                ...(active
                  ? { backgroundColor: "#ffffff", color: "#000000" }
                  : { color: "text.secondary" }),
              }}
            >
              {pageNum}
            </Button>
          );
        })}
      </Box>

      <IconButton
        label="Next page"
        variant="outlined"
        disabled={currentPage === lastPage}
        onClick={() => navigate(`${whereTo}/${currentPage + 1}`)}
        size="sm"
      >
        <KeyboardArrowRight sx={{ fontSize: 16 }} />
      </IconButton>
      <IconButton
        label="Last page"
        variant="outlined"
        disabled={currentPage === lastPage}
        onClick={() => navigate(`${whereTo}/${lastPage}`)}
        size="sm"
      >
        <KeyboardDoubleArrowRight sx={{ fontSize: 16 }} />
      </IconButton>

      <Typography level="body-xs" sx={{ ml: 1, whiteSpace: "nowrap" }}>
        Page {currentPage} of {lastPage}
      </Typography>
    </Box>
  );
}

export default Pagination;
