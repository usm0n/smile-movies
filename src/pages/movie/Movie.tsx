import { useEffect } from "react";
import { useTMDB } from "../../context/TMDB";
import { DiscoverMovie, movieCredits, movieDetails } from "../../tmdb-res";
import MovieComponent from "../../components/movie/Movie";
import { useParams } from "react-router-dom";
import NotFound from "../../components/utils/NotFound";
// import MovieSC from "../../components/movie/MovieSkeleton";
import { backdropLoading } from "../../utilities/defaults";
import { Box, useColorScheme } from "@mui/joy";

function Movie() {
  const { movieId } = useParams();
  const {
    movieDetailsData,
    movie,
    movieCredits,
    movieCreditsData,
    movieRecommendations,
    movieRecommendationsData,
  } = useTMDB();
  const { colorScheme } = useColorScheme();

  const movieData = movieDetailsData?.data as movieDetails;
  const movieCreditsDataArr = movieCreditsData?.data as movieCredits;
  const movieRecommendationsDataArr =
    movieRecommendationsData?.data as DiscoverMovie;
  const isFetching =
    movieDetailsData?.isLoading ||
    movieCreditsData?.isLoading ||
    movieRecommendationsData?.isLoading;
  useEffect(() => {
    if (movieId) {
      movie(movieId);
      movieCredits(movieId);
      movieRecommendations(movieId);
    }
    console.log(movieDetailsData);
  }, [movieId]);
  return movieDetailsData?.isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    <MovieComponent
      movieCreditsDataArr={movieCreditsDataArr}
      movieData={movieData}
      movieId={movieId!}
      movieRecommendationsDataArr={movieRecommendationsDataArr}
    />
  );
}

export default Movie;
