import React from "react";
import Header from "../components/Home/header/Header";
import Movies from "../components/Home/main/Movies";
import NewMovies from "../components/Home/main/NewMovies";
import Footer from "../components/Footer/index";
import { useAllMovies } from "../contexts/Movies";
import { language } from "../utilities/defaultFunctions";
import { useWatchLater } from "../contexts/WatchLater";
import { useUser } from "../contexts/User";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar } from "@mui/material";
import { t } from "i18next";

function HomeLayout() {
  const [open, setOpen] = React.useState(
    sessionStorage.getItem("headerAlert") || true
  );
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
      <div className="warning">
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open == true}
        >
          <Alert
            open={false}
            severity="warning"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  sessionStorage.setItem("headerAlert", false);
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              position: "absolute",
              top: "80px",
              width: "350px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Web saytimiz test rejimda ishlayapti xato va kamchiliklar uchun uzur
            so'raymiz
          </Alert>
        </Snackbar>
      </div>
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
