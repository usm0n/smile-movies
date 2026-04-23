import { ArrowBackIos, SubtitlesRounded } from "@mui/icons-material";
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
import { movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import PlaybackSurface from "../../components/player/PlaybackSurface";
import { playbackAPI } from "../../service/api/smb/playback.api.service";

const AUTO_SAVE_INTERVAL_MS = 60000;
const MIN_PROGRESS_DELTA_MINUTES = 1;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;
const SESSION_PROGRESS_PREFIX = "watch-progress:";

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
  const playerRef = useRef<any>(null);
  const progressRef = useRef({
    lastSavedAt: 0,
    lastSavedProgressMinutes: 0,
    lastKnownProgressMinutes: 0,
  });
  const playbackSessionRef = useRef({
    id: "",
    signature: "",
    requestedSignature: "",
    isCompleted: false,
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
  const backdropPoster =
    mediaPoster ? `https://image.tmdb.org/t/p/original${mediaPoster}` : "";
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

  const availableStream = getStreamData.data?.stream || null;
  const subtitleTrackCount = availableStream?.subtitleTracks?.length || 0;
  const sourceCount = availableStream?.sources?.length || 0;
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

  const episodeChange = (nextPath: string) => {
    void persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes());
    navigate(nextPath);
  };

  useEffect(() => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      movie(movieId);
      getStream("movie", movieId);
      return;
    }

    tvSeries(movieId);
    if (seasonId) {
      tvSeasonsDetails(movieId, parseInt(seasonId));
    }
    if (seasonId && episodeId) {
      getStream("tv", movieId, seasonId, episodeId);
    }
  }, [episodeId, movieId, movieType, seasonId]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    progressRef.current = {
      lastSavedAt: 0,
      lastSavedProgressMinutes: sessionBaseProgress,
      lastKnownProgressMinutes: sessionBaseProgress,
    };
  }, [availableStream?.masterPlaylistUrl, sessionBaseProgress, sessionBaseReady, sessionProgressKey]);

  useEffect(() => {
    if (
      !isLoggedIn ||
      !movieId ||
      !movieType ||
      !sessionBaseReady ||
      !availableStream?.masterPlaylistUrl
    ) {
      return;
    }

    const sessionSignature = [
      movieType,
      movieId,
      seasonId || 0,
      episodeId || 0,
      availableStream.masterPlaylistUrl,
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
    availableStream?.masterPlaylistUrl,
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
    if (!sessionBaseReady || !availableStream?.masterPlaylistUrl) return;

    const flushProgress = () => {
      void persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProgress();
      }
    };

    const interval = window.setInterval(flushProgress, AUTO_SAVE_INTERVAL_MS);

    window.addEventListener("pagehide", flushProgress);
    window.addEventListener("beforeunload", flushProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      flushProgress();
      window.removeEventListener("pagehide", flushProgress);
      window.removeEventListener("beforeunload", flushProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [availableStream?.masterPlaylistUrl, fallbackDurationMinutes, sessionBaseReady]);

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
    if (typeof window !== "undefined" && sessionProgressKey) {
      sessionStorage.setItem(sessionProgressKey, String(progressMinutes));
    }
    void persistProgress(progressMinutes, durationMinutes);
  };

  const handlePlayerEnded = () => {
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(durationMinutes, durationMinutes, "watched");
  };

  if (isIncorrect) {
    return <NotFound />;
  }

  if (isFetching || isPreparingPlayback || !sessionBaseReady) {
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
            <DialogActions>
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
        <Typography level="title-lg" sx={{ flex: 1, minWidth: 0 }}>
          {movieType === "movie"
            ? movieDetailsDataArr?.title
            : tvSeriesDetailsDataArr?.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Chip size="sm" color="warning" variant="soft">
            Vixsrc
          </Chip>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<SubtitlesRounded sx={{ fontSize: 18 }} />}
          >
            {subtitleTrackCount ? `${subtitleTrackCount} subtitles` : "No subtitles"}
          </Chip>
          {sourceCount > 1 ? (
            <Chip size="sm" variant="soft">
              {sourceCount} sources
            </Chip>
          ) : null}
        </Box>
      </Box>
      {movieType === "tv" ? (
        <Box
          sx={{
            position: "absolute",
            top: "58px",
            left: "10px",
            zIndex: 1001,
            display: "flex",
            gap: "5px",
          }}
        >
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
              episodeChange(`/${movieType}/${movieId}/${seasonId}/${v}/watch`);
            }}
            defaultValue={parseInt(episodeId!)}
            value={parseInt(episodeId!)}
          >
            {tvSeasonsDetailsArr?.episodes?.map((episode) => (
              <Option key={episode?.id} value={episode?.episode_number}>
                E{episode?.episode_number}: {episode?.name}
              </Option>
            ))}
          </Select>
        </Box>
      ) : null}
      <PlaybackSurface
        playerRef={playerRef}
        stream={availableStream}
        poster={backdropPoster}
        title={mediaTitle}
        onLoadedMetadata={handlePlayerLoadedMetadata}
        onTimeUpdate={handlePlayerTimeUpdate}
        onPause={handlePlayerTimeUpdate}
        onEnded={handlePlayerEnded}
      />
      {!availableStream ? (
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
              Preparing your stream
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

export default Watch;
