import React, { createContext, useContext, useState } from "react";
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

  const peopleImages = async (id: string) => {
    try {
      setPeopleImagesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.peopleImages(id);
      if (response) {
        setPeopleImagesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.images,
          errorResponse: null,
        });
      }
    } catch (error) {
      setPeopleImagesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const peopleCombinedCredits = async (id: string) => {
    try {
      setPeopleCombinedCreditsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.peopleCombinedCredits(id);
      if (response) {
        setPeopleCombinedCreditsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.peopleCombinedCredits,
          errorResponse: null,
        });
      }
    } catch (error) {
      setPeopleCombinedCreditsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const peopleDetails = async (id: string) => {
    try {
      setPeopleDetailsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.peopleDetails(id);
      if (response) {
        setPeopleDetailsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.peopleDetails,
          errorResponse: null,
        });
      }
    } catch (error) {
      setPeopleDetailsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const movieImages = async (id: string) => {
    try {
      setMovieImagesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieImages(id);
      if (response) {
        setMovieImagesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.images,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieImagesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const tvImages = async (id: string) => {
    try {
      setTvImagesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvImages(id);
      if (response) {
        setTvImagesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.images,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvImagesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const movieTranslations = async (id: string) => {
    try {
      setMovieTranslationsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieTranslations(id);
      if (response) {
        setMovieTranslationsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.movieTranslations,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieTranslationsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const tvSeriesTranslations = async (id: string) => {
    try {
      setTvSeriesTranslationsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvTranslations(id);
      if (response) {
        setTvSeriesTranslationsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.tvTranslations,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeriesTranslationsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const movieSimilar = async (id: string) => {
    try {
      setMovieSimilarData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieSimilar(id);
      if (response) {
        setMovieSimilarData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverMovie,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieSimilarData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const tvSeriesSimilar = async (id: string) => {
    try {
      setTvSeriesSimilarData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvSimilar(id);
      if (response) {
        setTvSeriesSimilarData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeriesSimilarData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const movieVideos = async (id: string) => {
    try {
      setMovieVideosData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieVideos(id);
      if (response) {
        setMovieVideosData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.videos,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieVideosData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const tvSeriesVideos = async (id: string) => {
    try {
      setTvSeriesVideosData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvVideos(id);
      if (response) {
        setTvSeriesVideosData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.videos,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeriesVideosData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const searchMultiAC = async (query: string, page: number) => {
    try {
      setSearchMultiACData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.searchMulti(query, page);
      if (response) {
        setSearchMultiACData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.searchMulti,
          errorResponse: null,
        });
      }
    } catch (error) {
      setSearchMultiACData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const searchMulti = async (query: string, page: number) => {
    try {
      setSearchMultiData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      setSearchMultiACData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.searchMulti(query, page);
      if (response) {
        setSearchMultiData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.searchMulti,
          errorResponse: null,
        });
      }
    } catch (error) {
      setSearchMultiData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvEpisodeCredits = async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    try {
      setTvEpisodeCreditsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvEpisodeCredits(
        id,
        seasonNumber,
        episodeNumber,
      );
      if (response) {
        setTvEpisodeCreditsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.tvEpisodeCredits,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvEpisodeCreditsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvEpisodeDetails = async (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    try {
      setTvEpisodeDetailsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvEpisodeDetails(
        id,
        seasonNumber,
        episodeNumber,
      );
      if (!("response" in response)) {
        setTvEpisodeDetailsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.tvEpisodeDetails,
          errorResponse: null,
        });
      } else {
        setTvEpisodeDetailsData({
          isLoading: false,
          isError: true,
          data: null,
          errorResponse: response.response,
          isIncorrect: true,
        });
      }
    } catch (error) {
      setTvEpisodeDetailsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
        isIncorrect: true,
      });
    }
  };
  const tvSeasonsDetails = async (id: string, seasonNumber: number) => {
    try {
      setTvSeasonsDetailsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvSeasonsDetails(id, seasonNumber);
      if (!("response" in response)) {
        setTvSeasonsDetailsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverTV,
          errorResponse: null,
        });
      } else {
        setTvSeasonsDetailsData({
          isLoading: false,
          isError: true,
          data: null,
          errorResponse: response.response,
          isIncorrect: true,
        });
      }
    } catch (error) {
      setTvSeasonsDetailsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvSeasonsCredits = async (id: string, seasonNumber: number) => {
    try {
      setTvSeasonsCreditsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvSeasonsCredits(id, seasonNumber);
      if (response) {
        setTvSeasonsCreditsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeasonsCreditsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvSeriesRecommendations = async (id: string) => {
    try {
      setTvSeriesRecommendationsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvSeriesRecommendations(id);
      if (response) {
        setTvSeriesRecommendationsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeriesRecommendationsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvSeriesCredits = async (id: string) => {
    try {
      setTvSeriesCreditsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tvSeriesCredits(id);
      if (response) {
        setTvSeriesCreditsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.movieCredits,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTvSeriesCreditsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const movieRecommendations = async (id: string) => {
    try {
      setMovieRecommendationsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieRecommendations(id);
      if (response) {
        setMovieRecommendationsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverMovie,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieRecommendationsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const movieCredits = async (id: string) => {
    try {
      setMovieCreditsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movieCredits(id);
      if (response) {
        setMovieCreditsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.movieCredits,
          errorResponse: null,
        });
      }
    } catch (error) {
      setMovieCreditsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };

  const discoverMovie = async (page: number) => {
    try {
      setDiscoverMovieData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.discover("movie", page);
      if (response) {
        setDiscoverMovieData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverMovie,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDiscoverMovieData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const discoverTv = async (page: number) => {
    try {
      setDiscoverTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.discover("tv", page);
      if (response) {
        setDiscoverTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.DiscoverTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setDiscoverTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const nowPlayingMovies = async (page: number) => {
    try {
      setNowPlayingMoviesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.nowPlayingMovies(page);
      if (response) {
        setNowPlayingMoviesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.nowPlayingMovies,
          errorResponse: null,
        });
      }
    } catch (error) {
      setNowPlayingMoviesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const popularMovies = async (page: number) => {
    try {
      setPopularMoviesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.popularMovies(page);
      if (response) {
        setPopularMoviesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.popularMovies,
          errorResponse: null,
        });
      }
    } catch (error) {
      setPopularMoviesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const topRatedMovies = async (page: number) => {
    try {
      setTopRatedMoviesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.topRatedMovies(page);
      if (response) {
        setTopRatedMoviesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.topRatedMovies,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTopRatedMoviesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const upcomingMovies = async (page: number) => {
    try {
      setUpcomingMoviesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.upcomingMovies(page);
      if (response) {
        setUpcomingMoviesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.upcomingMovies,
          errorResponse: null,
        });
      }
    } catch (error) {
      setUpcomingMoviesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const airingTodayTv = async (page: number) => {
    try {
      setAiringTodayTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.airingTodayTv(page);
      if (response) {
        setAiringTodayTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.airingTodayTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setAiringTodayTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const onTheAirTv = async (page: number) => {
    try {
      setOnTheAirTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.onTheAirTv(page);
      if (response) {
        setOnTheAirTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.onTheAirTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setOnTheAirTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const popularTv = async (page: number) => {
    try {
      setPopularTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.popularTv(page);
      if (response) {
        setPopularTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.popularTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setPopularTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const topRatedTv = async (page: number) => {
    try {
      setTopRatedTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.topRatedTv(page);
      if (response) {
        setTopRatedTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.topRatedTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTopRatedTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const searchMovie = async (query: string, page: number) => {
    try {
      setSearchMovieData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.searchMovie(query, page);
      if (response) {
        setSearchMovieData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.searchMovie,
          errorResponse: null,
        });
      }
    } catch (error) {
      setSearchMovieData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const searchTv = async (query: string, page: number) => {
    try {
      setSearchTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.searchTv(query, page);
      if (response) {
        setSearchTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.searchTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setSearchTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const trendingAll = async (time: "day" | "week", page: number) => {
    try {
      setTrendingAllData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.trending("all", time, page);
      if (response) {
        setTrendingAllData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.trendingAll,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTrendingAllData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const trendingMovies = async (time: "day" | "week", page: number) => {
    try {
      setTrendingMoviesData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.trending("movie", time, page);
      if (response) {
        setTrendingMoviesData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.trendingMovies,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTrendingMoviesData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const trendingTv = async (time: "day" | "week", page: number) => {
    try {
      setTrendingTvData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.trending("tv", time, page);
      if (response) {
        setTrendingTvData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.trendingTV,
          errorResponse: null,
        });
      }
    } catch (error) {
      setTrendingTvData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const movie = async (id: string) => {
    try {
      setMovieDetailsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.movie(id);
      if (!("response" in response)) {
        setMovieDetailsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.movieDetails,
          errorResponse: null,
        });
      } else {
        setMovieDetailsData({
          isLoading: false,
          isError: true,
          data: null,
          isIncorrect: true,
          errorResponse: response.response,
        });
      }
    } catch (error) {
      setMovieDetailsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  const tvSeries = async (id: string) => {
    try {
      setTvSeriesDetailsData({
        isLoading: true,
        isError: false,
        data: null,
        errorResponse: null,
      });
      const response = await tmdb.tv(id);
      if (!("response" in response)) {
        setTvSeriesDetailsData({
          isLoading: false,
          isError: false,
          data: response as tmdbRes.tvDetails,
          errorResponse: null,
        });
      } else {
        setTvSeriesDetailsData({
          isLoading: false,
          isError: true,
          data: null,
          isIncorrect: true,
          errorResponse: response.response,
        });
      }
    } catch (error) {
      setTvSeriesDetailsData({
        isLoading: false,
        isError: true,
        data: null,
        errorResponse: error,
      });
    }
  };
  return (
    <TmdbContext.Provider
      value={{
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
