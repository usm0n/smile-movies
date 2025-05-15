import { Box, Option, Select } from "@mui/joy";
import { tvDetails, tvSeasonsDetails } from "../../../tmdb-res";
import { useEffect } from "react";
import EpisodeCard from "../../cards/EpisodeCard";
import EpisodeCardSkeleton from "../../cards/skeleton/EpisodeCardSkeleton";

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
  useEffect(() => {
    console.log(currentSeason);
  }, [currentSeason, setCurrentSeason]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        border: "none",
      }}
    >
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
      <Box
        sx={{
          display: "flex",
          width: "100%",
          overflow: "scroll",
        }}
      >
        {isLoading ? (
          <>
            <EpisodeCardSkeleton />
            <EpisodeCardSkeleton />
            <EpisodeCardSkeleton />
            <EpisodeCardSkeleton />
            <EpisodeCardSkeleton />
            <EpisodeCardSkeleton />
          </>
        ) : (
          tvSeasonData?.episodes?.map((episode: any) => (
            <EpisodeCard tvId={tvData?.id} episode={episode} key={episode.id} />
          ))
        )}
      </Box>
    </Box>
  );
}

export default SeasonsEpisodes;
