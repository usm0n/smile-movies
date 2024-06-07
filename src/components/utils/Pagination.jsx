import { styled } from "@mui/material";
import usePagination from "@mui/material/usePagination/usePagination";
import React, { useEffect } from "react";
import PaginationMUI from "@mui/material/Pagination";
import { useNavigate, useParams } from "react-router-dom";

function Pagination({ totalPosts, postsPerPage, setCurrentPage, currentPage }) {
  let pages = [];
  const navigate = useNavigate();

  const { value, page } = useParams();
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

  useEffect(() => {
    if (page) {
      setCurrentPage(parseInt(page));
    } else {
      navigate(`/search/${value}/${1}`);
      setCurrentPage(1);
    }
  }, [value]);
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
        onChange={(event, page) => {
          navigate(`/search/${value}/${page}`);
          setCurrentPage(page);
        }}
      />
    </List>
  );
}

export default Pagination;
