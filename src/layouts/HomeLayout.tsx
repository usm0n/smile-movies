"use client";

import { useEffect } from "react";
import Event from "../components/home/Event";
import Header from "../components/home/Header";
import Watchlist from "../components/home/Watchlist";
import { useTMDB } from "../context/TMDB";

function HomeLayout() {
  const { popularMovies, popularMoviesData, topRatedTv, topRatedTvData } =
    useTMDB();
  useEffect(() => {
    popularMovies(1);
    topRatedTv(1);
  }, []);
  return (
    <>
      <Header />
      <Event eventTitle="Movies" eventData={popularMoviesData} />
      <Event eventTitle="TV Shows" eventData={topRatedTvData} />
      <Watchlist />
    </>
  );
}

export default HomeLayout;
