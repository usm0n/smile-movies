import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { IconButton, styled } from "@mui/material";
import usePagination from "@mui/material/usePagination/usePagination";
import React from "react";

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
    // <List>
    //   {items.map(({ page, type, selected, ...item }, index) => {
    //     let children = null;

    //     if (type === "start-ellipsis" || type === "end-ellipsis") {
    //       children = "…";
    //     } else if (type === "page") {
    //       children = (
    //         <button
    //           type="button"
    //           style={{
    //             fontWeight: selected ? "bold" : undefined,
    //             background: selected ? "gold" : "transparent",
    //             border: selected ? "1px solid gold" : "1px solid #fff",
    //             color: selected ? "#000" : "#fff",
    //             padding: "15px 20px",
    //             borderRadius: "10px",
    //             fontSize: "15px",
    //           }}
    //           {...item}
    //         >
    //           {page}
    //         </button>
    //       );
    //     } else {
    //       children = (
    //         <button
    //           style={{
    //             border: "none",
    //             color: "#fff",
    //             padding: "15px 20px",
    //             fontSize: "10px",
    //           }}
    //           type="button"
    //           {...item}
    //         >
    //           {type == "previous" ? (
    //             <ArrowBack />
    //           ) : type == "next" ? (
    //             <ArrowForward />
    //           ) : (
    //             ""
    //           )}
    //         </button>
    //       );
    //     }

    //     return <li key={index}>{children}</li>;
    //   })}
    // </List>
    <List>
      <IconButton
        disabled={currentPage == 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        color="inherit"
      >
        <ArrowBack />
      </IconButton>
      {pages.map((page, index) => {
        return (
          <>
            <button
              key={index}
              onClick={() => setCurrentPage(page)}
              type="button"
              style={{
                fontWeight: page == currentPage ? "bold" : undefined,
                background: page == currentPage ? "gold" : "transparent",
                border:
                  page == currentPage ? "1px solid gold" : "1px solid #fff",
                color: page == currentPage ? "#000" : "#fff",
                padding: "15px 20px",
                borderRadius: "10px",
                fontSize: "15px",
              }}
            >
              {page}
            </button>
          </>
        );
      })}
      <IconButton
        disabled={currentPage == pages.length}
        onClick={() => setCurrentPage(currentPage + 1)}
        color="inherit"
      >
        <ArrowForward />
      </IconButton>
    </List>
  );
}

export default Pagination;
