import {
  ArrowBackIos,
  ContentCut,
  Link as LinkIcon,
  People,
  SkipNext,
  Close,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Option,
  Select,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ProviderId, ProviderSourceFormat } from "../../types/providers";
import DownloadButton from "../../components/player/DownloadButton";
import { copyToClipboard } from "../../utilities/defaults";
import { watchPartyAPI } from "../../service/api/smb/watchparty.api.service";
import toast from "react-hot-toast";

const AUTO_SAVE_INTERVAL_MS = 60000;
const MIN_PROGRESS_DELTA_MINUTES = 1;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;
const MOVIE_COMPLETION_THRESHOLD = 0.9;
const EPISODE_COMPLETION_THRESHOLD = 0.95;
const LOCAL_ROUTE_PROGRESS_PREFIX = "watch-progress:";
const LOCAL_RECENT_PROGRESS_PREFIX = "recent-progress:";
const PROVIDER_PARAM_KEY = "provider";
const SERVER_PARAM_KEY = "server";
const PROVIDER_OPTIONS: ProviderId[] = ["vixsrc", "showbox", "anikai"];

const parseProviderFromQuery = (value: string | null): ProviderId => {
  if (value === "anikai") return "anikai";
  return value === "showbox" ? "showbox" : "vixsrc";
};

const getProviderLabel = (provider: ProviderId) => {
  if (provider === "anikai") return "Anikai";
  return provider === "showbox" ? "ShowBox" : "Vixsrc";
};

const inferFormatFromUrl = (url: string): ProviderSourceFormat => {
  const normalized = String(url || "").toLowerCase();
  if (normalized.includes(".m3u8")) return "hls";
  if (normalized.includes(".mp4")) return "mp4";
  return "unknown";
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { getStreamData, getStream } = useStream();
  const { deleteRating, myselfData, upsertRecentlyWatched, upsertRating } = useUsers();
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const playbackReadyRef = useRef(false);
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
  const [playerReloadToken, setPlayerReloadToken] = useState(0);
  const [lastPlaybackError, setLastPlaybackError] = useState("");
  // Autoplay countdown
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [autoplayNextPath, setAutoplayNextPath] = useState<string>("");
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Clip sharing
  const [clipCopied, setClipCopied] = useState(false);
  const selectedProvider = parseProviderFromQuery(searchParams.get(PROVIDER_PARAM_KEY));
  const versionParam = searchParams.get("version") as "sub" | "dub" | null;
  const version = versionParam === "dub" ? "dub" : "sub";
  const selectedServerFromQuery = String(searchParams.get(SERVER_PARAM_KEY) || "").trim();
  const availableStream = getStreamData.data?.stream || null;
  const resolvedProvider = getStreamData.data?.resolvedProvider || selectedProvider;
  const providerNotice = String(getStreamData.data?.message || "").trim();
  const availableSources = availableStream?.sources || [];
  const activeSource =
    availableSources.find((source) => source.id === selectedServerFromQuery) ||
    availableSources.find((source) => source.active) ||
    availableSources[0] ||
    null;
  const playbackStream = useMemo(() => (sessionBaseReady ? availableStream : null), [availableStream, sessionBaseReady]);
  const playbackSourceUrl = useMemo(
    () =>
      sessionBaseReady
        ? activeSource?.url || availableStream?.masterPlaylistUrl || ""
        : "",
    [activeSource?.url, availableStream?.masterPlaylistUrl, sessionBaseReady],
  );
  const playbackSourceFormat: ProviderSourceFormat = useMemo(
    () =>
      activeSource?.format
        ? activeSource.format
        : inferFormatFromUrl(playbackSourceUrl),
    [activeSource?.format, playbackSourceUrl],
  );
  const isPreparingPlayback = getStreamData.isLoading;
  const isPlaybackUnavailable =
    !isPreparingPlayback &&
    sessionBaseReady &&
    !getStreamData.isAvailable &&
    getStreamData.provider === selectedProvider;
  const activeSourceIndex = activeSource
    ? availableSources.findIndex((source) => source.id === activeSource.id)
    : -1;
  const nextSourceOption =
    activeSourceIndex >= 0 ? availableSources[activeSourceIndex + 1] || null : null;
  const serverLabel = activeSource?.name || "No server selected";
  const failoverContextKey = `${selectedProvider}:${movieType || ""}:${movieId || ""}:${seasonId || 0}:${episodeId || 0}`;
  const autoFailoverStateRef = useRef({
    contextKey: "",
    used: false,
  });
  const centerErrorMessage = String(
    isPlaybackUnavailable
      ? getStreamData.errorMessage || "Unable to load stream for this provider/server."
      : lastPlaybackError,
  ).trim();

  useEffect(() => {
    const currentProvider = searchParams.get(PROVIDER_PARAM_KEY);
    if (currentProvider === selectedProvider) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(PROVIDER_PARAM_KEY, selectedProvider);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, selectedProvider, setSearchParams]);

  useEffect(() => {
    if (!availableSources.length || !activeSource?.id) return;
    if (selectedServerFromQuery === activeSource.id) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(PROVIDER_PARAM_KEY, selectedProvider);
    nextParams.set(SERVER_PARAM_KEY, activeSource.id);
    setSearchParams(nextParams, { replace: true });
  }, [
    activeSource?.id,
    availableSources.length,
    searchParams,
    selectedProvider,
    selectedServerFromQuery,
    setSearchParams,
  ]);

  useEffect(() => {
    if (autoFailoverStateRef.current.contextKey === failoverContextKey) {
      return;
    }

    autoFailoverStateRef.current = {
      contextKey: failoverContextKey,
      used: false,
    };
    setLastPlaybackError("");
  }, [failoverContextKey]);

  useEffect(() => {
    setSessionBaseProgress(0);
    setSessionBaseReady(false);
    setPlayerReloadToken(0);
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

  const getPlaybackSessionPayload = useCallback((
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
      fallbackReason: `provider:${selectedProvider};server:${activeSource?.id || "default"}`,
      lastPosition: progressMinutes,
      duration: resolvedDuration,
      completionRatio,
    };
  }, [activeSource?.id, episodeId, fallbackDurationMinutes, mediaTitle, movieId, movieType, seasonId, selectedProvider]);

  const syncPlaybackTelemetry = useCallback(async (
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
  }, [getPlaybackSessionPayload, isLoggedIn]);

  const getNextEpisodeForSeries = useCallback(() => {
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
  }, [episodeId, seasonId, tvSeasonsDetailsArr?.episodes, tvSeriesDetailsDataArr?.seasons]);

  // Autoplay countdown logic
  const startAutoplay = useCallback((nextPath: string) => {
    setAutoplayNextPath(nextPath);
    setAutoplayCountdown(10);
    autoplayTimerRef.current = setInterval(() => {
      setAutoplayCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(autoplayTimerRef.current!);
          navigate(nextPath);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [navigate]);

  const cancelAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    setAutoplayCountdown(null);
    setAutoplayNextPath("");
  }, []);

  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, []);

  // Clip sharing
  const shareCurrentTime = useCallback(() => {
    const currentSecs = Math.floor(Number(playerRef.current?.currentTime || 0));
    const url = new URL(window.location.href);
    url.searchParams.set("t", String(currentSecs));
    copyToClipboard(url.toString());
    setClipCopied(true);
    setTimeout(() => setClipCopied(false), 2000);
  }, []);

  const flushRecentProgress = useCallback(async (
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
  }, [isLoggedIn, movieId, movieType, recentProgressStorageKey, syncPlaybackTelemetry, upsertRecentlyWatched]);

  const persistProgress = useCallback(async (
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
      // Start autoplay countdown for TV episodes
      if (movieType === "tv") {
        const next = getNextEpisodeForSeries();
        if (next.nextSeason && next.nextEpisode && movieId) {
          const nextPath = `/tv/${movieId}/${next.nextSeason}/${next.nextEpisode}/watch`;
          startAutoplay(nextPath);
        }
      }
    }
  }, [episodeId, fallbackDurationMinutes, flushRecentProgress, getNextEpisodeForSeries, mediaPoster, mediaTitle, movieId, movieType, ratingItem, recentProgressStorageKey, routeProgressStorageKey, seasonId, sessionBaseReady]);

  const episodeChange = (nextPath: string) => {
    void (async () => {
      await persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes());
      await flushRecentProgress({ force: true });
      const query = searchParams.toString();
      navigate(query ? `${nextPath}?${query}` : nextPath);
    })();
  };

  useEffect(() => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      movie(movieId);
      movieImages(movieId);
      getStream(selectedProvider, "movie", movieId, undefined, undefined, selectedProvider === "anikai" ? version : undefined);
      return;
    }

    tvSeries(movieId);
    tvImages(movieId);
    if (seasonId) {
      tvSeasonsDetails(movieId, parseInt(seasonId));
    }
    if (seasonId && episodeId) {
      getStream(selectedProvider, "tv", movieId, seasonId, episodeId, selectedProvider === "anikai" ? version : undefined);
    }
  }, [episodeId, movieId, movieType, seasonId, selectedProvider, version]);

  useEffect(() => {
    if (!sessionBaseReady) return;
    progressRef.current = {
      lastFlushedAt: 0,
      lastFlushedProgressMinutes: sessionBaseProgress,
      lastKnownProgressMinutes: sessionBaseProgress,
    };
  }, [
    playbackSourceUrl,
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
      !playbackSourceUrl
    ) {
      return;
    }

    const sessionSignature = [
      movieType,
      movieId,
      seasonId || 0,
      episodeId || 0,
      selectedProvider,
      activeSource?.id || "default",
      playbackSourceUrl,
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
    activeSource?.id,
    episodeId,
    fallbackDurationMinutes,
    isLoggedIn,
    movieId,
    movieType,
    playbackSourceUrl,
    seasonId,
    selectedProvider,
    sessionBaseProgress,
    sessionBaseReady,
  ]);

  useEffect(() => {
    if (!sessionBaseReady || !playbackSourceUrl) return;

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
    playbackSourceUrl,
    sessionBaseReady,
  ]);

  const handlePlayerLoadedMetadata = useCallback(() => {
    if (!playerRef.current) return;

    const tParam = Number(searchParams.get("t") || 0);
    const startAtMinutes = Math.max(0, tParam > 0 ? tParam / 60 : sessionBaseProgress);
    if (startAtMinutes > 0) {
      playerRef.current.currentTime = startAtMinutes * 60;
    }
  }, [sessionBaseProgress, searchParams]);

  const handlePlayerTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    const progressMinutes = Number(playerRef.current.currentTime || 0) / 60;
    const durationMinutes = getPlayerDurationMinutes();
    progressRef.current.lastKnownProgressMinutes = progressMinutes;
    writeStoredNumber(routeProgressStorageKey, progressMinutes);
    void persistProgress(progressMinutes, durationMinutes);
  }, [getPlayerDurationMinutes, persistProgress, routeProgressStorageKey]);

  const handlePlayerPause = useCallback(() => {
    if (!playerRef.current) return;
    const progressMinutes = Number(playerRef.current.currentTime || 0) / 60;
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(progressMinutes, durationMinutes).then(() =>
      flushRecentProgress({ force: true }),
    );
  }, [flushRecentProgress, getPlayerDurationMinutes, persistProgress]);

  const handlePlayerEnded = useCallback(() => {
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(durationMinutes, durationMinutes, true);
  }, [getPlayerDurationMinutes, persistProgress]);

  const requestStream = () => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      void getStream(selectedProvider, "movie", movieId, undefined, undefined, selectedProvider === "anikai" ? version : undefined);
      return;
    }

    if (!seasonId || !episodeId) return;
    void getStream(selectedProvider, "tv", movieId, seasonId, episodeId, selectedProvider === "anikai" ? version : undefined);
  };

  const setProviderInQuery = (provider: ProviderId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(PROVIDER_PARAM_KEY, provider);
    nextParams.delete(SERVER_PARAM_KEY);
    setLastPlaybackError("");
    setPlayerReloadToken(0);
    setSearchParams(nextParams);
  };

  const setServerInQuery = useCallback((serverId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(PROVIDER_PARAM_KEY, selectedProvider);
    nextParams.set(SERVER_PARAM_KEY, serverId);
    setLastPlaybackError("");
    setSearchParams(nextParams);
  }, [searchParams, selectedProvider, setSearchParams]);

  const tryNextServer = useCallback(() => {
    if (!nextSourceOption?.id) {
      return false;
    }

    setServerInQuery(nextSourceOption.id);
    setPlayerReloadToken(0);

    return true;
  }, [nextSourceOption?.id, setServerInQuery]);

  const retryCurrentServer = () => {
    setLastPlaybackError("");

    if (selectedProvider === "showbox") {
      autoFailoverStateRef.current = {
        ...autoFailoverStateRef.current,
        used: false,
      };
      requestStream();
      return;
    }

    if (!playbackSourceUrl || isPlaybackUnavailable) {
      autoFailoverStateRef.current = {
        ...autoFailoverStateRef.current,
        used: false,
      };
      requestStream();
      return;
    }

    setPlayerReloadToken((value) => value + 1);
  };

  const handlePlaybackReady = useCallback(() => {
    playbackReadyRef.current = true;
    setLastPlaybackError("");
  }, []);

  const handlePlaybackError = useCallback((message: string) => {
    playbackReadyRef.current = false;
    const normalizedError = String(message || "").trim() || "Playback failed for this server.";

    if (selectedProvider === "showbox" && !autoFailoverStateRef.current.used) {
      autoFailoverStateRef.current = {
        ...autoFailoverStateRef.current,
        used: true,
      };

      const switched = tryNextServer();
      if (switched) {
        return;
      }
    }

    setLastPlaybackError(normalizedError);
  }, [selectedProvider, tryNextServer]);

  useEffect(() => {
    if (!isPlaybackUnavailable) return;
    setLastPlaybackError(
      String(getStreamData.errorMessage || "Unable to load stream for this provider/server."),
    );
  }, [getStreamData.errorMessage, isPlaybackUnavailable]);

  useEffect(() => {
    playbackReadyRef.current = false;

    if (!sessionBaseReady || !playbackSourceUrl || isPlaybackUnavailable) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!playbackReadyRef.current) {
        setLastPlaybackError("Stream timeout: provider did not return playable media.");
      }
    }, 25000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    isPlaybackUnavailable,
    playbackSourceUrl,
    playerReloadToken,
    sessionBaseReady,
  ]);

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
        <Button
          size="sm"
          variant="plain"
          startDecorator={<People />}
          sx={{ color: "rgba(255,255,255,0.8)", ml: 1, display: { xs: "none", sm: "flex" } }}
          onClick={async () => {
            try {
              const r = await watchPartyAPI.create({
                mediaType: movieType || "movie",
                mediaId: movieId || "",
                ...(seasonId && { season: Number(seasonId) }),
                ...(episodeId && { episode: Number(episodeId) }),
              });
              navigate(`/party/${r.code}`);
            } catch {
              toast.error("Could not create watch party.");
            }
          }}
        >
          Watch together
        </Button>
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
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: { xs: "66px", sm: "62px" },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1001,
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "min(calc(100% - 20px), 560px)",
          px: 1,
          py: 1,
          borderRadius: "18px",
          background: "rgba(8, 8, 8, 0.62)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.24)",
        }}
      >
        <Select
          size="sm"
          value={selectedProvider}
          onChange={(_e, value) => {
            if (!value) return;
            const nextProvider = parseProviderFromQuery(String(value));
            if (nextProvider === selectedProvider) return;
            setProviderInQuery(nextProvider);
          }}
          sx={{
            minWidth: { xs: "130px", sm: "150px" },
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {PROVIDER_OPTIONS.map((providerOption) => (
            <Option key={providerOption} value={providerOption}>
              {getProviderLabel(providerOption)}
            </Option>
          ))}
        </Select>
        <Select
          size="sm"
          value={activeSource?.id || null}
          placeholder={availableSources.length ? "Select server" : "No servers yet"}
          onChange={(_e, value) => {
            if (!value) return;
            setServerInQuery(String(value));
          }}
          disabled={!availableSources.length}
          sx={{
            minWidth: { xs: "200px", sm: "260px" },
            maxWidth: "100%",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {availableSources.map((source) => (
            <Option key={source.id} value={source.id}>
              {source.name}
            </Option>
          ))}
        </Select>
        {selectedProvider === "anikai" && (
          <Select
            size="sm"
            value={version}
            onChange={(_e, value) => {
              if (value) {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("version", String(value));
                  return next;
                });
              }
            }}
            sx={{
              minWidth: { xs: "80px", sm: "100px" },
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <Option value="sub">Sub</Option>
            <Option value="dub">Dub</Option>
          </Select>
        )}
      </Box>
      {movieType === "tv" ? (
        <Box
          sx={{
            position: "absolute",
            top: { xs: "126px", sm: "118px" },
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            width: "min(calc(100% - 20px), 700px)",
            px: 1,
            py: 1,
            borderRadius: "18px",
            background: "rgba(8, 8, 8, 0.62)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.24)",
          }}
        >
          <Select
            size="sm"
            value={parseInt(seasonId || "1")}
            defaultValue={parseInt(seasonId || "1")}
            onChange={(_e, value) => {
              if (!value) return;
              episodeChange(`/${movieType}/${movieId}/${value}/1/watch`);
            }}
            sx={{
              minWidth: { xs: "140px", sm: "180px" },
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
              minWidth: { xs: "220px", sm: "380px" },
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
        </Box>
      ) : null}
      <PlaybackSurface
        playerRef={playerRef}
        stream={playbackStream}
        sourceUrl={playbackSourceUrl}
        sourceFormat={playbackSourceFormat}
        poster={backdropPoster}
        title={mediaTitle}
        onLoadedMetadata={handlePlayerLoadedMetadata}
        onTimeUpdate={handlePlayerTimeUpdate}
        onPause={handlePlayerPause}
        onEnded={handlePlayerEnded}
        onPlaybackError={handlePlaybackError}
        onPlaybackReady={handlePlaybackReady}
        reloadToken={playerReloadToken}
      />
      {centerErrorMessage ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: "min(560px, calc(100% - 32px))",
              px: 2,
              py: 2,
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(8,8,8,0.74)",
              backdropFilter: "blur(14px)",
              textAlign: "center",
              pointerEvents: "auto",
            }}
          >
            <Typography level="h4" sx={{ mb: 1 }}>
              Playback error
            </Typography>
            <Typography level="body-md" sx={{ color: "neutral.300", mb: 2 }}>
              {centerErrorMessage}
            </Typography>
            <Typography level="body-sm" sx={{ color: "neutral.400", mb: 2 }}>
              Provider: {getProviderLabel(resolvedProvider)} | Server: {serverLabel}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              <Button size="md" variant="solid" color="warning" onClick={retryCurrentServer}>
                Retry
              </Button>
              <DownloadButton
                streamUrl={playbackSourceUrl}
                title={mediaTitle}
                cacheKey={movieType === "tv"
                  ? `tv-${movieId}-s${seasonId}e${episodeId}`
                  : `movie-${movieId}`}
              />
            </Box>
          </Box>
        </Box>
      ) : null}
      {providerNotice && playbackSourceUrl ? (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: { xs: "18px", md: "26px" },
            transform: "translateX(-50%)",
            zIndex: 1001,
            width: "min(680px, calc(100% - 24px))",
            px: 2,
            py: 1.25,
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(12,12,12,0.72)",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}
        >
          <Typography level="body-sm" sx={{ color: "warning.200" }}>
            {providerNotice}
          </Typography>
        </Box>
      ) : null}
      {!playbackSourceUrl && !centerErrorMessage ? (
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
      />\n
      {/* Autoplay countdown overlay */}
      {autoplayCountdown !== null && (
        <Box
          sx={{
            position: "fixed",
            bottom: 90,
            right: 32,
            zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            borderRadius: "xl",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 300,
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Up next
            </Typography>
            <IconButton size="sm" variant="plain" sx={{ color: "white" }} onClick={cancelAutoplay}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Typography level="title-md" sx={{ color: "white" }}>
            Next episode
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
            <Button
              size="sm"
              startDecorator={<SkipNext />}
              sx={{ background: "white", color: "black", "&:hover": { background: "rgba(255,255,255,0.9)" } }}
              onClick={() => {
                cancelAutoplay();
                navigate(autoplayNextPath);
              }}
            >
              Play now
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
              onClick={cancelAutoplay}
            >
              Cancel ({autoplayCountdown}s)
            </Button>
          </Box>
          <LinearProgress
            determinate
            value={((10 - autoplayCountdown) / 10) * 100}
            sx={{
              mt: 0.5,
              "--LinearProgress-progressColor": "rgb(255,220,92)",
              "--LinearProgress-trackColor": "rgba(255,255,255,0.15)",
            }}
          />
        </Box>
      )}

      {/* Clip share button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 9998,
          display: "flex",
          gap: 1,
        }}
      >
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={clipCopied ? <LinkIcon /> : <ContentCut />}
          onClick={shareCurrentTime}
          sx={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            color: clipCopied ? "rgb(255,220,92)" : "white",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {clipCopied ? "Link copied!" : "Share from here"}
        </Button>
      </Box>
    </Box>
  );
}

export default Watch;
