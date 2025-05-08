import { Autocomplete, Box, IconButton, Typography } from "@mui/joy";
import { useState } from "react";
import { useTMDB } from "../../context/TMDB";
import { useNavigate } from "react-router-dom";
import { searchMulti } from "../../tmdb-res";
import { Search } from "@mui/icons-material";

function Header() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const { searchMultiAC, searchMultiACData } = useTMDB();

  const handleSearchSubmit = () => {
    if (searchValue) {
      navigate(`/search/${searchValue}`);
      setSearchValue("");
    }
  };
  const searchResults = (searchMultiACData?.data as searchMulti)?.results;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "100px 0",
        gap: "10px",
        textAlign: "center",
        width: "95%",
        margin: "0 auto",
      }}
    >
      <Typography level="h1" fontWeight={700}>
        Welcome to{" "}
        <span style={{ color: "rgb(255, 220, 95)" }}>Smile Movies</span>
      </Typography>
      <Typography level="body-lg" fontWeight={500}>
        Watch millions of Movies and TV shows.
      </Typography>
      <Typography fontWeight={700} sx={{ padding: "20px 0 0 0" }}>
        Start by searching for a movie or TV show
      </Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
      >
        <Autocomplete
          sx={{
            width: "500px",
            "@media (max-width: 600px)": {
              width: "100%",
            },
          }}
          size="lg"
          onInputChange={(_event, value) => {
            setSearchValue(value);
            searchMultiAC(value, 1);
          }}
          options={searchResults || []}
          filterOptions={(options) => {
            const filteredOptions = options.filter(
              (option) => option.media_type !== "person"
            );
            return filteredOptions;
          }}
          getOptionLabel={(option) => option?.title || option?.name || ""}
          placeholder="Search"
          endDecorator={
            <IconButton onClick={handleSearchSubmit}>
              <Search />
            </IconButton>
          }
        />
      </form>
    </Box>
  );
}

export default Header;
