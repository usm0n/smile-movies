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
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';

function HomeLayout() {
  const [open, setOpen] = React.useState(true);
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
        <Box sx={{ width: '350px', position: 'fixed', top: '50px', zIndex: '99999999999', right: '10px' }}>
          <Collapse in={open}>
            <Alert
              severity="warning"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              Web saytimiz test rejimda ishlayapti xato va kamchiliklar uzur so'raymiz
            </Alert>
          </Collapse>

        </Box>
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
