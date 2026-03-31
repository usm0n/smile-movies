import { Box, Button, Option, Select } from "@mui/joy";
import { tvDetails, tvSeasonsDetails } from "../../../tmdb-res";
import EpisodeCard from "../../cards/EpisodeCard";
import EpisodeCardSkeleton from "../../cards/skeleton/EpisodeCardSkeleton";
import { useNavigate } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useEffect, useRef, useState } from "react";
import { resolveImdbId, fetchImdbEpisodesBySeason, ImdbEpisode } from "../../../service/api/imdb/imdb.api.service";

function SeasonsEpisodes({
  tvData,
  tvSeasonData,
  currentSeason,
  setCurrentSeason,
  isLoading,
}: {
  tvData: tvDetails;
  tvSeasonData: tvSeasonsDetails;
  currentSeason: number;
  setCurrentSeason: (season: number) => void;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const [imdbEpisodes, setImdbEpisodes] = useState<Map<number, ImdbEpisode>>(new Map());
  const imdbIdRef = useRef<string | null>(null);

  // Resolve IMDb ID once for this show
  useEffect(() => {
    if (!tvData?.id) return;
    resolveImdbId(tvData.id, "tv").then((id) => { imdbIdRef.current = id; });
  }, [tvData?.id]);

  // Fetch IMDb episode ratings whenever season changes
  useEffect(() => {
    if (!imdbIdRef.current || !currentSeason) return;
    let cancelled = false;

    const imdbId = imdbIdRef.current;
    fetchImdbEpisodesBySeason(imdbId, currentSeason).then((eps) => {
      if (cancelled) return;
      const map = new Map<number, ImdbEpisode>();
      eps.forEach((e) => map.set(e.episodeNumber, e));
      setImdbEpisodes(map);
    }).catch(() => {/* silently ignore */});

    return () => { cancelled = true; };
  }, [currentSeason, imdbIdRef.current]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, border: "none" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Select
          value={currentSeason}
          onChange={(_e, value) => setCurrentSeason(value!)}
          defaultValue={1}
        >
          {tvData?.seasons
            ?.filter((s) => s.season_number !== 0)
            ?.map((season) => (
              <Option key={season.id} value={season.season_number}>
                {season.name}
              </Option>
            ))}
        </Select>

        <Button
          variant="outlined"
          color="primary"
          size="sm"
          startDecorator={<BarChartIcon />}
          onClick={() => navigate(`/tv/${tvData?.id}/ratings`)}
          sx={{ borderRadius: 20 }}
        >
          Episode Ratings
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex", width: "100%", overflowX: "auto", gap: 1, pb: 1,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 4, background: "rgba(255,255,255,0.15)" },
        }}
      >
        {isLoading ? (
          Array(6).fill(null).map((_, i) => <EpisodeCardSkeleton key={i} />)
        ) : (
          tvSeasonData?.episodes?.map((episode: any) => (
            <EpisodeCard
              tvId={tvData?.id}
              episode={episode}
              key={episode.id}
              imdbRating={imdbEpisodes.get(episode.episode_number)?.rating?.aggregateRating}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export default SeasonsEpisodes;
