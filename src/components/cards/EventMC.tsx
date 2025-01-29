import { CalendarMonth, Save, Star } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardCover,
  IconButton,
  Typography,
} from "@mui/joy";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";

function EventMC() {
  return (
    <Box>
      <Card
        sx={{
          cursor: "pointer",
          minHeight: "500px",
          width: "300px",
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
        <CardCover
          className="gradient-cover"
          sx={{
            "&:hover, &:focus-within": {
              opacity: 1,
            },
            opacity: 0,
            transition: "0.1s ease-in",
            background:
              "linear-gradient(180deg, transparent 62%, rgba(0,0,0,0.00345888) 63.94%, rgba(0,0,0,0.014204) 65.89%, rgba(0,0,0,0.0326639) 67.83%, rgba(0,0,0,0.0589645) 69.78%, rgba(0,0,0,0.0927099) 71.72%, rgba(0,0,0,0.132754) 73.67%, rgba(0,0,0,0.177076) 75.61%, rgba(0,0,0,0.222924) 77.56%, rgba(0,0,0,0.267246) 79.5%, rgba(0,0,0,0.30729) 81.44%, rgba(0,0,0,0.341035) 83.39%, rgba(0,0,0,0.367336) 85.33%, rgba(0,0,0,0.385796) 87.28%, rgba(0,0,0,0.396541) 89.22%, rgba(0,0,0,0.4) 91.17%)",
          }}
        >
          <div>
            <IconButton>
              <Save />
            </IconButton>
          </div>
        </CardCover>
        <CardCover>
          <img
            src="https://image.tmdb.org/t/p/original/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg"
            alt=""
          />
        </CardCover>

        <CardContent sx={{ justifyContent: "flex-end" }}>
          <Typography
            sx={{
              "@media (max-width: 800px)": {
                fontSize: "17px",
              },
            }}
            level="h3"
            textColor={"common.white"}
          >
            Sonic the hedgehog 3
          </Typography>
          <Box display={"flex"} gap={2}>
            <Typography
              level="body-md"
              textColor={"neutral.300"}
              startDecorator={<CalendarMonth />}
              sx={{
                "@media (max-width: 800px)": {
                  fontSize: "13px",
                },
              }}
            >
              2024-12-19
            </Typography>
            <Typography
              level="body-md"
              textColor={"neutral.300"}
              startDecorator={<Star />}
              sx={{
                "@media (max-width: 800px)": {
                  fontSize: "13px",
                },
              }}
            >
              7
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EventMC;
