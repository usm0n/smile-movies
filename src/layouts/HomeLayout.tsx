"use client";

import { useEffect, useState } from "react";
import Event from "../components/home/Event";
import Header from "../components/home/Header";
import Watchlist from "../components/home/Watchlist";
import { useTMDB } from "../context/TMDB";
import Container from "../utilities/Container";
import RecentlyWatched from "../components/home/RecentlyWatched";

function HomeLayout() {
  const [eventCategoryMovie, setEventCategoryMovie] =
    useState<string>("topRated");
  const [eventCategoryTv, setEventCategoryTv] = useState<string>("topRated");
  const {
    topRatedMovies,
    topRatedMoviesData,
    topRatedTv,
    topRatedTvData,
    nowPlayingMovies,
    nowPlayingMoviesData,
    airingTodayTv,
    airingTodayTvData,
    popularMovies,
    popularMoviesData,
    upcomingMovies,
    upcomingMoviesData,
    onTheAirTv,
    onTheAirTvData,
    popularTv,
    popularTvData,
  } = useTMDB();
  useEffect(() => {
    switch (eventCategoryMovie) {
      case "topRated":
        topRatedMovies(1);
        break;
      case "nowPlaying":
        nowPlayingMovies(1);
        break;
      case "upcoming":
        upcomingMovies(1);
        break;
      case "popular":
        popularMovies(1);
        break;
      default:
        break;
    }
    switch (eventCategoryTv) {
      case "topRated":
        topRatedTv(1);
        break;
      case "onTheAir":
        onTheAirTv(1);
        break;
      case "airingToday":
        airingTodayTv(1);
        break;
      case "popular":
        popularTv(1);
        break;
      default:
        break;
    }
  }, [eventCategoryMovie, eventCategoryTv]);
  return (
    <>
      <Header />
      <Container>
        <RecentlyWatched/>
        <Event
          eventTitle="Movies"
          eventData={
            eventCategoryMovie == "topRated"
              ? topRatedMoviesData
              : eventCategoryMovie == "nowPlaying"
              ? nowPlayingMoviesData
              : eventCategoryMovie == "upcoming"
              ? upcomingMoviesData
              : popularMoviesData
          }
          eventCategories={["topRated", "nowPlaying", "upcoming", "popular"]}
          setEventCategory={setEventCategoryMovie}
          eventCategory={eventCategoryMovie}
        />
        <Event
          eventTitle="TV Shows"
          eventData={
            eventCategoryTv == "topRated"
              ? topRatedTvData
              : eventCategoryTv == "onTheAir"
              ? onTheAirTvData
              : eventCategoryTv == "airingToday"
              ? airingTodayTvData
              : popularTvData
          }
          eventCategories={["topRated", "onTheAir", "airingToday", "popular"]}
          setEventCategory={setEventCategoryTv}
          eventCategory={eventCategoryTv}
        />
        <Watchlist />
      </Container>
    </>
  );
}

export default HomeLayout;
