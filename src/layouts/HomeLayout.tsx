"use client";

import { useEffect } from "react";
import Event from "../components/home/Event";
import Header from "../components/home/Header";
import Watchlist from "../components/home/Watchlist";
import { useTMDB } from "../context/TMDB";

function HomeLayout() {
  const { topRatedMovies, topRatedMoviesData, topRatedTv, topRatedTvData } =
    useTMDB();
  useEffect(() => {
    topRatedMovies(1);
    topRatedTv(1);
  }, []);
  return (
    <>
      <Header />
      <Event eventTitle="Movies" eventData={topRatedMoviesData} eventType="movie" />
      <Event eventTitle="TV Shows" eventData={topRatedTvData} eventType="tv" />
      <Watchlist />
    </>
  );
}

export default HomeLayout;
