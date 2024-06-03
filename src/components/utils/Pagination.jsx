import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { IconButton, styled } from "@mui/material";
import usePagination from "@mui/material/usePagination/usePagination";
import React from "react";
import PaginationMUI from "@mui/material/Pagination";

function Pagination({ totalPosts, postsPerPage, setCurrentPage, currentPage }) {
  let pages = [];
  const List = styled("ul")({
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
  });

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pages.push(i);
  }

  const { items } = usePagination({
    count: pages.length,
  });

  return (
    <List>
      <PaginationMUI
        sx={{
          background: "white",
          borderRadius: "10px",
          padding: "5px 10px",
          lineHeight: "50px",
        }}
        color="primary"
        variant="outlined"
        shape="circular"
        size="large"
        page={currentPage}
        count={pages.length}
        siblingCount={0}
        onChange={(event, page) => setCurrentPage(page)}
      />
    </List>
  );
}

export default Pagination;
