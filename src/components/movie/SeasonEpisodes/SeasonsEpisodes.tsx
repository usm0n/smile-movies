import { Box, Button, Option, Select } from "@mui/joy";
import { tvDetails, tvSeasonsDetails } from "../../../tmdb-res";
import EpisodeCard from "../../cards/EpisodeCard";
import EpisodeCardSkeleton from "../../cards/skeleton/EpisodeCardSkeleton";
import { useNavigate } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useEffect, useRef, useState } from "react";
import { resolveImdbId, fetchImdbEpisodesBySeason, ImdbEpisode } from "../../../service/api/imdb/imdb.api.service";
import { useUsers } from "../../../context/Users";
import { User } from "../../../user";

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
  const { myselfData } = useUsers();
  const [imdbEpisodes, setImdbEpisodes] = useState<Map<number, ImdbEpisode>>(new Map());
  const imdbIdRef = useRef<string | null>(null);
  const resolvedRef = useRef(false);
  const recentItem = (myselfData?.data as User)?.recentlyWatched?.find(
    (item) => item.id === String(tvData?.id) && item.type === "tv",
  );

  // Resolve the show's IMDb ID once
  useEffect(() => {
    if (!tvData?.id || resolvedRef.current) return;
    resolvedRef.current = true;
    resolveImdbId(tvData.id, "tv").then((id) => {
      imdbIdRef.current = id;
      // Kick off initial season fetch after resolving
      if (id && currentSeason) loadSeason(id, currentSeason);
    });
  }, [tvData?.id]);

  // Re-fetch when season changes (after IMDb ID is resolved)
  useEffect(() => {
    if (!imdbIdRef.current || !currentSeason) return;
    loadSeason(imdbIdRef.current, currentSeason);
  }, [currentSeason]);

  function loadSeason(imdbId: string, season: number) {
    let cancelled = false;
    fetchImdbEpisodesBySeason(imdbId, season)
      .then((eps) => {
        if (cancelled) return;
        const map = new Map<number, ImdbEpisode>();
        eps.forEach((e) => map.set(e.episodeNumber, e));
        setImdbEpisodes(map);
      })
      .catch(() => {/* silently ignore */});
    return () => { cancelled = true; };
  }

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
          tvSeasonData?.episodes?.map((episode: any) => {
            const imdbEp = imdbEpisodes.get(episode.episode_number);
            const isCurrentSeason = Number(recentItem?.currentSeason || 0) === Number(currentSeason);
            const isNextSeason = Number(recentItem?.nextSeason || 0) === Number(currentSeason);
            const progressValue =
              isCurrentSeason &&
              Number(recentItem?.currentEpisode || 0) === Number(episode.episode_number) &&
              Number(recentItem?.duration || 0) > 0
                ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((Number(recentItem?.currentTime || 0) / Number(recentItem?.duration || 1)) * 100),
                  ),
                )
                : 0;
            const isInProgress = progressValue > 0;
            const isCompleted =
              isCurrentSeason &&
              !isInProgress &&
              Number(recentItem?.currentEpisode || 0) > Number(episode.episode_number);
            const isNext =
              isNextSeason &&
              Number(recentItem?.nextEpisode || 0) === Number(episode.episode_number);

            return (
              <EpisodeCard
                key={episode.id}
                tvId={tvData?.id}
                episode={episode}
                imdbRating={imdbEp?.rating?.aggregateRating}
                imdbEpisodeId={imdbEp?.id}
                progressValue={progressValue}
                isCompleted={isCompleted}
                isInProgress={isInProgress}
                isNext={isNext}
              />
            );
          })
        )}
      </Box>
    </Box>
  );
}

export default SeasonsEpisodes;
