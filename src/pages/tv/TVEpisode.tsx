import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import {
  tvDetails,
  tvEpisodeCredits,
  tvEpisodeDetails,
  tvSeasonsDetails,
} from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import TVEpisodeComponent from "../../components/tv/TVEpisode";

function TVEpisode() {
  const { tvId, seasonNumber, episodeNumber } = useParams();
  const {
    tvSeries,
    tvSeriesDetailsData,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
    tvEpisodeCredits,
    tvEpisodeCreditsData,
    tvEpisodeDetails,
    tvEpisodeDetailsData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const tvSeriesData = tvSeriesDetailsData?.data as tvDetails;
  const tvSeasonsData = tvSeasonsDetailsData?.data as tvSeasonsDetails;
  const tvEpisodeData = tvEpisodeDetailsData?.data as tvEpisodeDetails;
  const tvEpisodeCreditsDataArr =
    tvEpisodeCreditsData?.data as tvEpisodeCredits;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading ||
    tvEpisodeDetailsData?.isLoading ||
    tvEpisodeCreditsData?.isLoading;

  useEffect(() => {
    if (tvId && seasonNumber && episodeNumber) {
      tvSeries(tvId);
      tvSeasonsDetails(tvId, parseInt(seasonNumber));
      tvEpisodeDetails(tvId, parseInt(seasonNumber), parseInt(episodeNumber));
      tvEpisodeCredits(tvId, parseInt(seasonNumber), parseInt(episodeNumber));
    }
  }, [
    tvId,
    seasonNumber,
    episodeNumber,
  ]);
  return tvSeriesDetailsData?.isIncorrect ||
    tvSeasonsDetailsData?.isIncorrect ||
    tvEpisodeDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    tvSeriesData &&
    tvSeasonsData &&
    tvEpisodeCreditsDataArr &&
    tvEpisodeData && (
      <TVEpisodeComponent
        tvEpisodeCreditsDataArr={tvEpisodeCreditsDataArr}
        tvEpisodeData={tvEpisodeData}
        tvSeriesData={tvSeriesData}
        tvSeasonsData={tvSeasonsData}
      />
    )
  );
}

export default TVEpisode;
