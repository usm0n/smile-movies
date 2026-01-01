import { ArrowBackIos, Warning } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  DialogActions,
  IconButton,
  LinearProgress,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Option,
  Select,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useEffect, useState } from "react";
import {
  backdropLoading,
  deviceBrowser,
} from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { StreamServer } from "../../stream-res";

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
  // const { addToWatchlist } = useUsers();
  const { getStreamData, getStream } = useStream();
  const navigate = useNavigate();
  const browser = deviceBrowser();
  const [openWarning, setOpenWarning] = useState(
    browser === "Chrome" ? true : false
  );
  // const [adsWarning, setAdsWarning] = useState(true);
  const [streamServer, setStreamServer] = useState<StreamServer | null>(null)

  // const isTvSE = seasonId && episodeId;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    movieDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading;
  const isIncorrect =
    tvSeriesDetailsData?.isIncorrect || movieDetailsData?.isIncorrect;
  const tvSeriesDetailsDataArr = tvSeriesDetailsData?.data as tvDetails;
  const movieDetailsDataArr = movieDetailsData?.data as movieDetails;
  const tvSeasonsDetailsArr = tvSeasonsDetailsData?.data as tvSeasonsDetails;

  useEffect(() => {
    if (movieType === "movie" && movieId) {
      movie(movieId);
      getStream("movie", movieId);
    } else if (movieType === "tv" && movieId) {
      tvSeries(movieId);
      getStream("tv", movieId, seasonId, episodeId);
      if (seasonId) {
        tvSeasonsDetails(movieId, parseInt(seasonId));
      }
    }
  }, [movieType, movieId, seasonId, episodeId]);

  // useEffect(() => {
  //   window.addEventListener('message', (event) => {
  //     if (event.origin !== 'https://vidsrc.cc') return;

  //     if (event.data && event.data.type === 'PLAYER_EVENT') {
  //       const { event: eventType, currentTime, duration } = event.data.data;
  //       if (isLoggedIn && movieId && movieType && eventType == "time") {
  //         addToWatchlist(
  //           movieType,
  //           movieId,
  //           movieType == "tv"
  //             ? tvSeriesDetailsDataArr?.poster_path
  //             : movieDetailsDataArr?.poster_path,
  //           "watching",
  //           duration,
  //           currentTime,
  //           seasonId ? parseInt(seasonId) : 0,
  //           episodeId ? parseInt(episodeId) : 0
  //         );
  //       }
  //     }
  //   })
  // }, [isLoggedIn, movieId, movieType, seasonId, episodeId, tvSeriesDetailsDataArr, movieDetailsDataArr]);

  return isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : getStreamData.isLoading ? (
    <Box width={"100%"} height={"100vh"}>
      <Modal open={true} sx={{ zIndex: 1002 }}>
        <ModalDialog>
          <LinearProgress thickness={1} />
          <Typography level="h4" sx={{ mb: 2 }}>
            Please wait while we prepare your stream...
          </Typography>
          <Typography>
            This may take a few moments depending on server load and your
            internet connection.
          </Typography>
          <DialogActions>
            <Button color="neutral" variant="soft" onClick={() => navigate(`/${movieType}/${movieId}`)}>
              Go Back
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  ) : !getStreamData.isAvailable && !getStreamData.isLoading ? (
    <Modal open={true} sx={{ zIndex: 1002 }} >
      <ModalDialog color="danger" variant="outlined">
        <ModalClose onClick={() => navigate(`/${movieType}/${movieId}`)} />
        <Typography color="danger" level="h4" startDecorator={<Warning />}>
          Stream Unavailable
        </Typography>
        <Typography sx={{ mt: 2 }}>
          We're sorry, but the stream for this{" "}
          {movieType === "movie" ? "movie" : "TV series episode"} is currently
          unavailable. This could be due to licensing restrictions or temporary
          server issues.
        </Typography>
        <DialogActions>
          <Button
            variant="soft"
            color="neutral"
            onClick={() => navigate(`/${movieType}/${movieId}`)}
          >
            Go Back
          </Button>
          <Button onClick={() => getStream(movieType == "tv" ? "tv" : "movie", movieId!, seasonId, episodeId)} variant="soft" color="danger">
            Try Again
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  ) : streamServer && !getStreamData.isAvailable ? (
    <Modal open={true} sx={{ zIndex: 1002 }}>
      <ModalOverflow>
        <ModalDialog layout="center">
          <Typography level="h4" sx={{ mb: 2 }}>
            Select Stream Server
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Please choose a stream server from the options below to start <br /> PS: <Typography color="primary">Vixsrc</Typography> is recommended for the best experience.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {getStreamData.data?.streams.map((server, index) => (
              <ButtonGroup key={index} variant="outlined" color="neutral" sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button sx={{
                  width: "80%"
                }} key={index} variant="outlined" color={server.name.includes("Vixsrc") ? "primary" : "neutral"} onClick={() => setStreamServer(server)}>
                  {server.name}
                </Button>
                <Button sx={{
                  width: "20%"
                }} disabled variant="outlined" color="primary">
                  {!server.title.split('\n')[1]?.trim?.() ? "N/A" : server.title.split('\n')[1]}
                </Button>
              </ButtonGroup>
            ))}
          </Box>
          <DialogActions>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => navigate(`/${movieType}/${movieId}`)}
            >
              Go Back
            </Button>
          </DialogActions>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
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
      {/* <Modal open={adsWarning} onClose={() => setAdsWarning(false)} sx={{ zIndex: 1003 }}>
        <ModalDialog color="warning" variant="outlined">
          <ModalClose onClick={() => setAdsWarning(false)} />
          <Typography color="warning" level="h4" startDecorator={<Warning />}>
            Advertisement Notice
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Please be aware that the video player may display advertisements
            during playback. These ads are served by our third-party provider to
            support our services. We appreciate your understanding.
          </Typography>
          <Typography sx={{ mt: 1 }} textColor={"neutral.400"}>
            Note: This issue is temporary and will be resolved in the upcoming complete update - <Typography
              sx={{
                color: "rgb(255, 220, 92)",
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(255, 220, 92, 0.5)",
              }}
            >Smile Movies V3</Typography>
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
              onClick={() => setAdsWarning(false)}
              variant="soft"
              color="danger"
            >
              Continue to Video
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal> */}
      <Helmet>
        <title>
          {`${movieType === "movie"
            ? movieDetailsDataArr?.title
            : tvSeriesDetailsDataArr?.name
            }`}{" "}
          - Watch
        </title>
        <meta
          name="description"
          content={`Watch ${movieType === "movie"
            ? movieDetailsDataArr?.title
            : tvSeriesDetailsDataArr?.name
            } on Smile Movies`}
        />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1001,
          width: "100%",
          height: "50px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <IconButton onClick={() => navigate(`/${movieType}/${movieId}`)}>
          <ArrowBackIos />
        </IconButton>
        <Typography level="title-lg" sx={{ margin: "0 auto" }}>
          {movieType === "movie"
            ? movieDetailsDataArr?.title
            : tvSeriesDetailsDataArr?.name}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          top: "55px",
          left: "10px",
          zIndex: 1001,
        }}
      >
        {movieType == "tv" ? (
          <Box sx={{ display: "flex", gap: "5px" }}>
            <Select
              value={parseInt(seasonId!)}
              defaultValue={parseInt(seasonId!)}
              onChange={(_e, v) => {
                navigate(`/${movieType}/${movieId}/${v}/1/watch`);
              }}
            >
              {tvSeriesDetailsDataArr?.seasons
                ?.filter((s) => s?.season_number !== 0)
                .map((s) => (
                  <Option key={s?.id} value={s?.season_number}>
                    {s?.name}
                  </Option>
                ))}
            </Select>
            <Select
              onChange={(_e, v) => {
                navigate(`/${movieType}/${movieId}/${seasonId}/${v}/watch`);
              }}
              defaultValue={parseInt(episodeId!)}
              value={parseInt(episodeId!)}
            >
              {tvSeasonsDetailsArr?.episodes?.map((e) => (
                <Option key={e?.id} value={e?.episode_number}>
                  E{e?.episode_number}: {e?.name}
                </Option>
              ))}
            </Select>
          </Box>
        ) : (
          ""
        )}
      </Box>
      {/* <iframe
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://vidsrc.cc/v2/embed/${movieType}/${movieId}${isTvSE ? `/${seasonId}` : ""
          }${isTvSE ? `/${episodeId}` : ""
          }?startAt=${startAt ? startAt : "0"}`}
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "5px",
          position: "absolute",
          top: 0,
          zIndex: 1000,
        }}
      ></iframe> */}
      <video controls style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        zIndex: 1000,
      }} src={streamServer?.url}></video>
    </Box>
  );
}

export default Watch;
