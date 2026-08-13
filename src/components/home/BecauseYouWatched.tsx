import { Box, Typography } from "@mui/joy";
import { Shimmer } from "../ui/Skeleton";
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
    <Shimmer width={110} height={22} sx={{ display: "inline-block", verticalAlign: "middle" }} />
  ) : logoPath ? (
    <Box
      component="img"
      src={`https://image.tmdb.org/t/p/original${logoPath}`}
      sx={{
        maxWidth: { xs: "130px", sm: "190px" },
        maxHeight: 26,
        objectFit: "contain",
        verticalAlign: "middle",
      }}
    />
  ) : (
    <Typography component="span" sx={{ color: "text.primary" }}>
      {seed?.title}
    </Typography>
  );

  if (!loading && !results.length) return null;

  return (
    <Box>
      <Typography
        level="h3"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          fontSize: { xs: "1.25rem", md: "1.5rem" },
        }}
      >
        Because you watched {seedTitleDisplay}
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
