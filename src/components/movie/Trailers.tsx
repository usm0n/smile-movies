import { Box, Card, Typography } from "@mui/joy";
import { videos } from "../../tmdb-res";

function Trailers({ movieVideos }: { movieVideos: videos }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography level="h2">Trailers</Typography>
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          overflow: "scroll",
          width: "100%",
        }}
      >
        {movieVideos?.results
          ?.filter((t) => t?.official == true && t?.type == "Trailer" && t?.site == "YouTube")
          ?.map((video) => (
            <Card
              sx={{
                width: "300px",
                padding: "0",
                border: "none",
                backgroundColor: "transparent",
              }}
              key={video.id}
            >
              <iframe
                src={`https://www.youtube.com/embed/${video.key}?origin=https://smile-movies.uz`}
                title={video.name}
                style={{
                  border: "none",
                  borderRadius: "10px",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <Typography level="body-md">{video.name}</Typography>
            </Card>
          ))}
      </Box>
    </Box>
  );
}

export default Trailers;
