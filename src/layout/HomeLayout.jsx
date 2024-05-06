import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Movies from "../components/Movies";
import Series from "../components/Series";
import NewMovies from "../components/NewMovies";
import Footer from "../components/Footer";
import { useAllMovies } from "../contexts/Movies";
import Cartoons from "../components/Cartoons";
import { language } from "../utilities/defaultFunctions";

function HomeLayout() {
  const { allMovies } = useAllMovies();
  return (
    <div>
      <Header
        isLoading={allMovies.isLoading}
        movies={allMovies.movies}
        language={language}
      />
      <NewMovies
        movies={allMovies.movies}
        isLoading={allMovies.isLoading}
        language={language}
      />
      <Movies allMovies={allMovies} language={language} />
      <Cartoons allMovies={allMovies} language={language} />
      <Series allMovies={allMovies} language={language} />
      <Footer />
    </div>
  );
}

export default HomeLayout;
