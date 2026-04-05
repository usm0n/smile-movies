import { ArrowBackIos, Warning } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  DialogActions,
  Divider,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { backdropLoading, isLoggedIn } from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { StreamServer } from "../../stream-res";
import { useUsers } from "../../context/Users";
import StorageIcon from "@mui/icons-material/Storage";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import { User } from "../../user";

const AUTO_SAVE_INTERVAL_MS = 30000;
const MIN_PROGRESS_DELTA_MINUTES = 0.5;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;

const normalizePlayerMinutes = (currentTime?: number, duration?: number) => {
  const current = Number(currentTime) || 0;
  const total = Number(duration) || 0;

  if (!current && !total) {
    return { currentMinutes: 0, durationMinutes: 0 };
  }

  if (total > 360 || current > 360) {
    return {
      currentMinutes: current / 60,
      durationMinutes: total / 60,
    };
  }

  return {
    currentMinutes: current,
    durationMinutes: total,
  };
};

function Watch() {
  const {
    tvSeriesDetailsData,
    tvSeries,
    movieDetailsData,
    movie,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
  } = useTMDB();
  const { movieId, movieType, seasonId, episodeId, startAt } = useParams();
  const { colorScheme } = useColorScheme();
  const { getStreamData, getStream } = useStream();
  const { addToWatchlist, myselfData } = useUsers();
  const navigate = useNavigate();
  const [streamServer, setStreamServer] = useState<StreamServer | null>(null);
  const [streamType, setStreamType] = useState<"WADS" | "WOADS">("WADS");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef({
    iframeSessionStartAt: 0,
    accumulatedMinutes: 0,
    lastSavedAt: 0,
    lastSavedProgressMinutes: 0,
    lastKnownProgressMinutes: 0,
    playerEventsSeen: false,
    isIframeActive: false,
  });

  const isTvSE = seasonId && episodeId;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    movieDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading;
  const isIncorrect =
    tvSeriesDetailsData?.isIncorrect || movieDetailsData?.isIncorrect;
  const tvSeriesDetailsDataArr = tvSeriesDetailsData?.data as tvDetails;
  const movieDetailsDataArr = movieDetailsData?.data as movieDetails;
  const tvSeasonsDetailsArr = tvSeasonsDetailsData?.data as tvSeasonsDetails;
  const watchlistItem = (myselfData?.data as User)?.watchlist?.find(
    (item) => item.id === movieId && item.type === movieType,
  );
  const activeEpisodeData = tvSeasonsDetailsArr?.episodes?.find(
    (episode) => episode?.episode_number === Number(episodeId),
  );
  const mediaTitle =
    movieType === "tv"
      ? tvSeriesDetailsDataArr?.name || ""
      : movieDetailsDataArr?.title || "";
  const mediaPoster =
    movieType === "tv"
      ? tvSeriesDetailsDataArr?.poster_path
      : movieDetailsDataArr?.poster_path;
  const fallbackDurationMinutes = useMemo(() => {
    if (movieType === "tv") {
      return (
        Number(activeEpisodeData?.runtime) ||
        Number(tvSeriesDetailsDataArr?.episode_run_time?.[0]) ||
        0
      );
    }

    return Number(movieDetailsDataArr?.runtime) || 0;
  }, [activeEpisodeData?.runtime, movieDetailsDataArr?.runtime, movieType, tvSeriesDetailsDataArr?.episode_run_time]);
  const initialProgressMinutes = useMemo(() => {
    const startAtMinutes = Number(startAt) || 0;
    if (startAtMinutes > 0) return startAtMinutes;

    if (!watchlistItem) return 0;
    if (movieType === "movie") return Number(watchlistItem.currentTime) || 0;

    const sameEpisode =
      Number(watchlistItem.season) === Number(seasonId || 0) &&
      Number(watchlistItem.episode) === Number(episodeId || 0);

    return sameEpisode ? Number(watchlistItem.currentTime) || 0 : 0;
  }, [episodeId, movieType, seasonId, startAt, watchlistItem]);

  const syncIframeElapsed = () => {
    if (!progressRef.current.isIframeActive || !progressRef.current.iframeSessionStartAt) {
      return;
    }

    const now = Date.now();
    const elapsedMinutes =
      (now - progressRef.current.iframeSessionStartAt) / 60000;

    if (elapsedMinutes > 0) {
      progressRef.current.accumulatedMinutes += elapsedMinutes;
      progressRef.current.lastKnownProgressMinutes =
        initialProgressMinutes + progressRef.current.accumulatedMinutes;
    }

    progressRef.current.iframeSessionStartAt = now;
  };

  const setIframeTrackingActive = (isActive: boolean) => {
    if (streamType !== "WADS") return;

    if (isActive) {
      if (!progressRef.current.isIframeActive) {
        progressRef.current.isIframeActive = true;
        progressRef.current.iframeSessionStartAt = Date.now();
      }
      return;
    }

    if (progressRef.current.isIframeActive) {
      syncIframeElapsed();
      progressRef.current.isIframeActive = false;
      progressRef.current.iframeSessionStartAt = 0;
    }
  };

  const getCurrentProgressMinutes = () => {
    if (streamType === "WOADS" && videoRef.current) {
      return Math.max(0, videoRef.current.currentTime / 60);
    }

    if (progressRef.current.playerEventsSeen) {
      return progressRef.current.lastKnownProgressMinutes;
    }

    if (progressRef.current.isIframeActive) {
      const now = Date.now();
      const liveMinutes =
        (now - progressRef.current.iframeSessionStartAt) / 60000;
      return initialProgressMinutes + progressRef.current.accumulatedMinutes + Math.max(0, liveMinutes);
    }

    return initialProgressMinutes + progressRef.current.accumulatedMinutes;
  };

  const persistProgress = async (
    rawProgressMinutes: number,
    rawDurationMinutes?: number,
    forceStatus?: "watching" | "watched",
  ) => {
    if (!isLoggedIn || !movieId || !movieType) return;

    const durationMinutes = Math.max(
      rawDurationMinutes || fallbackDurationMinutes || 0,
      rawProgressMinutes,
      fallbackDurationMinutes ? 0 : rawProgressMinutes,
    );
    const boundedProgressMinutes = Math.max(
      0,
      durationMinutes > 0
        ? Math.min(rawProgressMinutes, durationMinutes)
        : rawProgressMinutes,
    );
    const progressRatio =
      durationMinutes > 0 ? boundedProgressMinutes / durationMinutes : 0;
    const resolvedStatus = forceStatus
      ? forceStatus
      : progressRatio >= 0.9
        ? "watched"
        : "watching";
    const nextProgressMinutes =
      resolvedStatus === "watched" && durationMinutes > 0
        ? durationMinutes
        : boundedProgressMinutes;

    if (
      resolvedStatus !== "watched" &&
      nextProgressMinutes < MIN_PROGRESS_TO_SAVE_MINUTES
    ) {
      return;
    }

    const now = Date.now();
    const progressDelta = Math.abs(
      nextProgressMinutes - progressRef.current.lastSavedProgressMinutes,
    );
    if (
      !forceStatus &&
      now - progressRef.current.lastSavedAt < AUTO_SAVE_INTERVAL_MS &&
      progressDelta < MIN_PROGRESS_DELTA_MINUTES
    ) {
      return;
    }

    progressRef.current.lastSavedAt = now;
    progressRef.current.lastSavedProgressMinutes = nextProgressMinutes;
    progressRef.current.lastKnownProgressMinutes = nextProgressMinutes;

    await addToWatchlist(
      movieType,
      movieId,
      mediaPoster || "",
      mediaTitle,
      resolvedStatus,
      durationMinutes,
      nextProgressMinutes,
      seasonId ? parseInt(seasonId) : 0,
      episodeId ? parseInt(episodeId) : 0,
    );
  };

  const episodeChange = (n: string) => {
    void persistProgress(getCurrentProgressMinutes(), fallbackDurationMinutes);
    setIframeTrackingActive(false);
    setStreamServer(null);
    navigate(n);
  };

  useEffect(() => {
    if (!movieId || !movieType) return;
    const fetchStream = (type: "movie" | "tv") => {
      if (streamType === "WADS") {
        setStreamServer(null);
        return;
      }
      getStream(type, movieId, seasonId, episodeId);
    };

    if (movieType === "movie") {
      movie(movieId);
      fetchStream("movie");
    } else if (movieType === "tv") {
      tvSeries(movieId);
      fetchStream("tv");
      if (seasonId) {
        tvSeasonsDetails(movieId, parseInt(seasonId));
      }
    }
  }, [movieType, movieId, seasonId, episodeId, streamType]);

  useEffect(() => {
    progressRef.current = {
      iframeSessionStartAt: 0,
      accumulatedMinutes: 0,
      lastSavedAt: 0,
      lastSavedProgressMinutes: initialProgressMinutes,
      lastKnownProgressMinutes: initialProgressMinutes,
      playerEventsSeen: false,
      isIframeActive: false,
    };
  }, [initialProgressMinutes, movieId, movieType, seasonId, episodeId, streamType]);

  useEffect(() => {
    let lastUpdateTime = 0;

    const handleMessage = (event: any) => {
      if (
        event.origin !== "https://vidsrc.cc" &&
        event.origin !== "https://www.vidsrc.cc"
      ) {
        return;
      }

      if (event.data?.type === "PLAYER_EVENT") {
        const { event: eventType, currentTime, duration } = event.data.data;
        const { currentMinutes, durationMinutes } = normalizePlayerMinutes(
          currentTime,
          duration,
        );
        const progress =
          durationMinutes && Number(durationMinutes) > 0
            ? Number(currentMinutes) / Number(durationMinutes)
            : 0;
        const resolvedStatus =
          eventType === "ended" || progress >= 0.9 ? "watched" : "watching";
        progressRef.current.playerEventsSeen = true;
        progressRef.current.lastKnownProgressMinutes =
          resolvedStatus === "watched" && durationMinutes > 0
            ? durationMinutes
            : currentMinutes;

        const now = Date.now();
        if (
          isLoggedIn &&
          movieId &&
          (eventType === "time" || eventType === "ended") &&
          (eventType === "ended" || now - lastUpdateTime > 15000)
        ) {
          lastUpdateTime = now;

          void persistProgress(
            currentMinutes,
            durationMinutes,
            resolvedStatus,
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // CLEANUP: Removes the listener so they don't stack up
    return () => window.removeEventListener("message", handleMessage);
  }, [
    fallbackDurationMinutes,
    isLoggedIn,
    movieId,
    movieType,
    seasonId,
    episodeId,
    mediaPoster,
    mediaTitle,
    initialProgressMinutes,
  ]);

  useEffect(() => {
    if (streamType !== "WADS") {
      setIframeTrackingActive(false);
      return;
    }

    const flushProgress = () => {
      syncIframeElapsed();
      void persistProgress(getCurrentProgressMinutes(), fallbackDurationMinutes);
    };

    const syncVisibility = () => {
      const isVisible = document.visibilityState === "visible";
      if (isVisible) {
        setIframeTrackingActive(true);
      } else {
        setIframeTrackingActive(false);
        flushProgress();
      }
    };

    syncVisibility();
    const interval = window.setInterval(() => {
      if (!progressRef.current.playerEventsSeen) {
        syncIframeElapsed();
        void persistProgress(getCurrentProgressMinutes(), fallbackDurationMinutes);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    window.addEventListener("focus", syncVisibility);
    window.addEventListener("blur", flushProgress);
    window.addEventListener("pagehide", flushProgress);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      window.clearInterval(interval);
      flushProgress();
      window.removeEventListener("focus", syncVisibility);
      window.removeEventListener("blur", flushProgress);
      window.removeEventListener("pagehide", flushProgress);
      document.removeEventListener("visibilitychange", syncVisibility);
      setIframeTrackingActive(false);
    };
  }, [fallbackDurationMinutes, initialProgressMinutes, streamType]);

  const handleNativeLoadedMetadata = () => {
    if (!videoRef.current) return;

    const startAtMinutes = Math.max(0, initialProgressMinutes);
    if (startAtMinutes > 0) {
      videoRef.current.currentTime = startAtMinutes * 60;
    }
  };

  const handleNativeTimeUpdate = () => {
    if (!videoRef.current) return;
    const progressMinutes = videoRef.current.currentTime / 60;
    const durationMinutes = videoRef.current.duration
      ? videoRef.current.duration / 60
      : fallbackDurationMinutes;
    progressRef.current.lastKnownProgressMinutes = progressMinutes;
    void persistProgress(progressMinutes, durationMinutes);
  };

  const handleNativeEnded = () => {
    if (!videoRef.current) return;
    const durationMinutes = videoRef.current.duration
      ? videoRef.current.duration / 60
      : fallbackDurationMinutes;
    void persistProgress(durationMinutes, durationMinutes, "watched");
  };


  return isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : getStreamData.isLoading && streamType == "WOADS" ? (
    <Box width={"100%"} height={"100vh"}>
      <Modal open={true} sx={{ zIndex: 1002 }}>
        <ModalDialog>
          <LinearProgress thickness={1} />
          <Typography level="h3">Please wait...</Typography>
          <Typography>
            We are preparing your stream. This may take a few moments depending
            on server load and your internet connection.
          </Typography>
          <DialogActions>
            <Button
              color="neutral"
              variant="soft"
              onClick={() => navigate(`/${movieType}/${movieId}`)}
            >
              Go Back
            </Button>
          </DialogActions>
          <Divider>or</Divider>
          <Link
            onClick={() => setStreamType("WADS")}
            sx={{
              margin: "0 auto",
            }}
          >
            Continue with ADS(recommended)
          </Link>
        </ModalDialog>
      </Modal>
    </Box>
  ) : !getStreamData.isAvailable &&
    !getStreamData.isLoading &&
    streamType == "WOADS" ? (
    <Modal open={true} sx={{ zIndex: 1002 }}>
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
          <Button
            onClick={() =>
              getStream(
                movieType == "tv" ? "tv" : "movie",
                movieId!,
                seasonId,
                episodeId,
              )
            }
            variant="soft"
            color="danger"
          >
            Try Again
          </Button>
        </DialogActions>
        <Divider>or</Divider>
        <Link
          onClick={() => setStreamType("WADS")}
          sx={{
            margin: "0 auto",
          }}
        >
          Try with ADS(recommended)
        </Link>
      </ModalDialog>
    </Modal>
  ) : !streamServer && getStreamData.isAvailable && streamType == "WOADS" ? (
    <Modal open={true} sx={{ zIndex: 1002 }}>
      <ModalOverflow>
        <ModalDialog layout="center">
          <Typography level="h4" sx={{ mb: 2 }}>
            Select Stream Server
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Please choose a stream server from the options below to start <br />{" "}
            PS: <Typography color="primary">Vixsrc</Typography> is recommended
            for the best experience.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {getStreamData.data?.streams.map((server, index) => (
              <ButtonGroup
                key={index}
                variant="outlined"
                color="neutral"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  sx={{
                    width: "80%",
                  }}
                  key={index}
                  variant="outlined"
                  color={server.name.includes("Vixsrc") ? "primary" : "neutral"}
                  onClick={() => setStreamServer(server)}
                >
                  {server.name}
                </Button>
                <Button
                  sx={{
                    width: "20%",
                  }}
                  disabled
                  variant="outlined"
                  color="primary"
                >
                  {!server.title.split("\n")[1]?.trim?.()
                    ? "N/A"
                    : server.title.split("\n")[1]}
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
          <Divider>or</Divider>
          <Link
            onClick={() => setStreamType("WADS")}
            sx={{
              margin: "0 auto",
            }}
          >
            Continue with ADS(recommended)
          </Link>
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
      {/* <Modal
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
      </Modal> */}
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
        <IconButton
          onClick={() => {
            streamType === "WADS"
              ? setStreamType("WOADS")
              : setStreamType("WADS");
          }}
        >
          {streamType === "WOADS" ? <LiveTvIcon /> : <StorageIcon />}
        </IconButton>
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
                episodeChange(`/${movieType}/${movieId}/${v}/1/watch`);
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
                episodeChange(
                  `/${movieType}/${movieId}/${seasonId}/${v}/watch`,
                );
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
      {streamType == "WADS" ? (
        <iframe
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-same-origin allow-scripts"
          src={`https://vidsrc.cc/v2/embed/${movieType}/${movieId}${
            isTvSE ? `/${seasonId}` : ""
          }${isTvSE ? `/${episodeId}` : ""}`}
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
        ></iframe>
      ) : (
        <video
          ref={videoRef}
          controls
          onLoadedMetadata={handleNativeLoadedMetadata}
          onTimeUpdate={handleNativeTimeUpdate}
          onPause={handleNativeTimeUpdate}
          onEnded={handleNativeEnded}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            zIndex: 1000,
          }}
          src={streamServer?.url}
        ></video>
      )}
    </Box>
  );
}

export default Watch;
