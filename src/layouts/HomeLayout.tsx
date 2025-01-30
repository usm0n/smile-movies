"use client";

import Event from "../components/home/Event";
import Header from "../components/home/Header";
import Watchlist from "../components/home/Watchlist";

function HomeLayout() {
  return (
    <>
      <Header />
      <Event eventTitle="Movies" />
      <Event eventTitle="TV Shows" />
      <Watchlist />
    </>
  );
}

export default HomeLayout;
