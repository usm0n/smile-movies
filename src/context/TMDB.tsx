"use client"

import { createContext, useContext, useState } from "react";
import { ResponseType } from "../tmdb-res";

const TmdbContext = createContext({});

export const useTMDB = () => useContext(TmdbContext);

export const TMDBProvider = ({children}: {children: React.ReactNode}) => {
  const [discoverMovie, setDiscoverMovie] = useState<ResponseType | null>(null);
  const [discoverTv, setDiscoverTv] = useState<ResponseType | null>(null);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<ResponseType | null>(null);
  const [popularMovies, setPopularMovies] = useState<ResponseType | null>(null);
  const [topRatedMovies, setTopRatedMovies] = useState<ResponseType | null>(null);
  const [upcomingMovies, setUpcomingMovies] = useState<ResponseType | null>(null);
  const [searchMovie, setSearchMovie] = useState<ResponseType | null>(null);
  return (
    <TmdbContext.Provider value={{}}>
      {children}
    </TmdbContext.Provider>
  );
};