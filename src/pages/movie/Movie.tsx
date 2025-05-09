import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import {
  // DiscoverMovie,
  // movieCredits,
  images,
  movieDetails,
  tvDetails,
  videos,
} from "../../tmdb-res";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
// import MovieSC from "../../components/movie/MovieSkeleton";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";
import Header from "../../components/movie/Header";

function Movie() {
  const { movieId } = useParams();
  const {
    movieDetailsData,
    movie,
    movieCredits,
    movieCreditsData,
    movieRecommendations,
    movieRecommendationsData,
    movieImages,
    movieImagesData,
    movieVideos,
    movieVideosData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const movieData = movieDetailsData?.data as movieDetails & tvDetails;
  // const movieCreditsDataArr = movieCreditsData?.data as movieCredits;
  // const movieRecommendationsDataArr =
  //   movieRecommendationsData?.data as DiscoverMovie;
  const movieImagesDataArr = movieImagesData?.data as images;
  const movieVideosDataArr = movieVideosData?.data as videos;
  const isFetching =
    movieDetailsData?.isLoading ||
    movieCreditsData?.isLoading ||
    movieRecommendationsData?.isLoading;
  useEffect(() => {
    if (movieId) {
      movie(movieId);
      movieCredits(movieId);
      movieRecommendations(movieId);
      movieImages(movieId);
      movieVideos(movieId);
    }
  }, [movieId]);
  return movieDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    <Box>
      <Header
        movieImages={movieImagesDataArr}
        movieDetails={movieData}
        movieVideos={movieVideosDataArr}
        movieId={movieId!}
        movieType="movie"
      />
    </Box>
  );
}

export default Movie;
