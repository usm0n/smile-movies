import { Box, Skeleton, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
import EventMC from "../cards/EventMC";
import EventMCS from "../cards/skeleton/EventMC";
import { useTMDB } from "../../context/TMDB";
import { images } from "../../tmdb-res";
function BecauseYouWatched() {
  const { myselfData } = useUsers();
  const { movieImages, movieImagesData, tvImages, tvImagesData } = useTMDB();
  const [results, setResults] = useState<any[]>([]);
  const [seed, setSeed] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const user = myselfData?.data as User;

  useEffect(() => {
    const recent = user?.recentlyWatched;
    if (!recent?.length) return;

    const lastWatched = [...recent].sort(
      (a, b) =>
        new Date(b.lastWatchedAt || 0).getTime() -
        new Date(a.lastWatchedAt || 0).getTime(),
    )[0];

    if (!lastWatched) return;
    setSeed(lastWatched);
    setLoading(true);
    if (lastWatched.type === "movie") {
      movieImages(lastWatched.id);
    } else {
      tvImages(lastWatched.id);
    }

    const fetcher =
      lastWatched.type === "movie"
        ? tmdb.movieRecommendations(lastWatched.id)
        : tmdb.tvSeriesRecommendations(lastWatched.id);

    fetcher
      .then((data: any) => {
        const res = data?.results || [];
        setResults(res.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.recentlyWatched?.length]);

  const logoData = seed?.type === "movie" ? movieImagesData : tvImagesData;
  const logoPath = (logoData?.data as images)?.logos?.find(
    (l) => l.iso_639_1 === "en",
  )?.file_path;
  const logoLoading = logoData?.isLoading;

  const seedTitleDisplay = logoLoading ? (
    <Skeleton
      variant="rectangular"
      width={120}
      height={30}
      sx={{ display: "inline-block", verticalAlign: "middle", ml: 1 }}
    />
  ) : logoPath ? (
    <Box
      component="img"
      src={`https://image.tmdb.org/t/p/original${logoPath}`}
      sx={{
        maxWidth: { xs: "170px", sm: "260px" },
        ml: 1,
        verticalAlign: "middle",
        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.5))",
      }}
    />
  ) : (
    <Typography
      component="span"
      sx={{ color: "white", fontStyle: "italic", ml: 1 }}
    >
      {seed?.title}
    </Typography>
  );

  if (!loading && !results.length) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        level="h1"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
          gap: 2,
          color: "rgb(255, 216, 77)",
          "@media (max-width: 700px)": { fontSize: "25px" },
        }}
      >
        Because you watched {seedTitleDisplay}
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
          WebkitMaskImage:
            "linear-gradient(to right, black 95%, transparent 100%)",
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
              eventType={item.media_type || seed?.type}
              eventPoster={item.poster_path}
              eventTitle={item.title || item.name}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export default BecauseYouWatched;
