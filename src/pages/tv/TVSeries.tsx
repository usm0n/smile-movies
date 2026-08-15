import { useCallback, useEffect, useRef, useState } from "react";
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
import LoadFailed from "../../components/utils/LoadFailed";
import { Box, Divider } from "@mui/joy";
import { DetailSkeleton, RowSkeleton } from "../../components/ui/Skeleton";
import Header from "../../components/movie/Header";
import SeasonsEpisodes from "../../components/movie/SeasonEpisodes/SeasonsEpisodes";
import Container from "../../utilities/Container";
import Trailers from "../../components/movie/Trailers";
import Event from "../../components/home/Event";
import Cast from "../../components/movie/Cast";
import About from "../../components/movie/About";
import ReviewsSection from "../../components/reviews/ReviewsSection";
import ImdbTitleExtras from "../../components/movie/imdb/ImdbTitleExtras";
import { useImdbTitleDetails } from "../../utilities/useImdbTitleDetails";

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
  const [currentSeason, setCurrentSeason] = useState(1);
  const [eventRelatedType, setEventRelatedType] = useState("recommendations");
  // Resolved from the TMDB id; renders nothing if IMDb has no match.
  const imdbState = useImdbTitleDetails({ mediaType: "tv", mediaId: tvId });

  const tvSeriesData = tvSeriesDetailsData?.data as movieDetails & tvDetails;
  const tvSeriesCreditsDataArr = tvSeriesCreditsData?.data as movieCredits;
  const tvImagesDataArr = tvImagesData?.data as images;
  const tvSeriesVideosDataArr = tvSeriesVideosData?.data as videos;
  const tvSeasonsDetailsDataArr =
    tvSeasonsDetailsData?.data as tvSeasonsDetails;

  /**
   * The TMDB context stores one response per endpoint for the whole app, so on
   * the render where `tvId` changes those slots still hold the previous title —
   * or the home page's hero. Holding the skeleton until this render's effect
   * has claimed the id is what stops the old title flashing up first.
   */
  const requestedId = useRef<string | undefined>(undefined);
  const isStale = requestedId.current !== tvId;

  /**
   * Only what the hero needs blocks the page; the cast row and the related rail
   * carry their own placeholders and fill in behind it.
   */
  const isFetching =
    isStale ||
    !tvSeriesDetailsData ||
    tvSeriesDetailsData?.isLoading ||
    tvSeriesVideosData?.isLoading ||
    tvImagesData?.isLoading;

  const loadTitle = useCallback(() => {
    if (!tvId) return;
    requestedId.current = tvId;
    tvSeries(tvId);
    tvSeriesCredits(tvId);
    tvImages(tvId);
    tvSeriesVideos(tvId);
  }, [tvId]);

  useEffect(() => {
    loadTitle();
  }, [loadTitle]);
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
    <Box sx={{ pt: "calc(var(--sm-nav-height) + 24px)" }}>
      <Container>
        <DetailSkeleton />
        <RowSkeleton count={6} />
      </Container>
    </Box>
  ) : tvSeriesDetailsData?.isError ? (
    <LoadFailed onRetry={loadTitle} />
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
          // Null on the first render of a season, before its effect fires —
          // treat that as loading so the list shows placeholders, not nothing.
          isLoading={!tvSeasonsDetailsData || tvSeasonsDetailsData.isLoading}
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
        <Cast
          movieCredits={tvSeriesCreditsDataArr}
          isLoading={Boolean(tvSeriesCreditsData?.isLoading)}
        />
        <Divider/>
        <About movieDetails={tvSeriesData} />
        <Divider/>
        <ImdbTitleExtras state={imdbState} />
        {imdbState.details && <Divider />}
        <ReviewsSection
          mediaId={tvId!}
          mediaType="tv"
          title={tvSeriesData?.name || "Untitled series"}
        />
      </Container>
    </Box>
  );
}
export default TVSeries;
