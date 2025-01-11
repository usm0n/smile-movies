import React from "react";
import Header from "../components/Home/header/Header";
import Movies from "../components/Home/main/Movies";
import NewMovies from "../components/Home/main/NewMovies";
import Footer from "../components/Footer/index";
import { useAllMovies } from "../contexts/Movies";
import { language } from "../utilities/defaultFunctions";
import { useUser } from "../contexts/User";
import { t } from "i18next";
import { Helmet } from "react-helmet";
import { useMoviesTMDB } from "../contexts/MoviesTMDB";

function HomeLayout() {
  const { allMovies } = useAllMovies();
  const { trendingData } = useMoviesTMDB();
  const { isLoggedIn, user } = useUser();
  return (
    <div>
      <Helmet>
        <meta
          name="description"
          content="O'zingizga yoqqan sifat va tilda serial va multfilmlarni tomosha qiling - Smile Movies"
        />
        <meta
          name="keywords"
          content="Tarjima kinolar, Hind kinolar, HD original kesilmagan, Ujas kinolar, Jangari kinolar, O'zbek tilida, Uzbekcha tarjima kino, 2024 yangi kinolar, Ingliz tilida, Rus tilida"
        />
      </Helmet>
      <Header
        isLoggedIn={isLoggedIn}
        isLoading={trendingData?.isLoading}
        movies={trendingData?.data}
        language={language}
        user={user}
      />
      <NewMovies movies={allMovies.movies} isLoading={allMovies.isLoading} />
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("MoviesTitle")}
        MovieType={"movie"}
        NoMovies={t("NoMovies")}
        MoviesType={"movies"}
      />
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("CartoonsTitle")}
        MovieType={"cartoon"}
        NoMovies={t("NoCartoons")}
        MoviesType={"cartoons"}
      />
      <Movies
        allMovies={allMovies}
        language={language}
        MoviesTitle={t("SeriesTitle")}
        MovieType={"series"}
        NoMovies={t("NoSeries")}
        MoviesType={"series"}
      />
      <Footer />
    </div>
  );
}

export default HomeLayout;
