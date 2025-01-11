"use client";

import { createContext, useContext, useEffect, useState } from "react";
import tmdb from "../service/api/tmdb.api.service";
import { ResponseType, trendingMovie } from "../interfaces/tmdb";

export const MoviesTMDBContext = createContext<{
  trendingData: ResponseType | null;
  getTrendingData: () => Promise<void>;
}>({
  trendingData: null,
  getTrendingData: async () => {},
});
export const useMoviesTMDB = () => useContext(MoviesTMDBContext);

const MoviesTMDBProvider = ({ children }: { children: React.ReactNode }) => {
  const [trendingData, setTrendingData] = useState<ResponseType | null>(null);

  const getTrendingData = async () => {
    try {
      setTrendingData({
        isLoading: true,
        data: {},
      });
      const response = await tmdb.trending("movie", "week", 1);
      if (response) {
        setTrendingData({
          isLoading: false,
          data: response as trendingMovie,
        });
      } else {
        throw Error("There's no reponse");
      }
    } catch (error) {
      throw Error(`${error}`);
    }
  };

  useEffect(() => {
    getTrendingData();
  }, []);

  return (
    <MoviesTMDBContext.Provider value={{ trendingData, getTrendingData }}>
      {children}
    </MoviesTMDBContext.Provider>
  );
};

export default MoviesTMDBProvider;
