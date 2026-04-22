import { ArrowBackIos, Warning } from "@mui/icons-material";
import {
  Box,
  Button,
  DialogActions,
  IconButton,
  LinearProgress,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  backdropLoading,
  copyToClipboard,
  isLoggedIn,
} from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { StreamServer } from "../../stream-res";
import { useUsers } from "../../context/Users";
import StorageIcon from "@mui/icons-material/Storage";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { User } from "../../user";
import PlaybackSurface from "../../components/player/PlaybackSurface";
import {
  isLikelyDownloadSource,
  isWebReadyInternalServer,
  resolvePlaybackMode,
  selectRecommendedInternalServer,
} from "../../player/resolvePlayback";
import { PlaybackMode } from "../../player/types";
import { playbackAPI } from "../../service/api/smb/playback.api.service";

const AUTO_SAVE_INTERVAL_MS = 60000;
const MIN_PROGRESS_DELTA_MINUTES = 1;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;
const SESSION_PROGRESS_PREFIX = "watch-progress:";

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
  const { colorScheme } = useColorScheme();
  const { movieId, movieType, seasonId, episodeId, startAt } = useParams();
  const { getStreamData, getStream } = useStream();
  const { addToWatchlist, myselfData } = useUsers();
  const navigate = useNavigate();
  const [preferredMode, setPreferredMode] = useState<PlaybackMode>("external");
  const [streamServer, setStreamServer] = useState<StreamServer | null>(null);
  const [downloadSourcesOpen, setDownloadSourcesOpen] = useState(false);
  const [adsWarning, setAdsWarning] = useState(true);
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
  const playbackSessionRef = useRef({
    id: "",
    signature: "",
    requestedSignature: "",
    isCompleted: false,
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
  const sessionProgressKey =
    movieId && movieType
      ? `${SESSION_PROGRESS_PREFIX}${movieType}:${movieId}:${seasonId || 0}:${episodeId || 0}`
      : "";
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
  const [sessionBaseProgress, setSessionBaseProgress] = useState(0);
  const [sessionBaseReady, setSessionBaseReady] = useState(false);
  const availableStreams = getStreamData.data?.streams || [];
  const webReadyStreams = useMemo(
    () => availableStreams.filter((server) => isWebReadyInternalServer(server)),
    [availableStreams],
  );
  const downloadSources = useMemo(
    () => availableStreams.filter((server) => isLikelyDownloadSource(server)),
    [availableStreams],
  );
  const recommendedStreamServer = useMemo(
    () => selectRecommendedInternalServer(availableStreams),
    [availableStreams],
  );
  const selectedStreamServer = useMemo(() => {
    if (
      streamServer &&
      webReadyStreams.some((server) => server.url === streamServer.url)
    ) {
      return streamServer;
    }

    return recommendedStreamServer;
  }, [recommendedStreamServer, streamServer, webReadyStreams]);
  const resolvedPlayback = useMemo(
    () =>
      resolvePlaybackMode({
        preferredMode,
        recommendedServer: selectedStreamServer,
        streams: availableStreams,
      }),
    [availableStreams, preferredMode, selectedStreamServer],
  );
  const playbackMode = resolvedPlayback.mode;
  const playbackFallbackReason = resolvedPlayback.fallbackReason;
  const usingInternalPlayback = playbackMode === "internal";
  const usingExternalPlayback = playbackMode === "external";
  const isPreparingInternalPlayback =
    preferredMode === "internal" && getStreamData.isLoading;

  useEffect(() => {
    setPreferredMode("external");
    setStreamServer(null);
    setSessionBaseProgress(0);
    setSessionBaseReady(false);
    playbackSessionRef.current = {
      id: "",
      signature: "",
      requestedSignature: "",
      isCompleted: false,
    };
  }, [sessionProgressKey]);

  useEffect(() => {
    if (sessionBaseReady || !movieId || !movieType) return;

    const routeProgress = Number(startAt) || 0;
    if (routeProgress > 0) {
      setSessionBaseProgress(routeProgress);
      setSessionBaseReady(true);
      return;
    }

    if (myselfData?.isLoading) return;

    let persistedSessionProgress = 0;
    if (typeof window !== "undefined" && sessionProgressKey) {
      persistedSessionProgress =
        Number(sessionStorage.getItem(sessionProgressKey) || 0) || 0;
    }

    let watchlistProgress = 0;
    if (watchlistItem) {
      if (movieType === "movie") {
        watchlistProgress = Number(watchlistItem.currentTime) || 0;
      } else {
        const sameEpisode =
          Number(watchlistItem.season) === Number(seasonId || 0) &&
          Number(watchlistItem.episode) === Number(episodeId || 0);

        watchlistProgress = sameEpisode
          ? Number(watchlistItem.currentTime) || 0
          : 0;
      }
    }

    setSessionBaseProgress(
      Math.max(routeProgress, watchlistProgress, persistedSessionProgress, 0),
    );
    setSessionBaseReady(true);
  }, [
    episodeId,
    movieId,
    movieType,
    myselfData?.isLoading,
    seasonId,
    sessionBaseReady,
    sessionProgressKey,
    startAt,
    watchlistItem,
  ]);

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
        sessionBaseProgress + progressRef.current.accumulatedMinutes;
      if (typeof window !== "undefined" && sessionProgressKey) {
        sessionStorage.setItem(
          sessionProgressKey,
          String(progressRef.current.lastKnownProgressMinutes),
        );
      }
    }

    progressRef.current.iframeSessionStartAt = now;
  };

  const setIframeTrackingActive = (isActive: boolean) => {
    if (!usingExternalPlayback) return;

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
    if (usingInternalPlayback && videoRef.current) {
      return Math.max(0, videoRef.current.currentTime / 60);
    }

    if (progressRef.current.playerEventsSeen) {
      return progressRef.current.lastKnownProgressMinutes;
    }

    if (progressRef.current.isIframeActive) {
      const now = Date.now();
      const liveMinutes =
        (now - progressRef.current.iframeSessionStartAt) / 60000;
      return sessionBaseProgress + progressRef.current.accumulatedMinutes + Math.max(0, liveMinutes);
    }

    return sessionBaseProgress + progressRef.current.accumulatedMinutes;
  };

  const getPlaybackSessionPayload = (
    progressMinutes: number,
    durationMinutes?: number,
  ) => {
    const resolvedDuration = Math.max(
      Number(durationMinutes) || fallbackDurationMinutes || 0,
      progressMinutes,
    );
    const completionRatio =
      resolvedDuration > 0 ? Math.min(1, progressMinutes / resolvedDuration) : 0;

    return {
      mediaId: movieId,
      mediaType: movieType === "tv" ? "tv" : "movie",
      season: seasonId ? parseInt(seasonId) : 0,
      episode: episodeId ? parseInt(episodeId) : 0,
      title: mediaTitle,
      playerKind: usingInternalPlayback ? "internal_native" : "external_iframe",
      sourceType: usingInternalPlayback ? "internal_stream" : "external_embed",
      fallbackReason: playbackFallbackReason,
      lastPosition: progressMinutes,
      duration: resolvedDuration,
      completionRatio,
    };
  };

  const syncPlaybackTelemetry = async (
    progressMinutes: number,
    durationMinutes?: number,
    options?: { complete?: boolean },
  ) => {
    if (!isLoggedIn || !playbackSessionRef.current.id) return;

    const payload = getPlaybackSessionPayload(progressMinutes, durationMinutes);

    try {
      if (options?.complete) {
        if (playbackSessionRef.current.isCompleted) return;
        await playbackAPI.complete(playbackSessionRef.current.id, payload);
        playbackSessionRef.current.isCompleted = true;
        return;
      }

      await playbackAPI.heartbeat(playbackSessionRef.current.id, payload);
    } catch (_error) {
      // Playback telemetry is best-effort and should not interrupt viewing.
    }
  };

  const persistProgress = async (
    rawProgressMinutes: number,
    rawDurationMinutes?: number,
    forceStatus?: "watching" | "watched",
  ) => {
    if (!isLoggedIn || !movieId || !movieType) return;

    if (!sessionBaseReady) {
      if (typeof window !== "undefined" && sessionProgressKey) {
        sessionStorage.setItem(
          sessionProgressKey,
          String(Math.max(0, rawProgressMinutes || 0)),
        );
      }
      return;
    }

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
    if (typeof window !== "undefined" && sessionProgressKey) {
      sessionStorage.setItem(sessionProgressKey, String(nextProgressMinutes));
    }

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

    await syncPlaybackTelemetry(
      nextProgressMinutes,
      durationMinutes,
      forceStatus === "watched" ? { complete: true } : undefined,
    );
  };

  const episodeChange = (n: string) => {
    void persistProgress(getCurrentProgressMinutes(), fallbackDurationMinutes);
    setIframeTrackingActive(false);
    setStreamServer(null);
    navigate(n);
  };

  const handleModeChange = (nextMode: PlaybackMode) => {
    const currentProgress = getCurrentProgressMinutes();
    void persistProgress(currentProgress, fallbackDurationMinutes);
    setIframeTrackingActive(false);
    progressRef.current.lastKnownProgressMinutes = currentProgress;
    if (typeof window !== "undefined" && sessionProgressKey) {
      sessionStorage.setItem(sessionProgressKey, String(currentProgress));
    }
    setSessionBaseProgress(currentProgress);
    setPreferredMode(nextMode);
  };

  const getDownloadSourceMeta = (server: StreamServer) => {
    const [, secondaryLine = ""] = String(server.title || "").split("\n");
    const sizeMatch = secondaryLine.match(/\b\d+(\.\d+)?\s?(GB|MB)\b/i);
    return {
      label: secondaryLine || server.title || server.name,
      size: sizeMatch?.[0] || "",
    };
  };

  useEffect(() => {
    if (!movieId || !movieType) return;
    const fetchStream = (type: "movie" | "tv") => {
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
  }, [movieType, movieId, seasonId, episodeId]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    progressRef.current = {
      iframeSessionStartAt: 0,
      accumulatedMinutes: 0,
      lastSavedAt: 0,
      lastSavedProgressMinutes: sessionBaseProgress,
      lastKnownProgressMinutes: sessionBaseProgress,
      playerEventsSeen: false,
      isIframeActive: false,
    };
  }, [playbackMode, sessionBaseProgress, sessionBaseReady, sessionProgressKey]);

  useEffect(() => {
    if (
      !isLoggedIn ||
      !movieId ||
      !movieType ||
      !sessionBaseReady ||
      isPreparingInternalPlayback
    ) {
      return;
    }

    const sessionSignature = [
      movieType,
      movieId,
      seasonId || 0,
      episodeId || 0,
      playbackMode,
      selectedStreamServer?.url || "external",
      playbackFallbackReason || "none",
    ].join(":");

    if (
      playbackSessionRef.current.signature === sessionSignature ||
      playbackSessionRef.current.requestedSignature === sessionSignature
    ) {
      return;
    }

    playbackSessionRef.current = {
      id: "",
      signature: "",
      requestedSignature: sessionSignature,
      isCompleted: false,
    };

    let cancelled = false;

    void playbackAPI
      .createSession(
        getPlaybackSessionPayload(sessionBaseProgress, fallbackDurationMinutes),
      )
      .then((response) => {
        if (cancelled) return;
        playbackSessionRef.current = {
          id: String(response.data?.id || ""),
          signature: sessionSignature,
          requestedSignature: sessionSignature,
          isCompleted: false,
        };
      })
      .catch(() => {
        if (cancelled) return;
        playbackSessionRef.current = {
          id: "",
          signature: "",
          requestedSignature: sessionSignature,
          isCompleted: false,
        };
      });

    return () => {
      cancelled = true;
    };
  }, [
    episodeId,
    fallbackDurationMinutes,
    isLoggedIn,
    isPreparingInternalPlayback,
    mediaTitle,
    movieId,
    movieType,
    playbackFallbackReason,
    playbackMode,
    seasonId,
    selectedStreamServer?.url,
    sessionBaseProgress,
    sessionBaseReady,
  ]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    if (!usingExternalPlayback) return;
    let lastUpdateTime = 0;

    const handleMessage = (event: any) => {
      if (
        event.origin !== "https://vixsrc.to" &&
        event.origin !== "https://www.vixsrc.to"
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
    playbackMode,
    sessionBaseReady,
    sessionBaseProgress,
    usingExternalPlayback,
  ]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    if (!usingExternalPlayback) {
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
  }, [fallbackDurationMinutes, sessionBaseProgress, sessionBaseReady, usingExternalPlayback]);

  useEffect(() => {
    if (
      !usingInternalPlayback ||
      !videoRef.current ||
      !sessionBaseReady ||
      sessionBaseProgress <= 0
    ) {
      return;
    }

    const targetSeconds = sessionBaseProgress * 60;
    if (Math.abs(videoRef.current.currentTime - targetSeconds) > 5) {
      videoRef.current.currentTime = targetSeconds;
    }
  }, [sessionBaseProgress, sessionBaseReady, usingInternalPlayback]);

  const handleNativeLoadedMetadata = () => {
    if (!videoRef.current) return;

    const startAtMinutes = Math.max(0, sessionBaseProgress);
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
    if (typeof window !== "undefined" && sessionProgressKey) {
      sessionStorage.setItem(sessionProgressKey, String(progressMinutes));
    }
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
  ) : isPreparingInternalPlayback ? (
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
            <Button
              color="primary"
              variant="soft"
              onClick={() => handleModeChange("external")}
            >
              Use External Fallback
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
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
      <Modal open={adsWarning} onClose={() => setAdsWarning(false)} sx={{ zIndex: 1003 }}>
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
        <Box sx={{ display: "flex", gap: 1 }}>
          {downloadSources.length ? (
            <IconButton onClick={() => setDownloadSourcesOpen(true)}>
              <DownloadRoundedIcon />
            </IconButton>
          ) : null}
          <IconButton
            onClick={() => {
              handleModeChange(
                preferredMode === "internal" ? "external" : "internal",
              );
            }}
          >
            {preferredMode === "internal" ? <LiveTvIcon /> : <StorageIcon />}
          </IconButton>
        </Box>
      </Box>
      <Modal
        open={downloadSourcesOpen}
        onClose={() => setDownloadSourcesOpen(false)}
        sx={{ zIndex: 1003 }}
      >
        <ModalDialog
          layout="center"
          sx={{
            width: "min(720px, calc(100% - 24px))",
            maxHeight: "80vh",
            overflow: "auto",
          }}
        >
          <Typography level="h4">Download Sources</Typography>
          <Typography level="body-sm" sx={{ mb: 1.5 }}>
            These links are treated as file-host/download sources, not in-app
            streaming sources. `Vixsrc` stays in the player flow for playback.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {downloadSources.map((server) => {
              const meta = getDownloadSourceMeta(server);
              return (
                <Box
                  key={`${server.name}-${server.url}`}
                  sx={{
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    p: 1.5,
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Typography level="title-md">{server.name}</Typography>
                  <Typography level="body-sm" sx={{ opacity: 0.8, mt: 0.5 }}>
                    {meta.label}
                  </Typography>
                  {meta.size ? (
                    <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
                      Approx. size: {meta.size}
                    </Typography>
                  ) : null}
                  <Box sx={{ display: "flex", gap: 1, mt: 1.25, flexWrap: "wrap" }}>
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(server.url, "_blank", "noopener,noreferrer")
                      }
                    >
                      Open Link
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      color="neutral"
                      onClick={() => copyToClipboard(server.url)}
                    >
                      Copy URL
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <DialogActions>
            <Button
              color="neutral"
              variant="soft"
              onClick={() => setDownloadSourcesOpen(false)}
            >
              Close
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
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
      {preferredMode === "internal" &&
      usingExternalPlayback &&
      !isPreparingInternalPlayback ? (
        <Box
          sx={{
            position: "absolute",
            top: movieType === "tv" ? "105px" : "55px",
            left: "10px",
            zIndex: 1001,
            background: "rgba(0, 0, 0, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            px: 1.5,
            py: 0.75,
            maxWidth: "min(420px, calc(100% - 20px))",
          }}
        >
          <Typography level="body-sm">
            Internal playback is not available for this title right now, so
            Smile Movies switched to the external fallback.
          </Typography>
        </Box>
      ) : null}
      {preferredMode === "internal" &&
      usingInternalPlayback &&
      webReadyStreams.length > 1 ? (
        <Box
          sx={{
            position: "absolute",
            top: movieType === "tv" ? "105px" : "55px",
            right: "10px",
            zIndex: 1001,
            minWidth: "220px",
          }}
        >
          <Select
            value={selectedStreamServer?.url || null}
            placeholder="Select stream server"
            onChange={(_event, value) => {
              const nextServer =
                webReadyStreams.find((server) => server.url === value) || null;
              if (!nextServer) return;
              const currentProgress = getCurrentProgressMinutes();
              void persistProgress(currentProgress, fallbackDurationMinutes);
              setSessionBaseProgress(currentProgress);
              setStreamServer(nextServer);
            }}
          >
            {webReadyStreams.map((server) => (
              <Option key={server.url} value={server.url}>
                {server.name}
              </Option>
            ))}
          </Select>
        </Box>
      ) : null}
      <PlaybackSurface
        mode={playbackMode}
        movieType={movieType || "movie"}
        movieId={movieId || ""}
        seasonId={seasonId}
        episodeId={episodeId}
        isTvSE={isTvSE}
        videoRef={videoRef}
        streamServer={selectedStreamServer}
        onLoadedMetadata={handleNativeLoadedMetadata}
        onTimeUpdate={handleNativeTimeUpdate}
        onPause={handleNativeTimeUpdate}
        onEnded={handleNativeEnded}
      />
    </Box>
  );
}

export default Watch;
