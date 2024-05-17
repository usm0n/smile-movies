import React from "react";
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
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar } from "@mui/material";

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
            sx={{ position: "absolute", top: "80px", width: "350px", display: "flex", alignItems: "center" }}
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
      <Movies allMovies={allMovies} language={language} />
      <Cartoons allMovies={allMovies} language={language} />
      <Series allMovies={allMovies} language={language} />
      <Footer />
    </div>
  );
}

export default HomeLayout;
