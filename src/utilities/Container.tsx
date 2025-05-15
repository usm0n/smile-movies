import { Box } from "@mui/joy";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        width: "95%",
        margin: "0 auto",
        "@media (max-width: 700px)": {
          width: "90%",
        }
      }}
    >
      {children}
    </Box>
  );
}

export default Container;
