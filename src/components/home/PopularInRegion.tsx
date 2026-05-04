import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { tmdbAPI } from "../../service/api/api";
import EventMC from "../cards/EventMC";
import EventMCS from "../cards/skeleton/EventMC";

function PopularInRegion({ region = "UZ", regionLabel = "Uzbekistan 🇺🇿" }: { region?: string; regionLabel?: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    tmdbAPI
      .get("/discover/movie", {
        params: {
          sort_by: "popularity.desc",
          region,
          with_release_type: "2|3",
          "primary_release_date.gte": sixMonthsAgo,
          page: 1,
        },
      })
      .then((r) => setResults((r.data?.results || []).slice(0, 12)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [region]);

  if (!loading && !results.length) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        level="h1"
        sx={{
          mb: 3,
          color: "rgb(255, 216, 77)",
          "@media (max-width: 700px)": { fontSize: "25px" },
        }}
      >
        Popular in {regionLabel}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "scroll",
          pb: 1,
          paddingRight: "24px",
          scrollbarColor: "transparent",
          scrollbarWidth: "thin",
          maskImage: "linear-gradient(to right, black 95%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 95%, transparent 100%)",
        }}
      >
        {loading ? (
          <>
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
            <EventMCS />
          </>
        ) : (
          results.map((item: any) => (
            <EventMC
              key={item.id}
              eventId={item.id}
              eventType="movie"
              eventPoster={item.poster_path}
              eventTitle={item.title}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export default PopularInRegion;
