import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import { DiscoverTV, images, movieCredits, movieDetails, tvDetails, videos } from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import Header from "../../components/movie/Header";

function TVSeries() {
  const { tvId } = useParams();
  const {
    tvSeries,
    tvSeriesDetailsData,
    tvSeriesCreditsData,
    tvSeriesCredits,
    tvSeriesRecommendationsData,
    tvSeriesRecommendations,
    tvImages,
    tvImagesData,
    tvSeriesVideos,
    tvSeriesVideosData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const tvSeriesData = tvSeriesDetailsData?.data as movieDetails & tvDetails;
  const tvSeriesCreditsDataArr = tvSeriesCreditsData?.data as movieCredits;
  const tvImagesDataArr = tvImagesData?.data as images;
  const tvSeriesVideosDataArr = tvSeriesVideosData?.data as videos;
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
      tvImages(tvId);
      tvSeriesVideos(tvId);
    }
  }, [tvId]);
  return tvSeriesDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    tvSeriesData &&
    tvSeriesCreditsDataArr &&
    tvSeriesRecommendationsDataArr && (
      <Header
        movieDetails={tvSeriesData}
        movieId={tvId!}
        movieImages={tvImagesDataArr}
        movieType="tv"
        movieVideos={tvSeriesVideosDataArr}
      />
    )
  );
}
export default TVSeries;
