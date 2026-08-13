import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { tmdbAPI } from "../../service/api/api";
import EventMC from "../cards/EventMC";
import EventMCS from "../cards/skeleton/EventMC";

function PopularInRegion({ region = "UZ", regionLabel = "Uzbekistan" }: { region?: string; regionLabel?: string }) {
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
    <Box>
      <Typography
        level="h3"
        sx={{ mb: 2, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
      >
        Popular in {regionLabel}
      </Typography>
      <Box
        className="no-scrollbar"
        sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 0.5 }}
      >
        {loading ? (
          Array.from({ length: 7 }).map((_, index) => <EventMCS key={index} />)
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
