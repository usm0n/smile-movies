import {
  ArrowBackIos,
  RefreshRounded,
  SubtitlesRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  IconButton,
  LinearProgress,
  Modal,
  ModalDialog,
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
import { images, movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import PlaybackSurface from "../../components/player/PlaybackSurface";
import { playbackAPI } from "../../service/api/smb/playback.api.service";
import RatingDialog from "../../components/library/RatingDialog";
import { ProviderId } from "../../types/providers";

const AUTO_SAVE_INTERVAL_MS = 60000;
const MIN_PROGRESS_DELTA_MINUTES = 1;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;
const MOVIE_COMPLETION_THRESHOLD = 0.9;
const EPISODE_COMPLETION_THRESHOLD = 0.95;
const LOCAL_ROUTE_PROGRESS_PREFIX = "watch-progress:";
const LOCAL_RECENT_PROGRESS_PREFIX = "recent-progress:";
const SERVER_OPTIONS: Array<{ value: ProviderId; label: string }> = [
  { value: "vidsrcpm", label: "VidSrcPM" },
  { value: "vixsrc", label: "Vixsrc" },
];

type LocalRecentProgress = {
  id: string;
  type: "movie" | "tv";
  title: string;
  poster: string;
  duration: number;
  currentTime: number;
  currentSeason: number;
  currentEpisode: number;
  nextSeason: number;
  nextEpisode: number;
  progressMarker: number;
  updatedAtMs: number;
  isCompleted: boolean;
};

const readStoredNumber = (key: string): number => {
  if (typeof window === "undefined" || !key) return 0;
  return Number(window.localStorage.getItem(key) || 0) || 0;
};

const writeStoredNumber = (key: string, value: number) => {
  if (typeof window === "undefined" || !key) return;
  window.localStorage.setItem(key, String(Math.max(0, value || 0)));
};

const readStoredRecentProgress = (key: string): LocalRecentProgress | null => {
  if (typeof window === "undefined" || !key) return null;

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return null;
    return JSON.parse(rawValue) as LocalRecentProgress;
  } catch (_error) {
    return null;
  }
};

const writeStoredRecentProgress = (key: string, payload: LocalRecentProgress) => {
  if (typeof window === "undefined" || !key) return;
  window.localStorage.setItem(key, JSON.stringify(payload));
};

function Watch() {
  const {
    tvSeriesDetailsData,
    tvSeries,
    movieDetailsData,
    movie,
    movieImagesData,
    movieImages,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
    tvImagesData,
    tvImages,
  } = useTMDB();
  const { colorScheme } = useColorScheme();
  const { movieId, movieType, seasonId, episodeId, startAt } = useParams();
  const { getStreamData, getStream } = useStream();
  const { deleteRating, myselfData, upsertRecentlyWatched, upsertRating } = useUsers();
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const progressRef = useRef({
    lastFlushedAt: 0,
    lastFlushedProgressMinutes: 0,
    lastKnownProgressMinutes: 0,
  });
  const playbackSessionRef = useRef({
    id: "",
    signature: "",
    requestedSignature: "",
    isCompleted: false,
    completionHandled: false,
  });

  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    movieDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading;
  const isIncorrect =
    tvSeriesDetailsData?.isIncorrect || movieDetailsData?.isIncorrect;
  const tvSeriesDetailsDataArr = tvSeriesDetailsData?.data as tvDetails;
  const movieDetailsDataArr = movieDetailsData?.data as movieDetails;
  const tvSeasonsDetailsArr = tvSeasonsDetailsData?.data as tvSeasonsDetails;
  const movieImagesDataArr = movieImagesData?.data as images;
  const tvImagesDataArr = tvImagesData?.data as images;
  const recentItem = (myselfData?.data as User)?.recentlyWatched?.find(
    (item) => item.id === movieId && item.type === movieType,
  );
  const ratingItem = (myselfData?.data as User)?.ratings?.find(
    (item) => item.id === movieId && item.type === movieType,
  );
  const activeEpisodeData = tvSeasonsDetailsArr?.episodes?.find(
    (episode) => episode?.episode_number === Number(episodeId),
  );
  const routeProgressStorageKey =
    movieId && movieType
      ? `${LOCAL_ROUTE_PROGRESS_PREFIX}${movieType}:${movieId}:${seasonId || 0}:${episodeId || 0}`
      : "";
  const recentProgressStorageKey =
    movieId && movieType
      ? `${LOCAL_RECENT_PROGRESS_PREFIX}${movieType}:${movieId}`
      : "";
  const mediaTitle =
    movieType === "tv"
      ? tvSeriesDetailsDataArr?.name || ""
      : movieDetailsDataArr?.title || "";
  const mediaPoster =
    movieType === "tv"
      ? tvSeriesDetailsDataArr?.poster_path
      : movieDetailsDataArr?.poster_path;
  const backdropPoster =
    mediaPoster ? `https://image.tmdb.org/t/p/original${mediaPoster}` : "";
  const mediaImages = movieType === "movie" ? movieImagesDataArr : tvImagesDataArr;
  const mediaLogo =
    mediaImages?.logos?.find((logo) => logo?.iso_639_1 === "en")?.file_path ||
    mediaImages?.logos?.[0]?.file_path ||
    "";
  const fallbackDurationMinutes = useMemo(() => {
    if (movieType === "tv") {
      return (
        Number(activeEpisodeData?.runtime) ||
        Number(tvSeriesDetailsDataArr?.episode_run_time?.[0]) ||
        0
      );
    }

    return Number(movieDetailsDataArr?.runtime) || 0;
  }, [
    activeEpisodeData?.runtime,
    movieDetailsDataArr?.runtime,
    movieType,
    tvSeriesDetailsDataArr?.episode_run_time,
  ]);
  const [sessionBaseProgress, setSessionBaseProgress] = useState(0);
  const [sessionBaseReady, setSessionBaseReady] = useState(false);
  const [preferredServer, setPreferredServer] = useState<ProviderId>("vidsrcpm");

  const availableStream = getStreamData.data?.stream || null;
  const playbackStream = sessionBaseReady ? availableStream : null;
  const streamProvider = getStreamData.data?.provider || preferredServer;
  const subtitleTrackCount = availableStream?.subtitleTracks?.length || 0;
  const isPreparingPlayback = getStreamData.isLoading;
  const isPlaybackUnavailable =
    !isPreparingPlayback && sessionBaseReady && !getStreamData.isAvailable;

  useEffect(() => {
    setSessionBaseProgress(0);
    setSessionBaseReady(false);
    playbackSessionRef.current = {
      id: "",
      signature: "",
      requestedSignature: "",
      isCompleted: false,
      completionHandled: false,
    };
  }, [routeProgressStorageKey]);

  const [isRatingOpen, setIsRatingOpen] = useState(false);

  useEffect(() => {
    if (sessionBaseReady || !movieId || !movieType) return;

    const routeProgress = Number(startAt) || 0;
    if (routeProgress > 0) {
      setSessionBaseProgress(routeProgress);
      setSessionBaseReady(true);
      return;
    }

    if (myselfData?.isLoading) return;

    const persistedRouteProgress = readStoredNumber(routeProgressStorageKey);
    const stagedRecentProgress = readStoredRecentProgress(recentProgressStorageKey);

    let recentProgress = 0;
    if (recentItem) {
      if (movieType === "movie") {
        recentProgress = Number(recentItem.currentTime) || 0;
      } else {
        const sameEpisode =
          Number(recentItem.currentSeason) === Number(seasonId || 0) &&
          Number(recentItem.currentEpisode) === Number(episodeId || 0);

        recentProgress = sameEpisode
          ? Number(recentItem.currentTime) || 0
          : 0;
      }
    }

    let localRecentProgress = 0;
    if (stagedRecentProgress) {
      if (movieType === "movie") {
        localRecentProgress = Number(stagedRecentProgress.currentTime) || 0;
      } else {
        const sameEpisode =
          Number(stagedRecentProgress.currentSeason) === Number(seasonId || 0) &&
          Number(stagedRecentProgress.currentEpisode) === Number(episodeId || 0);

        localRecentProgress = sameEpisode
          ? Number(stagedRecentProgress.currentTime) || 0
          : 0;
      }
    }

    setSessionBaseProgress(
      Math.max(
        routeProgress,
        recentProgress,
        localRecentProgress,
        persistedRouteProgress,
        0,
      ),
    );
    setSessionBaseReady(true);
  }, [
    episodeId,
    movieId,
    movieType,
    myselfData?.isLoading,
    seasonId,
    sessionBaseReady,
    recentProgressStorageKey,
    routeProgressStorageKey,
    startAt,
    recentItem,
  ]);

  const getCurrentProgressMinutes = () => {
    const player = playerRef.current;
    const currentSeconds = Number(player?.currentTime || 0);

    if (currentSeconds > 0) {
      return currentSeconds / 60;
    }

    return Math.max(
      sessionBaseProgress,
      progressRef.current.lastKnownProgressMinutes,
      0,
    );
  };

  const getPlayerDurationMinutes = () => {
    const durationSeconds = Number(playerRef.current?.duration || 0);
    return durationSeconds > 0 ? durationSeconds / 60 : fallbackDurationMinutes;
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
      playerKind: "provider_modern",
      sourceType: "provider_stream",
      fallbackReason: "",
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
      // Best effort only.
    }
  };

  const getNextEpisodeForSeries = () => {
    const currentEpisodeNumber = Number(episodeId || 0);
    const currentSeasonNumber = Number(seasonId || 0);
    const hasNextEpisodeInSeason = Boolean(
      tvSeasonsDetailsArr?.episodes?.some(
        (episode) => Number(episode?.episode_number) === currentEpisodeNumber + 1,
      ),
    );

    if (hasNextEpisodeInSeason) {
      return {
        nextSeason: currentSeasonNumber,
        nextEpisode: currentEpisodeNumber + 1,
      };
    }

    const nextSeason = (tvSeriesDetailsDataArr?.seasons || []).find(
      (season) =>
        Number(season?.season_number) > currentSeasonNumber &&
        Number(season?.episode_count || 0) > 0,
    );

    if (nextSeason) {
      return {
        nextSeason: Number(nextSeason.season_number),
        nextEpisode: 1,
      };
    }

    return {
      nextSeason: 0,
      nextEpisode: 0,
    };
  };

  const flushRecentProgress = async (
    options?: {
      force?: boolean;
      payload?: LocalRecentProgress | null;
    },
  ) => {
    const stagedPayload =
      options?.payload || readStoredRecentProgress(recentProgressStorageKey);

    if (
      !isLoggedIn ||
      !movieId ||
      !movieType ||
      !stagedPayload
    ) {
      return;
    }

    const syncProgressMinutes =
      stagedPayload.isCompleted && stagedPayload.duration > 0
        ? Math.max(stagedPayload.progressMarker, stagedPayload.duration)
        : stagedPayload.progressMarker;

    if (
      !options?.force &&
      !stagedPayload.isCompleted &&
      syncProgressMinutes < MIN_PROGRESS_TO_SAVE_MINUTES
    ) {
      return;
    }

    const now = Date.now();
    const progressDelta = Math.abs(
      syncProgressMinutes - progressRef.current.lastFlushedProgressMinutes,
    );

    if (
      !options?.force &&
      now - progressRef.current.lastFlushedAt < AUTO_SAVE_INTERVAL_MS &&
      progressDelta < MIN_PROGRESS_DELTA_MINUTES
    ) {
      return;
    }

    progressRef.current.lastFlushedAt = now;
    progressRef.current.lastFlushedProgressMinutes = syncProgressMinutes;

    await upsertRecentlyWatched(
      stagedPayload.type,
      stagedPayload.id,
      stagedPayload.poster,
      stagedPayload.title,
      stagedPayload.duration,
      stagedPayload.currentTime,
      stagedPayload.currentSeason,
      stagedPayload.currentEpisode,
      stagedPayload.nextSeason,
      stagedPayload.nextEpisode,
    );

    await syncPlaybackTelemetry(
      syncProgressMinutes,
      stagedPayload.duration,
      stagedPayload.isCompleted ? { complete: true } : undefined,
    );
  };

  const persistProgress = async (
    rawProgressMinutes: number,
    rawDurationMinutes?: number,
    forceCompleted = false,
  ) => {
    if (!movieId || !movieType) return;

    if (!sessionBaseReady) {
      writeStoredNumber(
        routeProgressStorageKey,
        Math.max(0, rawProgressMinutes || 0),
      );
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
    const shouldAutoComplete =
      forceCompleted ||
      progressRatio >=
        (movieType === "movie"
          ? MOVIE_COMPLETION_THRESHOLD
          : EPISODE_COMPLETION_THRESHOLD);
    const nextProgressMinutes =
      shouldAutoComplete && durationMinutes > 0
        ? durationMinutes
        : boundedProgressMinutes;

    if (
      !shouldAutoComplete &&
      nextProgressMinutes < MIN_PROGRESS_TO_SAVE_MINUTES
    ) {
      return;
    }
    progressRef.current.lastKnownProgressMinutes = nextProgressMinutes;
    writeStoredNumber(routeProgressStorageKey, nextProgressMinutes);

    const currentSeasonNumber = seasonId ? parseInt(seasonId) : 0;
    const currentEpisodeNumber = episodeId ? parseInt(episodeId) : 0;
    const nextEpisodeMeta =
      movieType === "tv" && shouldAutoComplete
        ? getNextEpisodeForSeries()
        : { nextSeason: 0, nextEpisode: 0 };
    const payload: LocalRecentProgress = {
      id: String(movieId),
      type: movieType === "tv" ? "tv" : "movie",
      title: mediaTitle,
      poster: mediaPoster || "",
      duration: durationMinutes,
      currentTime:
        movieType === "tv" && shouldAutoComplete ? 0 : nextProgressMinutes,
      currentSeason: currentSeasonNumber,
      currentEpisode: currentEpisodeNumber,
      nextSeason: nextEpisodeMeta.nextSeason,
      nextEpisode: nextEpisodeMeta.nextEpisode,
      progressMarker: nextProgressMinutes,
      updatedAtMs: Date.now(),
      isCompleted: shouldAutoComplete,
    };

    writeStoredRecentProgress(recentProgressStorageKey, payload);

    if (shouldAutoComplete && !playbackSessionRef.current.completionHandled) {
      playbackSessionRef.current.completionHandled = true;
      await flushRecentProgress({ force: true, payload });
      if (!ratingItem) {
        setIsRatingOpen(true);
      }
    }
  };

  const episodeChange = (nextPath: string) => {
    void (async () => {
      await persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes());
      await flushRecentProgress({ force: true });
      navigate(nextPath);
    })();
  };

  useEffect(() => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      movie(movieId);
      movieImages(movieId);
      getStream("movie", movieId, undefined, undefined, preferredServer);
      return;
    }

    tvSeries(movieId);
    tvImages(movieId);
    if (seasonId) {
      tvSeasonsDetails(movieId, parseInt(seasonId));
    }
    if (seasonId && episodeId) {
      getStream("tv", movieId, seasonId, episodeId, preferredServer);
    }
  }, [episodeId, movieId, movieType, preferredServer, seasonId]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    progressRef.current = {
      lastFlushedAt: 0,
      lastFlushedProgressMinutes: sessionBaseProgress,
      lastKnownProgressMinutes: sessionBaseProgress,
    };
  }, [
    availableStream?.masterPlaylistUrl,
    routeProgressStorageKey,
    sessionBaseProgress,
    sessionBaseReady,
  ]);

  useEffect(() => {
    if (
      !isLoggedIn ||
      !movieId ||
      !movieType ||
      !sessionBaseReady ||
      !playbackStream?.masterPlaylistUrl
    ) {
      return;
    }

    const sessionSignature = [
      movieType,
      movieId,
      seasonId || 0,
      episodeId || 0,
      playbackStream.masterPlaylistUrl,
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
      completionHandled: false,
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
        completionHandled: false,
      };
    })
    .catch(() => {
      if (cancelled) return;
      playbackSessionRef.current = {
        id: "",
        signature: "",
        requestedSignature: sessionSignature,
        isCompleted: false,
        completionHandled: false,
      };
    });

    return () => {
      cancelled = true;
    };
  }, [
    playbackStream?.masterPlaylistUrl,
    episodeId,
    fallbackDurationMinutes,
    isLoggedIn,
    movieId,
    movieType,
    seasonId,
    sessionBaseProgress,
    sessionBaseReady,
  ]);

  useEffect(() => {
    if (!sessionBaseReady || !playbackStream?.masterPlaylistUrl) return;

    const flushProgress = (force = false) => {
      void persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes()).then(
        () => flushRecentProgress({ force }),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProgress(true);
      }
    };
    const handlePageHide = () => {
      flushProgress(true);
    };
    const handleBeforeUnload = () => {
      flushProgress(true);
    };

    const interval = window.setInterval(flushProgress, AUTO_SAVE_INTERVAL_MS);

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      flushProgress(true);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    fallbackDurationMinutes,
    playbackStream?.masterPlaylistUrl,
    sessionBaseReady,
  ]);

  const handlePlayerLoadedMetadata = () => {
    if (!playerRef.current) return;

    const startAtMinutes = Math.max(0, sessionBaseProgress);
    if (startAtMinutes > 0) {
      playerRef.current.currentTime = startAtMinutes * 60;
    }
  };

  const handlePlayerTimeUpdate = () => {
    if (!playerRef.current) return;
    const progressMinutes = Number(playerRef.current.currentTime || 0) / 60;
    const durationMinutes = getPlayerDurationMinutes();
    progressRef.current.lastKnownProgressMinutes = progressMinutes;
    writeStoredNumber(routeProgressStorageKey, progressMinutes);
    void persistProgress(progressMinutes, durationMinutes);
  };

  const handlePlayerPause = () => {
    if (!playerRef.current) return;
    const progressMinutes = Number(playerRef.current.currentTime || 0) / 60;
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(progressMinutes, durationMinutes).then(() =>
      flushRecentProgress({ force: true }),
    );
  };

  const handlePlayerEnded = () => {
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(durationMinutes, durationMinutes, true);
  };

  const retryStream = () => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      void getStream("movie", movieId, undefined, undefined, preferredServer);
      return;
    }

    if (!seasonId || !episodeId) return;
    void getStream("tv", movieId, seasonId, episodeId, preferredServer);
  };

  if (isIncorrect) {
    return <NotFound />;
  }

  if (!movieId || !movieType) {
    return (
      <Box width={"100%"} height={"100vh"}>
        {backdropLoading(true, colorScheme)}
      </Box>
    );
  }

  if (isPlaybackUnavailable) {
    return (
      <Box width={"100%"} height={"100vh"}>
        <Modal open={true} sx={{ zIndex: 1002 }}>
          <ModalDialog>
            <Typography level="h3">Sorry, we don&apos;t have it right now.</Typography>
            <Typography>
              This title is not currently available from the new Smile Movies
              provider yet.
            </Typography>
            {getStreamData.errorMessage ? (
              <Typography level="body-sm" textColor="warning.300">
                {getStreamData.errorMessage}
              </Typography>
            ) : null}
            <DialogActions>
              <Button
                color="warning"
                variant="solid"
                startDecorator={<RefreshRounded />}
                onClick={retryStream}
              >
                Retry
              </Button>
              <Button
                color="neutral"
                variant="soft"
                onClick={() => navigate(`/${movieType}/${movieId}`)}
              >
                Go Back
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        height: "100vh",
        background: "black",
        "@media (max-width: 700px)": {
          height: "100svh",
        },
      }}
    >
      <Helmet>
        <title>
          {`${movieType === "movie" ? movieDetailsDataArr?.title : tvSeriesDetailsDataArr?.name}`}{" "}
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
          gap: 1,
          padding: "0 10px",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1001,
          width: "100%",
          minHeight: "50px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <IconButton onClick={() => navigate(`/${movieType}/${movieId}`)}>
          <ArrowBackIos />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          {mediaLogo ? (
            <Box
              component="img"
              src={`https://image.tmdb.org/t/p/original${mediaLogo}`}
              alt={mediaTitle || "Title logo"}
              sx={{
                width: "auto",
                maxWidth: { xs: "170px", sm: "260px" },
                height: { xs: "28px", sm: "34px" },
                objectFit: "contain",
                objectPosition: "left center",
                filter: "drop-shadow(0 0 12px rgba(0,0,0,0.75))",
              }}
            />
          ) : (
            <Typography level="title-lg" sx={{ minWidth: 0 }}>
              {(movieType === "movie"
                ? movieDetailsDataArr?.title
                : tvSeriesDetailsDataArr?.name) || "Preparing stream"}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Chip
            size="sm"
            color={streamProvider === "vidsrcpm" ? "success" : "warning"}
            variant="soft"
          >
            {streamProvider === "vidsrcpm" ? "VidSrcPM" : "Vixsrc"}
          </Chip>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<SubtitlesRounded sx={{ fontSize: 18 }} />}
          >
            {subtitleTrackCount ? `${subtitleTrackCount} subtitles` : "No subtitles"}
          </Chip>
          <Button
            size="sm"
            variant="soft"
            startDecorator={<RefreshRounded />}
            loading={isPreparingPlayback}
            onClick={retryStream}
          >
            Retry
          </Button>
        </Box>
      </Box>
      {movieType === "tv" || SERVER_OPTIONS.length > 1 ? (
        <Box
          sx={{
            position: "absolute",
            top: { xs: "66px", sm: "62px" },
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            width: "min(calc(100% - 20px), 620px)",
            px: 1,
            py: 1,
            borderRadius: "18px",
            background: "rgba(8, 8, 8, 0.62)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.24)",
          }}
        >
          {movieType === "tv" ? (
            <>
              <Select
                size="sm"
                value={parseInt(seasonId || "1")}
                defaultValue={parseInt(seasonId || "1")}
                onChange={(_e, value) => {
                  if (!value) return;
                  episodeChange(`/${movieType}/${movieId}/${value}/1/watch`);
                }}
                sx={{
                  minWidth: { xs: "130px", sm: "150px" },
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                {tvSeriesDetailsDataArr?.seasons
                  ?.filter((season) => season?.season_number !== 0)
                  .map((season) => (
                    <Option key={season?.id} value={season?.season_number}>
                      {season?.name}
                    </Option>
                  ))}
              </Select>
              <Select
                size="sm"
                onChange={(_e, value) => {
                  if (!value) return;
                  episodeChange(`/${movieType}/${movieId}/${seasonId}/${value}/watch`);
                }}
                defaultValue={parseInt(episodeId || "1")}
                value={parseInt(episodeId || "1")}
                sx={{
                  minWidth: { xs: "220px", sm: "340px" },
                  maxWidth: "100%",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                {tvSeasonsDetailsArr?.episodes?.map((episode) => (
                  <Option key={episode?.id} value={episode?.episode_number}>
                    E{episode?.episode_number}: {episode?.name}
                  </Option>
                ))}
              </Select>
            </>
          ) : null}
          <Select
            size="sm"
            value={preferredServer}
            onChange={(_e, value) => {
              if (!value) return;
              setPreferredServer(value as ProviderId);
            }}
            sx={{
              minWidth: { xs: "140px", sm: "160px" },
              background: "rgba(255,255,255,0.05)",
            }}
          >
            {SERVER_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                Server: {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      ) : null}
      <PlaybackSurface
        playerRef={playerRef}
        provider={streamProvider}
        stream={playbackStream}
        poster={backdropPoster}
        title={mediaTitle}
        onLoadedMetadata={handlePlayerLoadedMetadata}
        onTimeUpdate={handlePlayerTimeUpdate}
        onPause={handlePlayerPause}
        onEnded={handlePlayerEnded}
      />
      {!playbackStream ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            zIndex: 1000,
          }}
        >
          <Box sx={{ width: "min(420px, calc(100% - 32px))" }}>
            <LinearProgress thickness={2} />
            <Typography level="h4" sx={{ mt: 2 }}>
              {sessionBaseReady ? "Preparing your stream" : "Restoring your watch session"}
            </Typography>
            {isFetching ? (
              <Typography level="body-sm" sx={{ mt: 1, color: "neutral.400" }}>
                Loading episode details in the background.
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}
      <RatingDialog
        open={isRatingOpen}
        title={mediaTitle}
        titleLogoSrc={
          mediaLogo ? `https://image.tmdb.org/t/p/original${mediaLogo}` : undefined
        }
        initialRating={ratingItem?.rating || 0}
        onClose={() => setIsRatingOpen(false)}
        onSave={async (rating) => {
          await upsertRating(
            movieType,
            movieId,
            mediaPoster || "",
            mediaTitle,
            rating,
          );
        }}
        onDelete={
          ratingItem
            ? async () => {
              await deleteRating(movieType, movieId);
            }
            : undefined
        }
      />
    </Box>
  );
}

export default Watch;
