import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Movies from "../components/Movies";
import Series from "../components/Series";
import NewMovies from "../components/NewMovies";
import Footer from "../components/Footer";
import { useAllMovies } from "../contexts/AllMovies";
import Cartoons from "../components/Cartoons";

function HomeLayout() {
  const { allMovies } = useAllMovies();
  return (
    <div>
      <Header
        isLoading={allMovies.isLoading}
        movies={allMovies.movies}
        language={"uz"}
      />
      <NewMovies
        movies={allMovies.movies}
        isLoading={allMovies.isLoading}
        language={"uz"}
      />
      <Movies allMovies={allMovies} language={"uz"} />
      <Cartoons allMovies={allMovies} language={"uz"} />
      <Series allMovies={allMovies} language={"uz"} />
      {/* <Footer /> */}
    </div>
  );
}

export default HomeLayout;
