import {
  ArrowBackIos,
  Check,
  Close,
  IosShare,
  People,
  SkipNext,
} from "../../components/ui/icons";
import { Box, Button, IconButton, LinearProgress, Typography } from "@mui/joy";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isLoggedIn } from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { images, movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";
import { Helmet } from "react-helmet";
import { useStream } from "../../context/Stream";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import PlaybackSurface from "../../components/player/PlaybackSurface";
import { playbackAPI } from "../../service/api/smb/playback.api.service";
import RatingDialog from "../../components/library/RatingDialog";
import {
  AnimeMode,
  ProviderId,
  ProviderSourceFormat,
  SkipSegment,
} from "../../types/providers";
import { providersAPI } from "../../service/api/smb/providers.api.service";
import DownloadButton from "../../components/player/DownloadButton";
import { copyToClipboard } from "../../utilities/defaults";
import { watchPartyAPI } from "../../service/api/smb/watchparty.api.service";
import { toast } from "../../components/ui/toast";
import WatchSidePanel, {
  ProviderOption,
  WatchPanelTab,
} from "../../components/player/WatchSidePanel";
import { isAnimeTitle } from "../../utilities/anime";
import WatchPartyDock from "../../components/party/WatchPartyDock";
import { useWatchPartySession } from "../../components/party/useWatchPartySession";
import { readGuestName, readGuestPid } from "../../utilities/watchPartyIdentity";
import {
  PartyLayout,
  THEATER_STRIP_PX,
  readPartyLayout,
  videoInsetFor,
  writePartyLayout,
} from "../../components/party/partyLayout";
import { pickPreferredLogoPath } from "../../utilities/tmdbImages";
import { buildSubtitleOffsetKey } from "../../utilities/subtitlePrefs";
import { readAnimeVersion, writeAnimeVersion } from "../../utilities/animePrefs";
import AnimeVersionPrompt from "../../components/player/AnimeVersionPrompt";
import WatchInfoPanel from "../../components/player/WatchInfoPanel";
import { useImdbWatchInfo } from "../../utilities/useImdbWatchInfo";
import { Star } from "../../components/ui/icons";
import { Chip } from "@mui/joy";

const AUTO_SAVE_INTERVAL_MS = 60000;
const MIN_PROGRESS_DELTA_MINUTES = 1;
const MIN_PROGRESS_TO_SAVE_MINUTES = 0.25;
const MOVIE_COMPLETION_THRESHOLD = 0.9;
const AUTOPLAY_COUNTDOWN_SECONDS = 10;
/** How long before the end of the file "Up next" appears. */
const AUTOPLAY_LEAD_SECONDS = 25;
/** Minimum spacing between progress writes during playback. */
const PROGRESS_WRITE_INTERVAL_MS = 5000;
const EPISODE_COMPLETION_THRESHOLD = 0.95;
const LOCAL_ROUTE_PROGRESS_PREFIX = "watch-progress:";
const LOCAL_RECENT_PROGRESS_PREFIX = "recent-progress:";
const PROVIDER_PARAM_KEY = "provider";
const SERVER_PARAM_KEY = "server";
const PROVIDER_OPTIONS: ProviderId[] = ["vixsrc", "showbox", "anikai", "ruvo"];
const DEFAULT_PROVIDER: ProviderId = "vixsrc";
const ANIME_PROVIDER: ProviderId = "anikai";

/**
 * What each source is called, and what it is for, in words a viewer already
 * knows. The brand names — Vixsrc, ShowBox, AnimeKai — describe who runs the
 * server, which is information nobody watching a film can act on. What they can
 * act on is "this is the usual one" and "this is the one you try when the usual
 * one won't play".
 */
const PROVIDER_LABELS: Record<ProviderId, string> = {
  vixsrc: "Standard",
  showbox: "Backup",
  anikai: "Anime",
  ruvo: "Русская озвучка",
};

const PROVIDER_DESCRIPTIONS: Record<ProviderId, string> = {
  vixsrc: "Works for most films and shows",
  showbox: "Try this if Standard won't play",
  anikai: "Anime, subbed or dubbed",
  ruvo: "Russian voiceovers",
};

/** Returns the provider the URL explicitly asks for, or null when it says nothing. */
const parseProviderFromQuery = (value: string | null): ProviderId | null => {
  const normalized = String(value || "").trim().toLowerCase();
  return (PROVIDER_OPTIONS as string[]).includes(normalized)
    ? (normalized as ProviderId)
    : null;
};

const getProviderLabel = (provider: ProviderId) =>
  PROVIDER_LABELS[provider] || "Standard";

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
  } catch {
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
  const { movieId, movieType, seasonId, episodeId, startAt } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getStreamData, getStream } = useStream();
  const { deleteRating, myselfData, upsertRecentlyWatched, upsertRating } = useUsers();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLVideoElement | null>(null);
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
  /**
   * Everything in this season before the episode being played, for the info
   * panel's catch-up recap. Only earlier episodes are collected, so the recap
   * cannot spoil what is about to start.
   */
  const priorEpisodes = useMemo(
    () =>
      movieType === "tv"
        ? (tvSeasonsDetailsArr?.episodes || [])
            .filter(
              (episode) =>
                Number(episode?.episode_number) > 0 &&
                Number(episode?.episode_number) < Number(episodeId),
            )
            .sort((a, b) => Number(a?.episode_number) - Number(b?.episode_number))
            .map((episode) => ({
              seasonNumber: Number(seasonId) || 0,
              episodeNumber: Number(episode?.episode_number) || 0,
              name: String(episode?.name || ""),
              overview: String(episode?.overview || ""),
            }))
        : [],
    [episodeId, movieType, seasonId, tvSeasonsDetailsArr?.episodes],
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
  const mediaLogo = pickPreferredLogoPath(mediaImages?.logos) || "";
  const mediaLogoUrl = mediaLogo
    ? `https://image.tmdb.org/t/p/w500${mediaLogo}`
    : "";
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
  // Episodes / sources sheet
  const [panelTab, setPanelTab] = useState<WatchPanelTab>(
    movieType === "tv" ? "episodes" : "sources",
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  /**
   * Provider selection.
   *
   * A provider in the URL is always the viewer's own choice and wins. With
   * nothing in the URL we pick for them: AnimeKai for anime (it is the only
   * provider that carries it, and it carries subbed *and* dubbed), Vixsrc for
   * everything else. The choice waits for TMDB details to land, because
   * guessing "not anime" from an empty response would send anime titles to the
   * wrong provider and then visibly switch under them.
   */
  const explicitProvider = parseProviderFromQuery(searchParams.get(PROVIDER_PARAM_KEY));
  const mediaDetails =
    movieType === "tv" ? tvSeriesDetailsDataArr : movieDetailsDataArr;
  const areDetailsReady = Boolean(mediaDetails?.id);
  const isAnime = areDetailsReady && isAnimeTitle(movieType, mediaDetails);
  const autoProvider: ProviderId = isAnime ? ANIME_PROVIDER : DEFAULT_PROVIDER;
  const selectedProvider = explicitProvider || autoProvider;
  const isProviderResolved = Boolean(explicitProvider) || areDetailsReady;
  /**
   * Audio version for anime.
   *
   * The URL wins when it says something (a shared link, or a switch made in the
   * sources sheet). Otherwise we use what the viewer told us the first time
   * they were asked. When we have neither, we ask rather than defaulting to
   * subbed — viewers who wanted a dub used to conclude the site had none,
   * because the only control for it is buried behind the sources sheet.
   */
  const versionParam =
    searchParams.get("version") === "dub"
      ? "dub"
      : searchParams.get("version") === "sub"
        ? "sub"
        : null;
  const storedVersion = useMemo(
    () => readAnimeVersion(movieType, movieId),
    [movieId, movieType],
  );
  const resolvedVersion: AnimeMode | null = versionParam || storedVersion;
  const version: AnimeMode = resolvedVersion || "sub";
  const needsVersionChoice =
    isAnime && selectedProvider === ANIME_PROVIDER && !resolvedVersion;
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
  // Nothing plays behind the audio-version question — the stream context holds
  // whatever was last fetched, so without this the previous title would carry
  // on underneath it.
  const isPlaybackHeld = needsVersionChoice;
  const playbackStream = useMemo(
    () => (sessionBaseReady && !isPlaybackHeld ? availableStream : null),
    [availableStream, isPlaybackHeld, sessionBaseReady],
  );
  const providerPlaybackSourceUrl = useMemo(
    () =>
      sessionBaseReady && !isPlaybackHeld
        ? activeSource?.url || availableStream?.masterPlaylistUrl || ""
        : "",
    [
      activeSource?.url,
      availableStream?.masterPlaylistUrl,
      isPlaybackHeld,
      sessionBaseReady,
    ],
  );
  const playbackSourceUrl = providerPlaybackSourceUrl;

  // Offline playback — load from Cache API when ?offline=1
  const offlineParam = searchParams.get("offline") === "1";
  const [offlineBlobUrl, setOfflineBlobUrl] = useState("");
  const offlineBlobUrlRef = useRef("");
  useEffect(() => {
    if (!offlineParam || !movieId || !movieType) return;
    const CACHE_NAME = "smile-offline-v1";
    const cacheKey = movieType === "tv"
      ? `tv-${movieId}-s${seasonId || 1}e${episodeId || 1}`
      : `movie-${movieId}`;
    caches.open(CACHE_NAME).then(async (cache) => {
      const res = await cache.match(cacheKey);
      if (res) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        offlineBlobUrlRef.current = url;
        setOfflineBlobUrl(url);
      }
    }).catch(() => {});
    return () => {
      if (offlineBlobUrlRef.current) {
        URL.revokeObjectURL(offlineBlobUrlRef.current);
        offlineBlobUrlRef.current = "";
      }
    };
  }, [offlineParam, movieId, movieType, seasonId, episodeId]);
  const playbackSourceFormat: ProviderSourceFormat = useMemo(
    () =>
      activeSource?.format
        ? activeSource.format
        : inferFormatFromUrl(providerPlaybackSourceUrl),
    [activeSource?.format, providerPlaybackSourceUrl],
  );
  const isPreparingPlayback = getStreamData.isLoading;
  const isPlaybackUnavailable =
    !isPreparingPlayback &&
    !isPlaybackHeld &&
    sessionBaseReady &&
    !getStreamData.isAvailable &&
    getStreamData.provider === selectedProvider;
  const activeSourceIndex = activeSource
    ? availableSources.findIndex((source) => source.id === activeSource.id)
    : -1;
  const nextSourceOption =
    activeSourceIndex >= 0 ? availableSources[activeSourceIndex + 1] || null : null;
  const failoverContextKey = `${selectedProvider}:${movieType || ""}:${movieId || ""}:${seasonId || 0}:${episodeId || 0}`;
  const autoFailoverStateRef = useRef({
    contextKey: "",
    used: false,
  });
  /** Guards the one automatic AnimeKai → Vixsrc hop per title/episode. */
  const animeFallbackRef = useRef({
    contextKey: "",
    used: false,
  });
  const [autoProviderNotice, setAutoProviderNotice] = useState("");
  const centerErrorMessage = String(
    isPlaybackUnavailable
      ? getStreamData.errorMessage || "Unable to load stream for this provider/server."
      : lastPlaybackError,
  ).trim();

  useEffect(() => {
    if (!isProviderResolved) return;
    if (searchParams.get(PROVIDER_PARAM_KEY) === selectedProvider) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(PROVIDER_PARAM_KEY, selectedProvider);
    setSearchParams(nextParams, { replace: true });
  }, [isProviderResolved, searchParams, selectedProvider, setSearchParams]);

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

  // The provider's own note ("served a different mirror", …) used to sit in a
  // bar over the video; it is a passing remark, so it passes by.
  useEffect(() => {
    if (!providerNotice) return;
    toast.message(providerNotice);
  }, [providerNotice]);

  const mediaContextKey = `${movieType || ""}:${movieId || ""}:${seasonId || 0}:${episodeId || 0}`;

  useEffect(() => {
    if (animeFallbackRef.current.contextKey === mediaContextKey) return;
    animeFallbackRef.current = { contextKey: mediaContextKey, used: false };
    setAutoProviderNotice("");
  }, [mediaContextKey]);

  /**
   * Intro/outro timings for the skip button.
   *
   * Only series are asked for: no public source has movie timings, so a request
   * for one is a round trip that can only ever come back empty. Failures are
   * silent by design — a missing skip button is a missing convenience, not
   * something worth interrupting playback to report.
   */
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);

  useEffect(() => {
    setSkipSegments([]);

    if (movieType !== "tv" || !movieId || !seasonId || !episodeId) return;

    let isCurrent = true;
    providersAPI
      .getSkipTimes(
        "tv",
        movieId,
        Number(seasonId),
        Number(episodeId),
        fallbackDurationMinutes * 60,
      )
      .then((response) => {
        if (!isCurrent) return;
        setSkipSegments(response.data?.segments || []);
      })
      .catch(() => {
        if (isCurrent) setSkipSegments([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [episodeId, fallbackDurationMinutes, movieId, movieType, seasonId]);

  useEffect(() => {
    setSessionBaseProgress(0);
    setSessionBaseReady(false);
    setPlayerReloadToken(0);
    lastProgressWriteAtRef.current = 0;
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    setAutoplayCountdown(null);
    setAutoplayNextPath("");
    loadedSourceRef.current = "";
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
    } catch {
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

  /**
   * "Up next", the way every streaming service does it.
   *
   * Finishing an episode and being returned to a still frame is the moment a
   * viewer leaves; ten seconds and the next one starts by itself. It is a
   * countdown rather than an immediate jump because the credits are sometimes
   * the point, and "Cancel" has to be reachable without a race.
   */
  /**
   * Which episode a countdown has already been offered for, so finishing one
   * episode cannot queue the next three.
   */
  const autoplayOfferedForRef = useRef("");
  /** When progress was last written to disk — see `handlePlayerTimeUpdate`. */
  const lastProgressWriteAtRef = useRef(0);

  /**
   * Moving on is one action with one implementation.
   *
   * The countdown used to `navigate` on its own, which meant it skipped
   * everything `episodeChange` does — saving the position, carrying the
   * provider and party in the query, telling the rest of the party the room is
   * moving. A party would leave behind whoever pressed Cancel.
   */
  const episodeChangeRef = useRef<(path: string) => void>(() => undefined);

  const startAutoplay = useCallback((path: string) => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);

    setAutoplayNextPath(path);
    setAutoplayCountdown(AUTOPLAY_COUNTDOWN_SECONDS);
    autoplayTimerRef.current = setInterval(() => {
      setAutoplayCountdown((remaining) => {
        if (remaining === null || remaining <= 1) {
          if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
          episodeChangeRef.current(path);
          return null;
        }
        return remaining - 1;
      });
    }, 1000);
  }, []);

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

  /**
   * Share the exact moment on screen.
   *
   * This used to be a pair of scissors, which nobody read as "share" — the
   * clipboard was the only outcome and the icon promised something else. It is
   * now the platform's own share sheet where there is one (every phone), and a
   * copied link where there is not.
   */
  const shareCurrentTime = useCallback(async () => {
    const currentSecs = Math.floor(Number(playerRef.current?.currentTime || 0));
    const url = new URL(window.location.href);
    url.searchParams.set("t", String(currentSecs));
    // A party link is personal to this session; sharing it would drag whoever
    // opens it into the party rather than to the title.
    url.searchParams.delete("party");
    const link = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({ title: mediaTitle, url: link });
        return;
      } catch {
        // Dismissed, or unsupported for this payload — fall back to copying.
      }
    }

    copyToClipboard(link);
    setClipCopied(true);
    setTimeout(() => setClipCopied(false), 2000);
  }, [mediaTitle]);

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
    /**
     * "Have they finished it?" is a different question from "how long is it?".
     *
     * `durationMinutes` above deliberately grows to fit the position, so a
     * stream that runs past its advertised runtime still saves sensibly. Judging
     * completion against that number makes it unfalsifiable — progress is
     * clamped to a duration that was just widened to match, so the ratio is
     * always 1 and everything is "finished". The verdict needs a duration that
     * was measured, not one derived from the very value being tested.
     */
    const measuredDurationMinutes =
      Number(rawDurationMinutes) || fallbackDurationMinutes || 0;
    const progressRatio =
      measuredDurationMinutes > 0
        ? rawProgressMinutes / measuredDurationMinutes
        : 0;
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
    }
  }, [episodeId, fallbackDurationMinutes, flushRecentProgress, getNextEpisodeForSeries, mediaPoster, mediaTitle, movieId, movieType, recentProgressStorageKey, routeProgressStorageKey, seasonId, sessionBaseReady]);

  const episodeChange = (nextPath: string) => {
    void (async () => {
      await persistProgress(getCurrentProgressMinutes(), getPlayerDurationMinutes());
      await flushRecentProgress({ force: true });
      const query = searchParams.toString();
      const target = query ? `${nextPath}?${query}` : nextPath;

      // In a party the episode belongs to everyone, so the room moves together
      // rather than one person quietly ending up an episode ahead.
      if (party.status === "connected" && party.canControl) {
        const [, , mediaId, season, episode] = nextPath.split("/");
        const isSeriesPath = movieType === "tv";
        party.broadcastNavigation(target, {
          mediaType: movieType || "movie",
          mediaId: String(mediaId || movieId || ""),
          season: isSeriesPath && season ? Number(season) : null,
          episode: isSeriesPath && episode ? Number(episode) : null,
        });
      }

      navigate(target);
    })();
  };

  episodeChangeRef.current = episodeChange;

  useEffect(() => {
    if (!movieId || !movieType) return;

    if (movieType === "movie") {
      movie(movieId);
      movieImages(movieId);
      return;
    }

    tvSeries(movieId);
    tvImages(movieId);
    if (seasonId) {
      tvSeasonsDetails(movieId, parseInt(seasonId));
    }
  }, [movieId, movieType, seasonId]);

  useEffect(() => {
    if (!movieId || !movieType || !isProviderResolved) return;
    // Asking which audio version they want is pointless if we have already
    // fetched one of them behind the question. A link that names AnimeKai
    // outright resolves the provider before TMDB answers, so it also has to
    // wait here — otherwise the question arrives after the subbed stream.
    if (needsVersionChoice) return;
    if (selectedProvider === ANIME_PROVIDER && !areDetailsReady) return;

    const animeVersion = selectedProvider === ANIME_PROVIDER ? version : undefined;

    if (movieType === "movie") {
      getStream(selectedProvider, "movie", movieId, undefined, undefined, animeVersion);
      return;
    }

    if (seasonId && episodeId) {
      getStream(selectedProvider, "tv", movieId, seasonId, episodeId, animeVersion);
    }
  }, [
    areDetailsReady,
    episodeId,
    isProviderResolved,
    movieId,
    movieType,
    needsVersionChoice,
    seasonId,
    selectedProvider,
    version,
  ]);

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

  /**
   * `loaded-metadata` is not a once-per-episode event: HLS fires it again
   * whenever the media element is re-attached, which is what recovering from a
   * decode error or a large forward seek looks like from here. Resuming on
   * every one of them dragged the viewer back to where they opened the episode
   * moments after they had skipped an intro. The resume belongs to the source,
   * so it is spent once and not offered again until the source changes.
   */
  const resumedSourceRef = useRef("");
  /**
   * The source the media element has metadata for.
   *
   * Changing episode does not swap the player instantly — the old one keeps
   * playing, and keeps firing `time-update`, until the next stream URL resolves.
   * Those events used to be attributed to the episode the route had already
   * moved to, which is how finishing one episode marked the *next* one finished
   * too, and the one after that, all the way to the end of the season.
   */
  const loadedSourceRef = useRef("");

  const handlePlayerLoadedMetadata = useCallback(() => {
    if (!playerRef.current) return;

    const resumeKey = `${playbackSourceUrl}:${playerReloadToken}`;
    loadedSourceRef.current = playbackSourceUrl;
    if (resumedSourceRef.current === resumeKey) return;
    resumedSourceRef.current = resumeKey;

    // In a party the position belongs to the party, not to this viewer's own
    // history. Resuming where *they* left off would drop them somewhere nobody
    // else is, and the correction that followed would look like a glitch.
    if (searchParams.get("party")) return;

    const tParam = Number(searchParams.get("t") || 0);
    const startAtMinutes = Math.max(0, tParam > 0 ? tParam / 60 : sessionBaseProgress);
    if (startAtMinutes > 0) {
      playerRef.current.currentTime = startAtMinutes * 60;
    }
  }, [playbackSourceUrl, playerReloadToken, sessionBaseProgress, searchParams]);

  const handlePlayerTimeUpdate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // The player is still on the previous episode's file; its position says
    // nothing about the one the route has moved to.
    if (loadedSourceRef.current !== playbackSourceUrl) return;

    const currentSeconds = Number(player.currentTime || 0);
    const durationSeconds = Number(player.duration || 0);
    const progressMinutes = currentSeconds / 60;

    // Cheap, and everything else reads it, so it stays current every tick.
    progressRef.current.lastKnownProgressMinutes = progressMinutes;

    /**
     * Saving, however, is not cheap. `time-update` fires roughly four times a
     * second, and each pass wrote two `localStorage` keys and serialised a
     * progress object to JSON — all synchronous, all on the main thread, ten
     * thousand times over a film. Throttling it costs at most a few seconds of
     * resume accuracy, and pause, navigation and page-hide all still force an
     * immediate write, so nothing is actually lost.
     */
    const now = Date.now();
    if (now - lastProgressWriteAtRef.current >= PROGRESS_WRITE_INTERVAL_MS) {
      lastProgressWriteAtRef.current = now;
      writeStoredNumber(routeProgressStorageKey, progressMinutes);
      void persistProgress(progressMinutes, getPlayerDurationMinutes());
    }

    // "Up next" is timed off the file itself, never off TMDB's runtime — the
    // two disagree by minutes often enough that a countdown driven by the
    // second one arrives mid-scene.
    const remainingSeconds = durationSeconds - currentSeconds;

    if (
      movieType !== "tv" ||
      durationSeconds <= 0 ||
      currentSeconds <= 0 ||
      remainingSeconds > AUTOPLAY_LEAD_SECONDS
    ) {
      // Seeking back into the episode withdraws an offer already on screen —
      // the viewer has plainly not finished with it — and lets a fresh one be
      // made if they do reach the end this time. Pressing Cancel does not:
      // that answer stands for the rest of the episode.
      if (remainingSeconds > AUTOPLAY_LEAD_SECONDS * 2) {
        if (autoplayOfferedForRef.current === routeProgressStorageKey) {
          autoplayOfferedForRef.current = "";
          cancelAutoplay();
        }
      }
      return;
    }

    if (autoplayOfferedForRef.current === routeProgressStorageKey) return;

    const next = getNextEpisodeForSeries();
    if (!next.nextSeason || !next.nextEpisode || !movieId) return;

    autoplayOfferedForRef.current = routeProgressStorageKey;
    startAutoplay(`/tv/${movieId}/${next.nextSeason}/${next.nextEpisode}/watch`);
  }, [
    cancelAutoplay,
    getNextEpisodeForSeries,
    getPlayerDurationMinutes,
    movieId,
    movieType,
    persistProgress,
    playbackSourceUrl,
    routeProgressStorageKey,
    startAutoplay,
  ]);

  const handlePlayerPause = useCallback(() => {
    if (!playerRef.current) return;
    const progressMinutes = Number(playerRef.current.currentTime || 0) / 60;
    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(progressMinutes, durationMinutes).then(() =>
      flushRecentProgress({ force: true }),
    );
  }, [flushRecentProgress, getPlayerDurationMinutes, persistProgress]);

  const handlePlayerEnded = useCallback(() => {
    if (loadedSourceRef.current !== playbackSourceUrl) return;

    const durationMinutes = getPlayerDurationMinutes();
    void persistProgress(durationMinutes, durationMinutes, true);

    if (movieType !== "tv" || !movieId) return;
    if (autoplayOfferedForRef.current === routeProgressStorageKey) return;

    const next = getNextEpisodeForSeries();
    if (!next.nextSeason || !next.nextEpisode) return;

    autoplayOfferedForRef.current = routeProgressStorageKey;
    startAutoplay(`/tv/${movieId}/${next.nextSeason}/${next.nextEpisode}/watch`);
  }, [
    getNextEpisodeForSeries,
    getPlayerDurationMinutes,
    movieId,
    movieType,
    persistProgress,
    playbackSourceUrl,
    routeProgressStorageKey,
    startAutoplay,
  ]);

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

  /**
   * Remember the answer as well as acting on it — the whole point of asking is
   * that the viewer should never have to hunt for this control again.
   */
  const setVersionInQuery = useCallback((nextVersion: AnimeMode) => {
    writeAnimeVersion(nextVersion, movieType, movieId);
    setLastPlaybackError("");
    setSearchParams((previous) => {
      const nextParams = new URLSearchParams(previous);
      nextParams.set("version", nextVersion);
      nextParams.delete(SERVER_PARAM_KEY);
      return nextParams;
    });
  }, [movieId, movieType, setSearchParams]);

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

    // AnimeKai was our guess, not the viewer's — when it comes back empty we
    // quietly fall back rather than showing them an error they didn't ask for.
    if (
      !explicitProvider &&
      selectedProvider === ANIME_PROVIDER &&
      !animeFallbackRef.current.used
    ) {
      animeFallbackRef.current.used = true;
      const fallbackMessage = "No anime source for this title, so the standard one is playing instead.";
      setAutoProviderNotice(fallbackMessage);
      toast.message(fallbackMessage);
      setProviderInQuery(DEFAULT_PROVIDER);
      return;
    }

    setLastPlaybackError(
      String(getStreamData.errorMessage || "Unable to load stream for this provider/server."),
    );
  }, [
    explicitProvider,
    getStreamData.errorMessage,
    isPlaybackUnavailable,
    selectedProvider,
  ]);

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

  const openPanel = (tab: WatchPanelTab) => {
    setPanelTab(tab);
    setIsPanelOpen(true);
  };

  const imdbInfo = useImdbWatchInfo({
    mediaType: movieType,
    mediaId: movieId,
    season: seasonId,
    episode: episodeId,
  });
  const openInfoPanel = () => openPanel("info");

  /* ── Watch together ─────────────────────────────────────────────────────── */

  /**
   * A party is just this page with `?party=CODE` on it.
   *
   * Everything below the party layer — provider selection, resume position,
   * subtitles, skip timings — is the same code path a solo viewer runs, which
   * is the point: the old implementation put the whole watch page in an iframe
   * inside a second page, so nothing the player knew was available to the party
   * and nothing the party knew reached the player.
   */
  const partyCode = String(searchParams.get("party") || "").toUpperCase() || null;
  const partyIdentity = useMemo(
    () =>
      isLoggedIn
        ? {}
        : { pid: readGuestPid(), displayName: readGuestName() || "Guest" },
    [],
  );

  const handlePartyNavigate = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

  const handlePartyLeave = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("party");
    setSearchParams(nextParams, { replace: true });
    toast.message("You left the watch party.");
  }, [searchParams, setSearchParams]);

  const party = useWatchPartySession({
    code: partyCode,
    playerRef,
    identity: partyIdentity,
    playerKey: `${playbackSourceUrl}:${playerReloadToken}`,
    onNavigate: handlePartyNavigate,
    onLeave: handlePartyLeave,
  });

  const startWatchParty = useCallback(async () => {
    if (!isLoggedIn) {
      toast.message("Sign in to start a watch party — guests can still join yours.");
      navigate("/auth/login");
      return;
    }

    try {
      const created = await watchPartyAPI.create({
        mediaType: movieType || "movie",
        mediaId: movieId || "",
        ...(seasonId && { season: Number(seasonId) }),
        ...(episodeId && { episode: Number(episodeId) }),
        provider: selectedProvider,
        ...(activeSource?.id && { server: activeSource.id }),
        ...(selectedProvider === ANIME_PROVIDER && { version }),
      });

      copyToClipboard(`${window.location.origin}/party/${created.code}`);
      toast.success("Party started — the invite link is on your clipboard.");

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("party", created.code);
      setSearchParams(nextParams);
    } catch {
      toast.error("Could not start the watch party.");
    }
  }, [
    activeSource?.id,
    episodeId,
    movieId,
    movieType,
    navigate,
    searchParams,
    seasonId,
    selectedProvider,
    setSearchParams,
    version,
  ]);

  const [partyLayout, setPartyLayout] = useState<PartyLayout>(readPartyLayout);

  const changePartyLayout = useCallback((layout: PartyLayout) => {
    setPartyLayout(layout);
    writePartyLayout(layout);
  }, []);

  /**
   * Faces only take room from the picture while there are faces to show —
   * before anyone turns a camera on, every layout is the full-screen one.
   */
  const partyTileCount = partyCode
    ? party.people.filter((person) => person.sessionId).length
    : 0;
  const partyVideoInset = videoInsetFor(partyLayout, partyTileCount);

  const copyPartyInvite = useCallback(() => {
    if (!partyCode) return;
    copyToClipboard(`${window.location.origin}/party/${partyCode}`);
    toast.success("Invite link copied.");
  }, [partyCode]);

  /**
   * The one control a viewer who is stuck can use without understanding any of
   * this: another copy of the same thing. Mirrors of the current source come
   * first — they are the cheapest hop and usually enough — and only when they
   * run out does it move to a different source entirely.
   */
  const tryAnotherSource = useCallback(() => {
    if (tryNextServer()) {
      toast.message("Switching to another server…");
      return;
    }

    const order = PROVIDER_OPTIONS.filter(
      (option) => option !== selectedProvider,
    );
    const nextProvider = order[0];
    if (!nextProvider) {
      toast.error("No other sources are available for this title.");
      return;
    }

    setProviderInQuery(nextProvider);
    toast.message(`Trying ${getProviderLabel(nextProvider)}…`);
  }, [selectedProvider, tryNextServer]);

  const providerOptions: ProviderOption[] = PROVIDER_OPTIONS.map((providerOption) => ({
    id: providerOption,
    label: getProviderLabel(providerOption),
    description: PROVIDER_DESCRIPTIONS[providerOption],
    recommended: isAnime
      ? providerOption === ANIME_PROVIDER
      : providerOption === DEFAULT_PROVIDER,
  }));
  const nextEpisodeMeta =
    movieType === "tv" ? getNextEpisodeForSeries() : { nextSeason: 0, nextEpisode: 0 };
  const hasNextEpisode = Boolean(
    nextEpisodeMeta.nextSeason && nextEpisodeMeta.nextEpisode,
  );
  const upNextEpisode =
    movieType === "tv" && nextEpisodeMeta.nextSeason === Number(seasonId || 0)
      ? (tvSeasonsDetailsArr?.episodes || []).find(
        (episode) =>
          Number(episode?.episode_number) === nextEpisodeMeta.nextEpisode,
      )
      : undefined;
  const chromeSubtitle =
    movieType === "tv"
      ? [
        `S${Number(seasonId || 1)} · E${Number(episodeId || 1)}`,
        activeEpisodeData?.name,
      ]
        .filter(Boolean)
        .join(" · ")
      : [
        movieDetailsDataArr?.release_date?.slice(0, 4),
        fallbackDurationMinutes ? `${fallbackDurationMinutes} min` : "",
      ]
        .filter(Boolean)
        .join(" · ");
  const subtitleOffsetKey = buildSubtitleOffsetKey({
    mediaType: movieType,
    mediaId: movieId,
    season: seasonId,
    episode: episodeId,
  });
  const sourcesLabel = `${getProviderLabel(resolvedProvider)}${
    activeSource?.name ? ` · ${activeSource.name}` : ""
  }`;
  /** Shared by the top-bar actions so they read on top of the picture. */
  const playerActionStyles = {
    color: "#ededed",
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(10,10,10,0.55)",
    backdropFilter: "blur(8px)",
    "&:hover": {
      backgroundColor: "rgba(26,26,26,0.85)",
      borderColor: "rgba(255,255,255,0.28)",
      color: "#ffffff",
    },
  } as const;
  const titleMeta = (
    <>
      {imdbInfo.rating > 0 ? (
        <Chip
          size="sm"
          startDecorator={<Star sx={{ fontSize: 13, color: "#F5C518" }} />}
          sx={{
            height: 26,
            backgroundColor: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(245,197,24,0.35)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        >
          {imdbInfo.rating.toFixed(1)}
        </Chip>
      ) : null}
    </>
  );
  const errorOverlay = (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          width: "min(480px, calc(100% - 32px))",
          px: 3,
          py: 2.5,
          borderRadius: "12px",
          border: "1px solid #1f1f1f",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(14px)",
          textAlign: "center",
          pointerEvents: "auto",
        }}
      >
        <Typography level="h4" sx={{ mb: 1 }}>
          Playback error
        </Typography>
        <Typography level="body-md" sx={{ mb: 1.5 }}>
          {centerErrorMessage}
        </Typography>
        <Typography level="body-xs" sx={{ mb: 2 }}>
          {sourcesLabel}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
          <Button size="sm" onClick={retryCurrentServer}>
            Retry
          </Button>
          {availableSources.length > 1 ? (
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => openPanel("sources")}
            >
              Change source
            </Button>
          ) : null}
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
  );

  if (isIncorrect) {
    return <NotFound />;
  }

  if (!movieId || !movieType) {
    return (
      <Box width={"100%"} height={"100vh"}>
        <Box className="sm-shimmer" sx={{ width: 200, height: 10, borderRadius: "6px" }} />
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
      <PlaybackSurface
        playerRef={playerRef}
        stream={offlineParam ? null : playbackStream}
        sourceUrl={offlineParam && offlineBlobUrl ? offlineBlobUrl : providerPlaybackSourceUrl}
        sourceFormat={offlineParam ? "mp4" : playbackSourceFormat}
        poster={backdropPoster}
        title={mediaTitle}
        onLoadedMetadata={handlePlayerLoadedMetadata}
        onTimeUpdate={handlePlayerTimeUpdate}
        onPause={handlePlayerPause}
        onEnded={handlePlayerEnded}
        onPlaybackError={handlePlaybackError}
        onPlaybackReady={handlePlaybackReady}
        reloadToken={playerReloadToken}
        subtitleOffsetKey={subtitleOffsetKey}
        videoInset={partyVideoInset}
        captionsLift={
          partyLayout === "theater" && partyTileCount ? THEATER_STRIP_PX : 0
        }
        chrome={{
          title: mediaTitle || "Preparing stream",
          titleLogo: mediaLogoUrl,
          subtitle: chromeSubtitle,
          titleMeta,
          onBack: () => navigate(`/${movieType}/${movieId}`),
          skipSegments,
          sourcesLabel,
          onOpenSources: () => openPanel("sources"),
          onOpenInfo: openInfoPanel,
          ...(movieType === "tv"
            ? { onOpenEpisodes: () => openPanel("episodes") }
            : {}),
          ...(hasNextEpisode
            ? {
              onNextEpisode: () =>
                episodeChange(
                  `/${movieType}/${movieId}/${nextEpisodeMeta.nextSeason}/${nextEpisodeMeta.nextEpisode}/watch`,
                ),
            }
            : {}),
          topRight: (
            <>
              <IconButton
                aria-label="Share this moment"
                title="Share this moment"
                variant="plain"
                onClick={shareCurrentTime}
                sx={playerActionStyles}
              >
                {clipCopied ? (
                  <Check sx={{ fontSize: 18 }} />
                ) : (
                  <IosShare sx={{ fontSize: 18 }} />
                )}
              </IconButton>
              {partyCode ? (
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<People sx={{ fontSize: 15 }} />}
                  onClick={copyPartyInvite}
                  title="Copy the invite link"
                  sx={playerActionStyles}
                >
                  {party.people.length || 1}
                  <Box
                    component="span"
                    sx={{
                      display: { xs: "none", sm: "inline" },
                      ml: 0.5,
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "code",
                      fontSize: "0.75rem",
                    }}
                  >
                    {partyCode}
                  </Box>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<People sx={{ fontSize: 15 }} />}
                  sx={playerActionStyles}
                  onClick={startWatchParty}
                >
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    Watch together
                  </Box>
                </Button>
              )}
            </>
          ),
        }}
        overlay={
          <>
            <WatchSidePanel
              open={isPanelOpen}
              tab={panelTab}
              onTabChange={setPanelTab}
              onClose={() => setIsPanelOpen(false)}
              showEpisodes={movieType === "tv"}
              seasons={(tvSeriesDetailsDataArr?.seasons || []).filter(
                (season) => season?.season_number !== 0,
              )}
              episodes={tvSeasonsDetailsArr?.episodes || []}
              isEpisodesLoading={Boolean(tvSeasonsDetailsData?.isLoading)}
              currentSeason={Number(seasonId || 1)}
              currentEpisode={Number(episodeId || 1)}
              onSeasonChange={(season) => {
                episodeChange(`/${movieType}/${movieId}/${season}/1/watch`);
                setIsPanelOpen(false);
              }}
              onEpisodeSelect={(episode) => {
                episodeChange(`/${movieType}/${movieId}/${seasonId}/${episode}/watch`);
                setIsPanelOpen(false);
              }}
              providers={providerOptions}
              selectedProvider={selectedProvider}
              onProviderChange={(provider) => {
                if (provider === selectedProvider) return;
                setProviderInQuery(provider);
              }}
              sources={availableSources}
              activeSourceId={activeSource?.id || ""}
              onSourceChange={(sourceId) => {
                // Picking a server is the end of that errand — leaving the
                // sheet open just puts a full-screen panel between the viewer
                // and the video they came back to.
                setServerInQuery(sourceId);
                setIsPanelOpen(false);
              }}
              isSourcesLoading={isPreparingPlayback}
              onTryAnother={() => {
                tryAnotherSource();
                setIsPanelOpen(false);
              }}
              showVersion={selectedProvider === ANIME_PROVIDER}
              version={version}
              onVersionChange={setVersionInQuery}
              notice={providerNotice || autoProviderNotice}
              infoContent={
                <WatchInfoPanel
                  mediaType={movieType}
                  title={mediaTitle}
                  subtitle={chromeSubtitle}
                  episodeName={
                    movieType === "tv" ? activeEpisodeData?.name : undefined
                  }
                  overview={
                    movieType === "tv"
                      ? activeEpisodeData?.overview
                      : movieDetailsDataArr?.overview
                  }
                  stillPath={
                    movieType === "tv" ? activeEpisodeData?.still_path : undefined
                  }
                  airDate={
                    movieType === "tv"
                      ? activeEpisodeData?.air_date
                      : movieDetailsDataArr?.release_date
                  }
                  runtime={fallbackDurationMinutes}
                  genres={(mediaDetails?.genres || [])
                    .map((genre) => genre?.name)
                    .filter(Boolean) as string[]}
                  imdb={imdbInfo}
                  tmdbId={movieType === "tv" ? String(movieId || "") : undefined}
                  seasonNumber={movieType === "tv" ? Number(seasonId) : undefined}
                  episodeNumber={movieType === "tv" ? Number(episodeId) : undefined}
                  priorEpisodes={priorEpisodes}
                />
              }
            />
            {autoplayCountdown !== null ? (
              <Box
                sx={{
                  position: "absolute",
                  right: { xs: 12, md: 24 },
                  bottom: { xs: 84, md: 104 },
                  zIndex: 11,
                  width: "min(340px, calc(100% - 24px))",
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid #1f1f1f",
                  background: "rgba(10,10,10,0.94)",
                  backdropFilter: "blur(12px)",
                  pointerEvents: "auto",
                  animation: "sm-upnext-in 200ms ease",
                  "@keyframes sm-upnext-in": {
                    from: { transform: "translateY(12px)", opacity: 0 },
                    to: { transform: "translateY(0)", opacity: 1 },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography level="body-xs">Up next</Typography>
                  <IconButton
                    aria-label="Cancel autoplay"
                    size="sm"
                    variant="plain"
                    onClick={cancelAutoplay}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                  {upNextEpisode?.still_path ? (
                    <Box
                      component="img"
                      src={`https://image.tmdb.org/t/p/w300${upNextEpisode.still_path}`}
                      alt=""
                      sx={{
                        width: 96,
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #1f1f1f",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      level="title-sm"
                      sx={{
                        color: "#ededed",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {upNextEpisode?.name || "Next episode"}
                    </Typography>
                    <Typography level="body-xs">
                      {`S${nextEpisodeMeta.nextSeason} · E${nextEpisodeMeta.nextEpisode}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Button
                    size="sm"
                    startDecorator={<SkipNext sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      cancelAutoplay();
                      episodeChange(autoplayNextPath);
                    }}
                  >
                    Play now
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={cancelAutoplay}
                  >
                    {`Cancel (${autoplayCountdown}s)`}
                  </Button>
                </Box>
                <LinearProgress
                  determinate
                  sx={{ mt: 1.5 }}
                  value={
                    ((AUTOPLAY_COUNTDOWN_SECONDS - autoplayCountdown) /
                      AUTOPLAY_COUNTDOWN_SECONDS) *
                    100
                  }
                />
              </Box>
            ) : null}
            {partyCode && party.status === "connected" ? (
              <WatchPartyDock
                session={party}
                layout={partyLayout}
                onLayoutChange={changePartyLayout}
                onExit={party.leave}
              />
            ) : null}
            {centerErrorMessage ? errorOverlay : null}
          </>
        }
      />
      {!playbackSourceUrl ? (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            // Above the audio-version prompt: leaving must stay possible while
            // the question is on screen.
            zIndex: 1003,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1.5,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
          }}
        >
          <IconButton
            aria-label="Back to details"
            variant="plain"
            onClick={() => navigate(`/${movieType}/${movieId}`)}
            sx={playerActionStyles}
          >
            <ArrowBackIos sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            {mediaLogoUrl ? (
              <Box
                component="img"
                src={mediaLogoUrl}
                alt={mediaTitle || "Title logo"}
                sx={{
                  width: "auto",
                  maxWidth: { xs: "170px", sm: "260px" },
                  height: { xs: "26px", sm: "30px" },
                  objectFit: "contain",
                  objectPosition: "left center",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
                }}
              />
            ) : (
              <Typography level="title-md" sx={{ color: "#ffffff" }}>
                {mediaTitle || "Preparing stream"}
              </Typography>
            )}
            {chromeSubtitle ? (
              <Typography level="body-xs">{chromeSubtitle}</Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}
      {/* The question comes before the stream request, so it is a page-level
          overlay — at this point `<media-player>` has no source and renders
          nothing to hang it off. */}
      {needsVersionChoice ? (
        <Box sx={{ position: "absolute", inset: 0, zIndex: 1002 }}>
          <AnimeVersionPrompt title={mediaTitle} onChoose={setVersionInQuery} />
        </Box>
      ) : null}
      {!playbackSourceUrl && centerErrorMessage && !needsVersionChoice
        ? errorOverlay
        : null}
      {!playbackSourceUrl && !centerErrorMessage && !needsVersionChoice ? (
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
            <Typography level="body-sm" sx={{ mt: 1 }}>
              {isFetching
                ? "Loading episode details in the background."
                : `${getProviderLabel(selectedProvider)}${
                  isAnime && selectedProvider === ANIME_PROVIDER
                    ? " — picked automatically for anime"
                    : ""
                }`}
            </Typography>
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
