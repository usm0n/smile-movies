import { useEffect, useState } from "react";
import { useTMDB } from "../../context/TMDB";
import {
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
import { Box, Divider, useColorScheme } from "@mui/joy";
import Header from "../../components/movie/Header";
import SeasonsEpisodes from "../../components/movie/SeasonEpisodes/SeasonsEpisodes";
import Container from "../../utilities/Container";
import Trailers from "../../components/movie/Trailers";
import Event from "../../components/home/Event";
import Cast from "../../components/movie/Cast";
import About from "../../components/movie/About";

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
    tvSeriesSimilar,
    tvSeriesSimilarData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();
  const [currentSeason, setCurrentSeason] = useState(1);
  const [eventRelatedType, setEventRelatedType] = useState("recommendations");

  const tvSeriesData = tvSeriesDetailsData?.data as movieDetails & tvDetails;
  const tvSeriesCreditsDataArr = tvSeriesCreditsData?.data as movieCredits;
  const tvImagesDataArr = tvImagesData?.data as images;
  const tvSeriesVideosDataArr = tvSeriesVideosData?.data as videos;
  const tvSeasonsDetailsDataArr =
    tvSeasonsDetailsData?.data as tvSeasonsDetails;

  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    tvSeriesCreditsData?.isLoading ||
    tvSeriesVideosData?.isLoading ||
    tvImagesData?.isLoading;

  useEffect(() => {
    if (tvId) {
      tvSeries(tvId);
      tvSeriesCredits(tvId);
      tvImages(tvId);
      tvSeriesVideos(tvId);
    }
  }, [tvId]);
  useEffect(() => {
    switch (eventRelatedType) {
      case "recommendations":
        tvSeriesRecommendations(tvId!);
        break;
      case "similar":
        tvSeriesSimilar(tvId!);
        break;
      default:
        break;
    }
  }, [tvId, eventRelatedType]);
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
      <Container>
        <SeasonsEpisodes
          tvData={tvSeriesData}
          tvSeasonData={tvSeasonsDetailsDataArr}
          currentSeason={currentSeason}
          setCurrentSeason={setCurrentSeason}
          isLoading={tvSeasonsDetailsData?.isLoading!}
        />
        {tvSeriesVideosDataArr?.results?.filter(
          (video) =>
            video.type == "Trailer" &&
            video?.official == true &&
            video?.site == "YouTube"
        ).length > 0 && (
          <>
            <Divider />
            <Trailers movieVideos={tvSeriesVideosDataArr} />
            <Divider />
          </>
        )}
        <Event
          eventData={
            eventRelatedType == "recommendations"
              ? tvSeriesRecommendationsData
              : tvSeriesSimilarData
          }
          setEventCategory={setEventRelatedType}
          eventTitle="Related"
          eventCategories={["recommendations", "similar"]}
          eventCategory={eventRelatedType}
          isTitleSimple={true}
        />
        <Divider/>
        <Cast movieCredits={tvSeriesCreditsDataArr} />
        <Divider/>
        <About movieDetails={tvSeriesData} />
      </Container>
    </Box>
  );
}
export default TVSeries;
