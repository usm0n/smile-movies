import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import { DiscoverTV, movieCredits, tvDetails } from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import TVSeriesComponent from "../../components/tv/TVSeries";

function TVSeries() {
  const { tvId } = useParams();
  const {
    tvSeries,
    tvSeriesDetailsData,
    tvSeriesCreditsData,
    tvSeriesCredits,
    tvSeriesRecommendationsData,
    tvSeriesRecommendations,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const tvSeriesData = tvSeriesDetailsData?.data as tvDetails;
  const tvSeriesCreditsDataArr = tvSeriesCreditsData?.data as movieCredits;
  const tvSeriesRecommendationsDataArr =
    tvSeriesRecommendationsData?.data as DiscoverTV;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    tvSeriesCreditsData?.isLoading ||
    tvSeriesRecommendationsData?.isLoading;

  useEffect(() => {
    if (tvId) {
      tvSeries(tvId);
      tvSeriesCredits(tvId);
      tvSeriesRecommendations(tvId);
    }
  }, [tvId]);
  return tvSeriesDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    <TVSeriesComponent
      tvSeriesCreditsDataArr={tvSeriesCreditsDataArr}
      tvSeriesData={tvSeriesData}
      tvSeriesRecommendationsDataArr={tvSeriesRecommendationsDataArr}
    />
  );
}

export default TVSeries;
