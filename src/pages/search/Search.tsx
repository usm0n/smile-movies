import { Box, Button, Typography } from "@mui/joy";
import { useTMDB } from "../../context/TMDB";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { searchMulti } from "../../tmdb-res";
import EventMC from "../../components/cards/EventMC";
import EventMCS from "../../components/cards/skeleton/EventMC";

function Search() {
  const { query, page } = useParams();
  const { searchMulti, searchMultiData } = useTMDB();

  const searchResults = (searchMultiData?.data as searchMulti)?.results.filter(
    (result) => result.media_type !== "person" && result.poster_path
  );
  const totalPages = (searchMultiData?.data as searchMulti)?.total_pages;
  const totalResults = (searchMultiData?.data as searchMulti)?.total_results;
  const currentPage = (searchMultiData?.data as searchMulti)?.page;
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      searchMulti(query, page ? +page : 1);
    }
  }, [query, page]);
  return (
    <Box
      sx={{
        width: "90%",
        padding: "100px 0px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        minHeight: "100vh",
      }}
    >
      <Typography
        level="h1"
        fontWeight={700}
        sx={{
          "@media (max-width: 768px)": {
            fontSize: "30px",
          },
        }}
      >
        Search Results for:{" "}
        <Typography fontWeight={400} textColor={"neutral.300"}>
          {" "}
          {query}
        </Typography>
      </Typography>
      {searchMultiData &&
        !searchMultiData?.isLoading &&
        searchResults?.length && (
          <Typography>{totalResults} results found</Typography>
        )}
      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"center"}
        gap={"10px"}
      >
        {!searchResults?.length &&
          !searchMultiData?.isLoading &&
          searchMultiData && (
            <Typography textColor={"neutral.300"} level="h2" fontWeight={700}>
              No Results Found
            </Typography>
          )}
        {!searchMultiData?.isLoading ? (
          searchResults?.map((result) => (
            <EventMC
              eventPoster={result?.poster_path}
              eventId={result?.id}
              eventType={result?.media_type}
              key={result?.id}
            />
          ))
        ) : (
          <>
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
          </>
        )}

        {searchResults?.length > 0 && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              disabled={currentPage === 1}
              onClick={() => navigate(`/search/${query}/${currentPage - 1}`)}
            >
              Previous
            </Button>
            <Typography
              level="body-md"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Page {currentPage} of {totalPages || 1}
            </Typography>
            <Button
              variant="outlined"
              disabled={currentPage === (totalPages || 1)}
              onClick={() => navigate(`/search/${query}/${currentPage + 1}`)}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>{" "}
    </Box>
  );
}

export default Search;
