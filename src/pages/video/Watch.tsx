import { Warning } from "@mui/icons-material";
import {
  Box,
  Button,
  DialogActions,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useEffect, useState } from "react";
import {
  backdropLoading,
  deviceBrowser,
  deviceName,
  deviceType,
  isLoggedIn,
  trackEvent,
} from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { movieDetails, tvDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useUsers } from "../../context/Users";

function Watch() {
  const {
    tvSeriesDetailsData,
    tvSeries,
    movieDetailsData,
    movie,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
  } = useTMDB();
  const { movieId, movieType, seasonId, episodeId } = useParams();
  const { colorScheme } = useColorScheme();
  const { addToWatchlist } = useUsers();
  const navigate = useNavigate();
  const browser = deviceBrowser();
  const [openWarning, setOpenWarning] = useState(
    browser === "Chrome" ? true : false
  );

  const isTvSE = seasonId && episodeId;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    movieDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading;
  const isIncorrect =
    tvSeriesDetailsData?.isIncorrect || movieDetailsData?.isIncorrect;
  const tvSeriesDetailsDataArr = tvSeriesDetailsData?.data as tvDetails;
  const movieDetailsDataArr = movieDetailsData?.data as movieDetails;

  useEffect(() => {
    if (movieType === "movie" && movieId) {
      movie(movieId);
    } else if (movieType === "tv" && movieId) {
      tvSeries(movieId);
      if (seasonId) {
        tvSeasonsDetails(movieId, parseInt(seasonId));
      }
    }
  }, [movieType, movieId, seasonId]);

  useEffect(() => {
    if (isLoggedIn && movieId && movieType) {
      addToWatchlist(
        movieType,
        movieId,
        movieType == "tv"
          ? tvSeriesDetailsDataArr?.poster_path
          : movieDetailsDataArr?.poster_path
      );
    }
  }, [
    isLoggedIn,
    movieId,
    movieType,
    tvSeriesDetailsDataArr,
    movieDetailsDataArr,
  ]);

  useEffect(() => {
    if (
      movieType &&
      movieId &&
      (movieDetailsDataArr || tvSeriesDetailsDataArr)
    ) {
      trackEvent("Watch Page", {
        title:
          movieType == "movie"
            ? movieDetailsDataArr?.title
            : tvSeriesDetailsDataArr?.name,
        type: movieType,
        id: movieId,
        season: seasonId,
        episode: episodeId,
        isLoggedIn: isLoggedIn,
        device: `${deviceName()}, ${deviceType()}, ${browser}`,
      });
    }
  }, [movieType, movieId, seasonId, episodeId, isLoggedIn]);

  return isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <Modal
        open={openWarning}
        onClose={() => setOpenWarning(false)}
        sx={{ zIndex: 1002 }}
      >
        <ModalDialog color="warning" variant="outlined">
          <ModalClose onClick={() => setOpenWarning(false)} />
          <Typography color="warning" level="h4" startDecorator={<Warning />}>
            Warning - You are using an unsupported browser
          </Typography>
          <Typography sx={{ mt: 2 }}>
            For the best experience, we recommend using browsers like{" "}
            <Link href="https://www.mozilla.org/en-US/firefox/new/">
              Firefox
            </Link>
            ,<Link href="https://www.microsoft.com/en-us/edge">Edge</Link>, or{" "}
            <Link href="https://www.apple.com/safari/">Safari</Link>. Some
            features may not work as expected in Chrome.
          </Typography>
          <DialogActions>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => navigate(`/${movieType}/${movieId}`)}
            >
              Go Back
            </Button>
            <Button
              onClick={() => setOpenWarning(false)}
              variant="soft"
              color="danger"
            >
              Continue Anyway
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Helmet>
        <title>
          {`${
            movieType === "movie"
              ? movieDetailsDataArr?.title
              : tvSeriesDetailsDataArr?.name
          }`}{" "}
          - Watch
        </title>
        <meta
          name="description"
          content={`Watch ${
            movieType === "movie"
              ? movieDetailsDataArr?.title
              : tvSeriesDetailsDataArr?.name
          } on Smile Movies`}
        />
      </Helmet>
      <iframe
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://iframe.pstream.org/embed/tmdb-${movieType}-${movieId}${
          isTvSE ? `/${seasonId}/${episodeId}` : ""
        }?logo=false&tips=false&allinone=true&backlink=https%3A%2F%2Fsmile-movies.uz%2F${movieType}%2F${movieId}`}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "5px",
          position: "absolute",
          top: 0,
          zIndex: 1000,
        }}
      ></iframe>
    </Box>
  );
}

export default Watch;
