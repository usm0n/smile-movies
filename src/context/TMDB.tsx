import React, { createContext, useContext, useRef, useState } from "react";
import * as tmdbRes from "../tmdb-res";
import { tmdb } from "../service/api/tmdb/tmdb.api.service";

const TmdbContext = createContext({
  discoverMovieData: null as tmdbRes.ResponseType | null,
  discoverTvData: null as tmdbRes.ResponseType | null,
  nowPlayingMoviesData: null as tmdbRes.ResponseType | null,
  popularMoviesData: null as tmdbRes.ResponseType | null,
  topRatedMoviesData: null as tmdbRes.ResponseType | null,
  upcomingMoviesData: null as tmdbRes.ResponseType | null,
  airingTodayTvData: null as tmdbRes.ResponseType | null,
  onTheAirTvData: null as tmdbRes.ResponseType | null,
  popularTvData: null as tmdbRes.ResponseType | null,
  topRatedTvData: null as tmdbRes.ResponseType | null,
  trendingAllData: null as tmdbRes.ResponseType | null,
  trendingMoviesData: null as tmdbRes.ResponseType | null,
  trendingTvData: null as tmdbRes.ResponseType | null,
  movieDetailsData: null as tmdbRes.ResponseType | null,
  tvSeriesDetailsData: null as tmdbRes.ResponseType | null,
  searchMovieData: null as tmdbRes.ResponseType | null,
  searchTvData: null as tmdbRes.ResponseType | null,
  discoverMovie: async (page: number) => {
    page;
  },
  discoverTv: (page: number) => {
    page;
  },
  nowPlayingMovies: (page: number) => {
    page;
  },
  popularMovies: (page: number) => {
    page;
  },
  topRatedMovies: (page: number) => {
    page;
  },
  upcomingMovies: (page: number) => {
    page;
  },
  airingTodayTv: (page: number) => {
    page;
  },
  onTheAirTv: (page: number) => {
    page;
  },
  popularTv: (page: number) => {
    page;
  },
  topRatedTv: (page: number) => {
    page;
  },
  searchMovie: (query: string, page: number) => {
    query;
    page;
  },
  searchTv: (query: string, page: number) => {
    query;
    page;
  },
  trendingAll: (time: "day" | "week", page: number) => {
    time;
    page;
  },
  trendingMovies: (time: "day" | "week", page: number) => {
    time;
    page;
  },
  trendingTv: (time: "day" | "week", page: number) => {
    time;
    page;
  },
  movie: (id: string) => {
    id;
  },
  tvSeries: (id: string) => {
    id;
  },
  movieCreditsData: null as tmdbRes.ResponseType | null,
  movieCredits: async (id: string) => {
    id;
  },
  movieRecommendationsData: null as tmdbRes.ResponseType | null,
  movieRecommendations: async (id: string) => {
    id;
  },
  tvSeriesCreditsData: null as tmdbRes.ResponseType | null,
  tvSeriesCredits: async (id: string) => {
    id;
  },
  tvSeriesRecommendationsData: null as tmdbRes.ResponseType | null,
  tvSeriesRecommendations: async (id: string) => {
    id;
  },
  tvSeasonsDetailsData: null as tmdbRes.ResponseType | null,
  tvSeasonsDetails: async (id: string, seasonNumber: number) => {
    id;
    seasonNumber;
  },
  tvSeasonsCreditsData: null as tmdbRes.ResponseType | null,
  tvSeasonsCredits: async (id: string, seasonNumber: number) => {
    id;
    seasonNumber;
  },
  tvEpisodeDetailsData: null as tmdbRes.ResponseType | null,
  tvEpisodeDetails: async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    id;
    seasonNumber;
    episodeNumber;
  },
  tvEpisodeCreditsData: null as tmdbRes.ResponseType | null,
  tvEpisodeCredits: async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    id;
    seasonNumber;
    episodeNumber;
  },
  searchMultiData: null as tmdbRes.ResponseType | null,
  searchMultiACData: null as tmdbRes.ResponseType | null,
  searchMulti: async (query: string, page: number) => {
    query;
    page;
  },
  searchMultiAC: async (query: string, page: number) => {
    query;
    page;
  },
  movieImagesData: null as tmdbRes.ResponseType | null,
  movieImages: async (id: string) => {
    id;
  },
  tvImagesData: null as tmdbRes.ResponseType | null,
  tvImages: async (id: string) => {
    id;
  },
  movieVideosData: null as tmdbRes.ResponseType | null,
  movieVideos: async (id: string) => {
    id;
  },
  tvSeriesVideosData: null as tmdbRes.ResponseType | null,
  tvSeriesVideos: async (id: string) => {
    id;
  },
  movieTranslationsData: null as tmdbRes.ResponseType | null,
  movieTranslations: async (id: string) => {
    id;
  },
  tvSeriesTranslationsData: null as tmdbRes.ResponseType | null,
  tvSeriesTranslations: async (id: string) => {
    id;
  },
  movieSimilarData: null as tmdbRes.ResponseType | null,
  movieSimilar: async (id: string) => {
    id;
  },
  tvSeriesSimilarData: null as tmdbRes.ResponseType | null,
  tvSeriesSimilar: async (id: string) => {
    id;
  },
  peopleDetailsData: null as tmdbRes.ResponseType | null,
  peopleDetails: async (id: string) => {
    id;
  },
  peopleCombinedCreditsData: null as tmdbRes.ResponseType | null,
  peopleCombinedCredits: async (id: string) => {
    id;
  },
  peopleImagesData: null as tmdbRes.ResponseType | null,
  peopleImages: async (id: string) => {
    id;
  },
  searchPersonData: null as tmdbRes.ResponseType | null,
  searchPerson: async (query: string, page: number) => {
    query;
    page;
  },
});

export const useTMDB = () => useContext(TmdbContext);

export const TMDBProvider = ({ children }: { children: React.ReactNode }) => {
  const [discoverMovieData, setDiscoverMovieData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [discoverTvData, setDiscoverTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [nowPlayingMoviesData, setNowPlayingMoviesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [popularMoviesData, setPopularMoviesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [topRatedMoviesData, setTopRatedMoviesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [upcomingMoviesData, setUpcomingMoviesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [airingTodayTvData, setAiringTodayTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [onTheAirTvData, setOnTheAirTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [popularTvData, setPopularTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [topRatedTvData, setTopRatedTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [trendingAllData, setTrendingAllData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [trendingMoviesData, setTrendingMoviesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [trendingTvData, setTrendingTvData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [movieDetailsData, setMovieDetailsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesDetailsData, setTvSeriesDetailsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [searchMovieData, setSearchMovieData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [searchTvData, setSearchTvData] = useState<tmdbRes.ResponseType | null>(
    null,
  );
  const [movieCreditsData, setMovieCreditsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [movieRecommendationsData, setMovieRecommendationsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesCreditsData, setTvSeriesCreditsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesRecommendationsData, setTvSeriesRecommendationsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeasonsDetailsData, setTvSeasonsDetailsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeasonsCreditsData, setTvSeasonsCreditsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvEpisodeDetailsData, setTvEpisodeDetailsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvEpisodeCreditsData, setTvEpisodeCreditsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [searchMultiData, setSearchMultiData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [searchMultiACData, setSearchMultiACData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [movieImagesData, setMovieImagesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvImagesData, setTvImagesData] = useState<tmdbRes.ResponseType | null>(
    null,
  );
  const [movieTranslationsData, setMovieTranslationsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesTranslationsData, setTvSeriesTranslationsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [movieSimilarData, setMovieSimilarData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesSimilarData, setTvSeriesSimilarData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [movieVideosData, setMovieVideosData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [tvSeriesVideosData, setTvSeriesVideosData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [peopleDetailsData, setPeopleDetailsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [peopleCombinedCreditsData, setPeopleCombinedCreditsData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [peopleImagesData, setPeopleImagesData] =
    useState<tmdbRes.ResponseType | null>(null);
  const [searchPersonData, setSearchPersonData] =
    useState<tmdbRes.ResponseType | null>(null);

  /**
   * Every field on this context is a singleton slot, so two pages — or two
   * navigations to the same page — fetching at once write through the same
   * setter. Whichever response lands last wins, which is why clicking quickly
   * between titles could leave you looking at the one you left. A per-slot
   * ticket lets a superseded response drop itself instead.
   */
  const requestTickets = useRef<Record<string, number>>({});

  /**
   * The tmdb service layer resolves rather than rejects on failure: it returns
   * the axios error. Without this check a rate-limited or failed request is
   * stored as though it were data, so the section renders blank with
   * `isError: false` and only a reload clears it.
   */
  const isRequestFailure = (
    value: unknown,
  ): value is Error & { response?: { status?: number } } =>
    value instanceof Error ||
    (typeof value === "object" && value !== null && "isAxiosError" in value);

  const runRequest = async <T extends NonNullable<tmdbRes.ResponseType["data"]>>(
    slot: string,
    setData: React.Dispatch<React.SetStateAction<tmdbRes.ResponseType | null>>,
    request: () => Promise<unknown>,
  ) => {
    const ticket = (requestTickets.current[slot] ?? 0) + 1;
    requestTickets.current[slot] = ticket;
    const isStale = () => requestTickets.current[slot] !== ticket;

    setData({
      isLoading: true,
      isError: false,
      data: null,
      errorResponse: null,
    });

    try {
      const response = await request();
      if (isStale()) return;
      if (isRequestFailure(response)) {
        setData({
          isLoading: false,
          isError: true,
          data: null,
          // Only a genuine 404 means "no such title"; a network blip or a 429
          // must not render the page as not-found.
          isIncorrect: response.response?.status === 404,
          errorResponse: response.response ?? response,
        });
        return;
      }
      setData({
        isLoading: false,
        isError: false,
        data: response as T,
        errorResponse: null,
      });
    } catch (error) {
      if (isStale()) return;
      setData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  /** Return a slot to idle and retire any request still in flight for it. */
  const clearSlot = (
    slot: string,
    setData: React.Dispatch<React.SetStateAction<tmdbRes.ResponseType | null>>,
  ) => {
    requestTickets.current[slot] = (requestTickets.current[slot] ?? 0) + 1;
    setData({
      isLoading: false,
      isError: false,
      data: null,
      errorResponse: null,
    });
  };

  const searchPerson = async (query: string, page: number) =>
    runRequest<tmdbRes.searchPerson>(
      "SearchPersonData",
      setSearchPersonData,
      () => tmdb.searchPerson(query, page),
    );

  const peopleImages = async (id: string) =>
    runRequest<tmdbRes.images>(
      "PeopleImagesData",
      setPeopleImagesData,
      () => tmdb.peopleImages(id),
    );

  const peopleCombinedCredits = async (id: string) =>
    runRequest<tmdbRes.peopleCombinedCredits>(
      "PeopleCombinedCreditsData",
      setPeopleCombinedCreditsData,
      () => tmdb.peopleCombinedCredits(id),
    );

  const peopleDetails = async (id: string) =>
    runRequest<tmdbRes.peopleDetails>(
      "PeopleDetailsData",
      setPeopleDetailsData,
      () => tmdb.peopleDetails(id),
    );

  const movieImages = async (id: string) =>
    runRequest<tmdbRes.images>(
      "MovieImagesData",
      setMovieImagesData,
      () => tmdb.movieImages(id),
    );

  const tvImages = async (id: string) =>
    runRequest<tmdbRes.images>(
      "TvImagesData",
      setTvImagesData,
      () => tmdb.tvImages(id),
    );

  const movieTranslations = async (id: string) =>
    runRequest<tmdbRes.movieTranslations>(
      "MovieTranslationsData",
      setMovieTranslationsData,
      () => tmdb.movieTranslations(id),
    );

  const tvSeriesTranslations = async (id: string) =>
    runRequest<tmdbRes.tvTranslations>(
      "TvSeriesTranslationsData",
      setTvSeriesTranslationsData,
      () => tmdb.tvTranslations(id),
    );

  const movieSimilar = async (id: string) =>
    runRequest<tmdbRes.DiscoverMovie>(
      "MovieSimilarData",
      setMovieSimilarData,
      () => tmdb.movieSimilar(id),
    );

  const tvSeriesSimilar = async (id: string) =>
    runRequest<tmdbRes.DiscoverTV>(
      "TvSeriesSimilarData",
      setTvSeriesSimilarData,
      () => tmdb.tvSimilar(id),
    );

  const movieVideos = async (id: string) =>
    runRequest<tmdbRes.videos>(
      "MovieVideosData",
      setMovieVideosData,
      () => tmdb.movieVideos(id),
    );

  const tvSeriesVideos = async (id: string) =>
    runRequest<tmdbRes.videos>(
      "TvSeriesVideosData",
      setTvSeriesVideosData,
      () => tmdb.tvVideos(id),
    );

  const searchMultiAC = async (query: string, page: number) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      clearSlot("SearchMultiACData", setSearchMultiACData);
      return;
    }
    return runRequest<tmdbRes.searchMulti>(
      "SearchMultiACData",
      setSearchMultiACData,
      () => tmdb.searchMulti(trimmedQuery, page),
    );
  };
  const searchMulti = async (query: string, page: number) => {
    const trimmedQuery = query.trim();
    // Committing a full search retires whatever the autocomplete had in
    // flight — it used to be parked on `isLoading: true` forever, so the
    // dropdown kept spinning after the results page had already rendered.
    clearSlot("SearchMultiACData", setSearchMultiACData);
    if (!trimmedQuery) {
      clearSlot("SearchMultiData", setSearchMultiData);
      return;
    }
    return runRequest<tmdbRes.searchMulti>(
      "SearchMultiData",
      setSearchMultiData,
      () => tmdb.searchMulti(trimmedQuery, page),
    );
  };
  const tvEpisodeCredits = async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) =>
    runRequest<tmdbRes.tvEpisodeCredits>(
      "TvEpisodeCreditsData",
      setTvEpisodeCreditsData,
      () => tmdb.tvEpisodeCredits(id, seasonNumber, episodeNumber),
    );
  const tvEpisodeDetails = async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) =>
    runRequest<tmdbRes.tvEpisodeDetails>(
      "TvEpisodeDetailsData",
      setTvEpisodeDetailsData,
      () => tmdb.tvEpisodeDetails(id, seasonNumber, episodeNumber),
    );
  const tvSeasonsDetails = async (id: string, seasonNumber: number) =>
    runRequest<tmdbRes.DiscoverTV>(
      "TvSeasonsDetailsData",
      setTvSeasonsDetailsData,
      () => tmdb.tvSeasonsDetails(id, seasonNumber),
    );
  const tvSeasonsCredits = async (id: string, seasonNumber: number) =>
    runRequest<tmdbRes.DiscoverTV>(
      "TvSeasonsCreditsData",
      setTvSeasonsCreditsData,
      () => tmdb.tvSeasonsCredits(id, seasonNumber),
    );
  const tvSeriesRecommendations = async (id: string) =>
    runRequest<tmdbRes.DiscoverTV>(
      "TvSeriesRecommendationsData",
      setTvSeriesRecommendationsData,
      () => tmdb.tvSeriesRecommendations(id),
    );
  const tvSeriesCredits = async (id: string) =>
    runRequest<tmdbRes.movieCredits>(
      "TvSeriesCreditsData",
      setTvSeriesCreditsData,
      () => tmdb.tvSeriesCredits(id),
    );
  const movieRecommendations = async (id: string) =>
    runRequest<tmdbRes.DiscoverMovie>(
      "MovieRecommendationsData",
      setMovieRecommendationsData,
      () => tmdb.movieRecommendations(id),
    );

  const movieCredits = async (id: string) =>
    runRequest<tmdbRes.movieCredits>(
      "MovieCreditsData",
      setMovieCreditsData,
      () => tmdb.movieCredits(id),
    );

  const discoverMovie = async (page: number) =>
    runRequest<tmdbRes.DiscoverMovie>(
      "DiscoverMovieData",
      setDiscoverMovieData,
      () => tmdb.discover("movie", page),
    );
  const discoverTv = async (page: number) =>
    runRequest<tmdbRes.DiscoverTV>(
      "DiscoverTvData",
      setDiscoverTvData,
      () => tmdb.discover("tv", page),
    );
  const nowPlayingMovies = async (page: number) =>
    runRequest<tmdbRes.nowPlayingMovies>(
      "NowPlayingMoviesData",
      setNowPlayingMoviesData,
      () => tmdb.nowPlayingMovies(page),
    );
  const popularMovies = async (page: number) =>
    runRequest<tmdbRes.popularMovies>(
      "PopularMoviesData",
      setPopularMoviesData,
      () => tmdb.popularMovies(page),
    );
  const topRatedMovies = async (page: number) =>
    runRequest<tmdbRes.topRatedMovies>(
      "TopRatedMoviesData",
      setTopRatedMoviesData,
      () => tmdb.topRatedMovies(page),
    );
  const upcomingMovies = async (page: number) =>
    runRequest<tmdbRes.upcomingMovies>(
      "UpcomingMoviesData",
      setUpcomingMoviesData,
      () => tmdb.upcomingMovies(page),
    );
  const airingTodayTv = async (page: number) =>
    runRequest<tmdbRes.airingTodayTV>(
      "AiringTodayTvData",
      setAiringTodayTvData,
      () => tmdb.airingTodayTv(page),
    );
  const onTheAirTv = async (page: number) =>
    runRequest<tmdbRes.onTheAirTV>(
      "OnTheAirTvData",
      setOnTheAirTvData,
      () => tmdb.onTheAirTv(page),
    );
  const popularTv = async (page: number) =>
    runRequest<tmdbRes.popularTV>(
      "PopularTvData",
      setPopularTvData,
      () => tmdb.popularTv(page),
    );
  const topRatedTv = async (page: number) =>
    runRequest<tmdbRes.topRatedTV>(
      "TopRatedTvData",
      setTopRatedTvData,
      () => tmdb.topRatedTv(page),
    );
  const searchMovie = async (query: string, page: number) =>
    runRequest<tmdbRes.searchMovie>(
      "SearchMovieData",
      setSearchMovieData,
      () => tmdb.searchMovie(query, page),
    );
  const searchTv = async (query: string, page: number) =>
    runRequest<tmdbRes.searchTV>(
      "SearchTvData",
      setSearchTvData,
      () => tmdb.searchTv(query, page),
    );
  const trendingAll = async (time: "day" | "week", page: number) =>
    runRequest<tmdbRes.trendingAll>(
      "TrendingAllData",
      setTrendingAllData,
      () => tmdb.trending("all", time, page),
    );
  const trendingMovies = async (time: "day" | "week", page: number) =>
    runRequest<tmdbRes.trendingMovies>(
      "TrendingMoviesData",
      setTrendingMoviesData,
      () => tmdb.trending("movie", time, page),
    );
  const trendingTv = async (time: "day" | "week", page: number) =>
    runRequest<tmdbRes.trendingTV>(
      "TrendingTvData",
      setTrendingTvData,
      () => tmdb.trending("tv", time, page),
    );
  const movie = async (id: string) =>
    runRequest<tmdbRes.movieDetails>(
      "MovieDetailsData",
      setMovieDetailsData,
      () => tmdb.movie(id),
    );
  const tvSeries = async (id: string) =>
    runRequest<tmdbRes.tvDetails>(
      "TvSeriesDetailsData",
      setTvSeriesDetailsData,
      () => tmdb.tv(id),
    );
  return (
    <TmdbContext.Provider
      value={{
        searchPerson,
        searchPersonData,
        peopleDetails,
        peopleDetailsData,
        peopleCombinedCredits,
        peopleCombinedCreditsData,
        peopleImages,
        peopleImagesData,
        movieImages,
        movieImagesData,
        movieSimilar,
        movieSimilarData,
        movieTranslations,
        movieTranslationsData,
        movieVideos,
        movieVideosData,
        tvImages,
        tvImagesData,
        tvSeriesSimilar,
        tvSeriesSimilarData,
        tvSeriesTranslations,
        tvSeriesTranslationsData,
        tvSeriesVideos,
        tvSeriesVideosData,
        searchMultiAC,
        searchMulti,
        searchMultiACData,
        searchMultiData,
        tvEpisodeCredits,
        tvEpisodeCreditsData,
        tvEpisodeDetails,
        tvEpisodeDetailsData,
        tvSeasonsCredits,
        tvSeasonsCreditsData,
        tvSeasonsDetails,
        tvSeasonsDetailsData,
        tvSeriesCredits,
        tvSeriesCreditsData,
        tvSeriesRecommendations,
        tvSeriesRecommendationsData,
        movieRecommendations,
        movieRecommendationsData,
        movieCredits,
        movieCreditsData,
        popularMovies,
        popularTv,
        topRatedMovies,
        topRatedTv,
        upcomingMovies,
        airingTodayTv,
        searchMovie,
        searchTv,
        trendingMovies,
        trendingTv,
        movie,
        tvSeries,
        popularMoviesData,
        popularTvData,
        topRatedMoviesData,
        topRatedTvData,
        upcomingMoviesData,
        airingTodayTvData,
        searchMovieData,
        searchTvData,
        trendingMoviesData,
        trendingTvData,
        movieDetailsData,
        tvSeriesDetailsData,
        discoverMovie,
        discoverMovieData,
        discoverTv,
        discoverTvData,
        nowPlayingMovies,
        nowPlayingMoviesData,
        onTheAirTv,
        onTheAirTvData,
        trendingAll,
        trendingAllData,
      }}
    >
      {children}
    </TmdbContext.Provider>
  );
};
