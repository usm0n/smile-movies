import { Box, Button, Option, Select } from "@mui/joy";
import { tvDetails, tvSeasonsDetails } from "../../../tmdb-res";
import EpisodeCard from "../../cards/EpisodeCard";
import EpisodeCardSkeleton from "../../cards/skeleton/EpisodeCardSkeleton";
import { useNavigate } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";

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

        {/* Link to SeriesGraph-style ratings page */}
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
          display: "flex",
          width: "100%",
          overflowX: "auto",
          gap: 1,
          pb: 1,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 4, background: "rgba(255,255,255,0.15)" },
        }}
      >
        {isLoading ? (
          Array(6).fill(null).map((_, i) => <EpisodeCardSkeleton key={i} />)
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
