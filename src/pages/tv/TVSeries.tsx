import { useEffect, useState } from "react";
import { useTMDB } from "../../context/TMDB";
import {
  DiscoverTV,
  images,
  movieCredits,
  movieDetails,
  tvDetails,
  tvSeasonsDetails,
  videos,
} from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import Header from "../../components/movie/Header";
import SeasonsEpisodes from "../../components/movie/SeasonEpisodes/SeasonsEpisodes";

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
    tvSeasonsDetails,
    tvSeasonsDetailsData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();
  const [currentSeason, setCurrentSeason] = useState(1);

  const tvSeriesData = tvSeriesDetailsData?.data as movieDetails & tvDetails;
  const tvSeriesCreditsDataArr = tvSeriesCreditsData?.data as movieCredits;
  const tvImagesDataArr = tvImagesData?.data as images;
  const tvSeriesVideosDataArr = tvSeriesVideosData?.data as videos;
  const tvSeriesRecommendationsDataArr =
    tvSeriesRecommendationsData?.data as DiscoverTV;
  const tvSeasonsDetailsDataArr =
    tvSeasonsDetailsData?.data as tvSeasonsDetails;
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

  useEffect(() => {
    if (tvId) {
      tvSeasonsDetails(tvId, currentSeason);
    }
  }, [tvId, currentSeason]);
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          width: "100%",
        }}
      >
        <Header
          movieDetails={tvSeriesData}
          movieId={tvId!}
          movieImages={tvImagesDataArr}
          movieType="tv"
          movieVideos={tvSeriesVideosDataArr}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            width: "95%",
            margin: "0 auto",
          }}
        >
            <SeasonsEpisodes
              tvData={tvSeriesData}
              tvSeasonData={tvSeasonsDetailsDataArr}
              currentSeason={currentSeason}
              setCurrentSeason={setCurrentSeason}
              isLoading={tvSeasonsDetailsData?.isLoading!}
            />
        </Box>
      </Box>
    )
  );
}
export default TVSeries;
