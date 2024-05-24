import React from "react";
import Header from "../components/Home/header/Header";
import Movies from "../components/Home/main/Movies";
import NewMovies from "../components/Home/main/NewMovies";
import Footer from "../components/Footer/index";
import { useAllMovies } from "../contexts/Movies";
import { language } from "../utilities/defaultFunctions";
import { useWatchLater } from "../contexts/WatchLater";
import { useUser } from "../contexts/User";
import { t } from "i18next";

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
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("MoviesTitle")}
        MoviesType={"movie"}
        NoMovies={t("NoMovies")}
      />
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("CartoonsTitle")}
        MoviesType={"cartoon"}
        NoMovies={t("NoCartoons")}
      />
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("SeriesTitle")}
        MoviesType={"series"}
        NoMovies={t("NoSeries")}
      />
      <Footer />
    </div>
  );
}

export default HomeLayout;
