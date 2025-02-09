import { Autocomplete, Box, Typography } from "@mui/joy";
import { Typewriter } from "react-simple-typewriter";

function Header() {
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
        Welcome to <span style={{color: "rgb(255, 220, 95)"}}>Smile Movies</span>
      </Typography>
      <Typography level="body-lg" fontWeight={500}>
        Watch millions of Movies and TV shows.{" "}
        <Typography
          sx={{
            color: "rgb(255, 200, 0)",
          }}
          fontWeight={700}
        >
          <Typewriter
            words={[
              "No ADS",
              "Free",
              "High Quality",
              "With Subtitles",
              "Fast Streaming",
              "Easy to Use",
              "No Registration",
              "Anywhere Anytime",
            ]}
            loop={Infinity}
            cursor
            cursorStyle="_"
          />
        </Typography>
      </Typography>
      <Typography fontWeight={700} sx={{ padding: "20px 0 0 0" }}>
        Start by searching for a movie or TV series
      </Typography>
      <Autocomplete
        options={[]}
        size="lg"
        sx={{ width: "500px", "@media (max-width: 600px)": { width: "100%" } }}
        placeholder="Search..."
      />
    </Box>
  );
}

export default Header;
