"use client";

import Event from "../components/home/Event";
import Header from "../components/home/Header";

function HomeLayout() {
  return (
    <>
      <Header />
      <Event eventTitle="Movies - Now Playing" />
      <Event eventTitle="Movies - Popular" />
      <Event eventTitle="Movies - Top Rated" />
      <Event eventTitle="Movies - Upcoming" />
    </>
  );
}

export default HomeLayout;
