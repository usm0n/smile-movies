import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import { movieCredits, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import TVSeasonsComponent from "../../components/tv/TVSeasons";

function TVSeasons() {
  const { tvId, seasonNumber } = useParams();
  const {
    tvSeries,
    tvSeriesDetailsData,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
    tvSeasonsCreditsData,
    tvSeasonsCredits,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const tvSeriesData = tvSeriesDetailsData?.data as tvDetails;
  const tvSeasonsData = tvSeasonsDetailsData?.data as tvSeasonsDetails;
  const tvSeasonsCreditsDataArr = tvSeasonsCreditsData?.data as movieCredits;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading ||
    tvSeasonsCreditsData?.isLoading;

  useEffect(() => {
    if (tvId && seasonNumber) {
      tvSeries(tvId);
      tvSeasonsDetails(tvId, parseInt(seasonNumber));
      tvSeasonsCredits(tvId, parseInt(seasonNumber));
    }
  }, [tvId, seasonNumber]);
  return tvSeriesDetailsData?.isIncorrect ||
    tvSeasonsDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    tvSeriesData &&
    tvSeasonsData &&
    tvSeasonsCreditsDataArr && (
      <TVSeasonsComponent
        tvSeriesData={tvSeriesData}
        tvSeasonsCreditsDataArr={tvSeasonsCreditsDataArr}
        tvSeasonsData={tvSeasonsData}
      />
    )
  );
}

export default TVSeasons;
