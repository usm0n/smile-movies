import { useEffect, useState } from "react";
import { useTMDB } from "../../context/TMDB";
import {
  // DiscoverMovie,
  // movieCredits,
  images,
  movieCredits,
  movieDetails,
  tvDetails,
  videos,
} from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
// import MovieSC from "../../components/movie/MovieSkeleton";
import { backdropLoading } from "../../utilities/defaults";
import { Box, Divider, useColorScheme } from "@mui/joy";
import Header from "../../components/movie/Header";
import Container from "../../utilities/Container";
import Trailers from "../../components/movie/Trailers";
import Event from "../../components/home/Event";
import Cast from "../../components/movie/Cast";

function Movie() {
  const { movieId } = useParams();
  const {
    movieDetailsData,
    movie,
    movieCredits,
    movieCreditsData,
    movieRecommendations,
    movieRecommendationsData,
    movieSimilar,
    movieSimilarData,
    movieImages,
    movieImagesData,
    movieVideos,
    movieVideosData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();
  const [eventRelatedType, setEventRelatedType] = useState("recommendations");

  const movieData = movieDetailsData?.data as movieDetails & tvDetails;
  const movieImagesDataArr = movieImagesData?.data as images;
  const movieVideosDataArr = movieVideosData?.data as videos;
  const movieCreditsDataArr = movieCreditsData?.data as movieCredits;
  const isFetching =
    movieDetailsData?.isLoading ||
    movieCreditsData?.isLoading ||
    movieRecommendationsData?.isLoading ||
    movieImagesData?.isLoading ||
    movieVideosData?.isLoading ||
    movieSimilarData?.isLoading;
  useEffect(() => {
    if (movieId) {
      movie(movieId);
      movieCredits(movieId);
      movieImages(movieId);
      movieVideos(movieId);
    }
  }, [movieId]);
  useEffect(() => {
    if (movieId)
      switch (eventRelatedType) {
        case "recommendations":
          movieRecommendations(movieId);
          break;
        case "similar":
          movieSimilar(movieId);
          break;
        default:
          break;
      }
  }, [movieId, eventRelatedType]);
  return movieDetailsData?.isIncorrect ? (
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
        movieImages={movieImagesDataArr}
        movieDetails={movieData}
        movieVideos={movieVideosDataArr}
        movieId={movieId!}
        movieType="movie"
      />
      <Container>
        {movieVideosDataArr?.results?.filter(
          (video) =>
            video.type == "Trailer" ||
            video?.official == true ||
            video?.site == "YouTube"
        ).length > 0 && (
          <>
            <Trailers movieVideos={movieVideosDataArr} />
            <Divider />
          </>
        )}
        <Event
          eventData={
            eventRelatedType === "recommendations"
              ? movieRecommendationsData
              : movieSimilarData
          }
          eventTitle="Related"
          setEventCategory={setEventRelatedType}
          eventCategory={eventRelatedType}
          eventCategories={["recommendations", "similar"]}
          isTitleSimple={true}
        />
        <Divider />
        <Cast movieCredits={movieCreditsDataArr} />
      </Container>
    </Box>
  );
}

export default Movie;
