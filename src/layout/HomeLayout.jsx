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
import { useWatchLater } from "../contexts/WatchLater";
import { useUser } from "../contexts/User";

function HomeLayout() {
  const { allMovies } = useAllMovies();
  const {
    addWatchLater,
    statusAddWatchLater,
    removeWatchLater,
    statusRemoveWatchLater,
  } = useWatchLater();
  const { isLoggedIn, user } = useUser();
  return (
    <div>
      <Header
        addWatchLater={addWatchLater}
        statusAddWatchLater={statusAddWatchLater}
        removeWatchLater={removeWatchLater}
        statusRemoveWatchLater={statusRemoveWatchLater}
        isLoggedIn={isLoggedIn}
        isLoading={allMovies.isLoading}
        movies={allMovies.movies}
        language={language}
        user={user}
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
