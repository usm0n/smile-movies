import { useEffect, useMemo, useState } from "react";
import { resolveImdbId } from "../service/api/imdb/imdb.api.service";

export type TorrentioMediaType = "movie" | "tv";

type TorrentioStream = {
  name?: string;
  title?: string;
  infoHash?: string;
  url?: string;
  behaviorHints?: {
    filename?: string;
    bingeGroup?: string;
  };
};

type TorrentioResponse = {
  streams?: TorrentioStream[];
};

export type TorrentioStreamMetadata = {
  infoHash: string;
  url?: string;
  seeds: number;
  title: string;
  filename: string;
};

type UseTorrentioState = {
  stream: TorrentioStreamMetadata | null;
  infoHash: string;
  imdbId: string;
  isLoading: boolean;
  error: string;
};

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm)(?:\b|$|[?#])/i;
const INFO_HASH_PATTERN = /(?:btih:|urn:btih:)([a-z0-9]{32,40})/i;
const SEED_PATTERNS = [
  /(?:seeders?|seeds?|👤|👥|👨‍👩‍👧‍👦)\s*[:：-]?\s*(\d+(?:[,.]\d+)?\s*[kKmM]?)/i,
  /(\d+(?:[,.]\d+)?\s*[kKmM]?)\s*(?:seeders?|seeds?)/i,
];

const normalizeInfoHash = (value: string) => value.trim().replace(/^urn:btih:/i, "").replace(/^btih:/i, "");

const parseCompactNumber = (value: string): number => {
  const normalized = value.trim().replace(/,/g, "");
  const multiplier = normalized.toLowerCase().endsWith("m")
    ? 1_000_000
    : normalized.toLowerCase().endsWith("k")
      ? 1_000
      : 1;
  const numericValue = Number.parseFloat(normalized.replace(/[kKmM]$/g, ""));

  return Number.isFinite(numericValue) ? Math.round(numericValue * multiplier) : 0;
};

const extractSeeds = (stream: TorrentioStream): number => {
  const searchableText = [stream.title, stream.name, stream.behaviorHints?.bingeGroup]
    .filter(Boolean)
    .join("\n");

  for (const pattern of SEED_PATTERNS) {
    const match = searchableText.match(pattern);
    if (match?.[1]) {
      return parseCompactNumber(match[1]);
    }
  }

  return 0;
};

const extractInfoHash = (stream: TorrentioStream): string => {
  if (stream.infoHash) {
    return normalizeInfoHash(stream.infoHash);
  }

  const match = stream.url?.match(INFO_HASH_PATTERN);
  return match?.[1] ? normalizeInfoHash(match[1]) : "";
};

const getStreamFilename = (stream: TorrentioStream) =>
  String(stream.behaviorHints?.filename || stream.title || stream.name || "");

const isPlayableVideoStream = (stream: TorrentioStream) =>
  VIDEO_EXTENSION_PATTERN.test(getStreamFilename(stream));

export const selectBestTorrentioStream = (
  streams: TorrentioStream[] = [],
): TorrentioStreamMetadata | null => {
  const candidates = streams
    .filter(isPlayableVideoStream)
    .map((stream) => ({
      infoHash: extractInfoHash(stream),
      seeds: extractSeeds(stream),
      url: stream.url?.trim() || undefined,
      filename: getStreamFilename(stream),
      title: String(stream.title || stream.name || stream.behaviorHints?.filename || "Torrentio stream"),
    }))
    .filter((candidate) => Boolean(candidate.infoHash));

  if (!candidates.length) {
    return null;
  }

  const best = candidates.sort((a, b) => b.seeds - a.seeds)[0];

  return {
    infoHash: best.infoHash,
    url: best.url,
    seeds: best.seeds,
    title: best.title,
    filename: best.filename,
  };
};

function useTorrentio(tmdbId?: string | number | null, type?: TorrentioMediaType | null): UseTorrentioState {
  const [stream, setStream] = useState<TorrentioStreamMetadata | null>(null);
  const [imdbId, setImdbId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedTmdbId = useMemo(() => String(tmdbId || "").trim(), [tmdbId]);
  const normalizedType = type === "tv" ? "tv" : type === "movie" ? "movie" : "";

  useEffect(() => {
    if (!normalizedTmdbId || !normalizedType) {
      setStream(null);
      setImdbId("");
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    setIsLoading(true);
    setError("");
    setStream(null);
    setImdbId("");

    const loadTorrentioStream = async () => {
      const resolvedImdbId = normalizedTmdbId.startsWith("tt")
        ? normalizedTmdbId
        : await resolveImdbId(normalizedTmdbId, normalizedType);

      if (isCancelled) return;

      if (!resolvedImdbId) {
        throw new Error("Could not resolve this TMDB ID to an IMDb ID.");
      }

      setImdbId(resolvedImdbId);

      const response = await fetch(`https://torrentio.strem.fun/stream/${normalizedType}/${resolvedImdbId}.json`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Torrentio responded with ${response.status}`);
      }

      const payload = await response.json() as TorrentioResponse;
      const bestStream = selectBestTorrentioStream(payload.streams || []);

      if (!bestStream) {
        throw new Error("No seeded .mp4 or .webm Torrentio stream was found.");
      }

      if (!isCancelled) {
        setStream(bestStream);
      }
    };

    loadTorrentioStream()
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError" || isCancelled) return;
        setError(fetchError.message || "Failed to load Torrentio stream metadata.");
        setStream(null);
      })
      .finally(() => {
        if (!controller.signal.aborted && !isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [normalizedTmdbId, normalizedType]);

  return {
    stream,
    infoHash: stream?.infoHash || "",
    imdbId,
    isLoading,
    error,
  };
}

export default useTorrentio;
