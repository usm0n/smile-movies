import { Box, Card, CardContent, CardCover, Skeleton } from "@mui/joy";

function EventMCS() {
  return (
    <Box>
      <Card
        sx={{
          cursor: "pointer",
          minHeight: "400px",
          width: "250px",
          background: "transparent",
          border: "1px solid gray",
          "@media (max-width: 800px)": {
            margin: "0 auto",
            width: "200px",
            minHeight: "300px",
          },
          ":hover": {
            transition: "all 0.2s ease-in-out",
            opacity: 0.8,
          },
        }}
      >
        <CardCover>
          <Skeleton sx={{ background: "gray" }} />
        </CardCover>

        <CardContent sx={{ justifyContent: "flex-end" }}>
          <Skeleton sx={{ background: "gray" }} />
          <Skeleton sx={{ background: "gray", width: "90%" }} />
        </CardContent>
      </Card>
    </Box>
  );
}

export default EventMCS;
