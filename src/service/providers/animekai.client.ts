import { smbV1API, tmdbAPI } from "../api/api";
import {
  AnimeMode,
  VixsrcMediaType,
  VixsrcPlaybackStream,
  VixsrcStreamResponse,
  VixsrcTrack,
} from "../../types/providers";

const ANIMEKAI_BASE_URL = "https://animekai.to";
const ENC_DEC_BASE_URL = "https://enc-dec.app/api";
const ANIMEKAI_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

type TmdbGenre = {
  id?: number;
  name?: string;
};

type TmdbTvDetails = {
  name?: string;
  original_name?: string;
  original_language?: string;
  origin_country?: string[];
  genres?: TmdbGenre[];
};

type TmdbMovieDetails = {
  title?: string;
  original_title?: string;
  original_language?: string;
  production_countries?: Array<{ iso_3166_1?: string }>;
  genres?: TmdbGenre[];
};

type AnimekaiSearchCandidate = {
  path: string;
  title: string;
  mediaType: string;
};

const apiV1BaseUrl = String(smbV1API.defaults.baseURL || "").replace(/\/+$/, "");

const buildProxyUrl = (url: string, ref?: string) => {
  const params = new URLSearchParams({ url });
  if (ref) {
    params.set("ref", ref);
  }

  return `${apiV1BaseUrl}/providers/vixsrc/proxy?${params.toString()}`;
};

const uniqueNonEmptyValues = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    output.push(normalized);
  });

  return output;
};

const normalizeTitle = (title?: string) =>
  String(title || "")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreTitleSimilarity = (left?: string, right?: string) => {
  const normalizedLeft = normalizeTitle(left);
  const normalizedRight = normalizeTitle(right);

  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;
  if (
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  ) {
    return 0.9;
  }

  const leftWords = new Set(normalizedLeft.split(" "));
  const rightWords = new Set(normalizedRight.split(" "));
  let overlap = 0;

  leftWords.forEach((word) => {
    if (rightWords.has(word)) overlap += 1;
  });

  return overlap / Math.max(leftWords.size, rightWords.size, 1);
};

const requestTextViaProxy = async (url: string, ref?: string) => {
  const response = await fetch(buildProxyUrl(url, ref));

  if (!response.ok) {
    throw new Error(`Animekai browser text request failed with ${response.status}`);
  }

  return response.text();
};

const requestJsonViaProxy = async (url: string, ref?: string) => {
  const response = await fetch(buildProxyUrl(url, ref));

  if (!response.ok) {
    throw new Error(`Animekai browser proxy request failed with ${response.status}`);
  }

  return (await response.json()) as Record<string, unknown>;
};

const requestJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    method: init?.method || "GET",
    headers: {
      Accept: "application/json, text/plain, */*",
      ...(init?.headers || {}),
    },
    body: init?.body,
  });

  if (!response.ok) {
    throw new Error(`Animekai browser request failed with ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
};

const fetchTmdbDetails = async (
  mediaType: VixsrcMediaType,
  tmdbId: string,
): Promise<TmdbTvDetails | TmdbMovieDetails> => {
  const endpoint = mediaType === "tv" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
  const response = await tmdbAPI.get(endpoint, {
    params: { language: "en-US" },
  });

  return response.data as TmdbTvDetails | TmdbMovieDetails;
};

const hasAnimationGenre = (genres: TmdbGenre[] = []) =>
  genres.some((genre) => {
    const genreName = String(genre?.name || "").toLowerCase();
    return genre?.id === 16 || genreName === "animation";
  });

const isLikelyAnimeFromTmdb = (
  mediaType: VixsrcMediaType,
  details: TmdbTvDetails | TmdbMovieDetails,
) => {
  const language = String(details?.original_language || "").toLowerCase();
  const isJapaneseLanguage = language === "ja";

  const originCountries =
    mediaType === "tv"
      ? (details as TmdbTvDetails)?.origin_country || []
      : ((details as TmdbMovieDetails)?.production_countries || []).map(
          (country) => String(country?.iso_3166_1 || ""),
        );
  const isFromJapan = originCountries.some(
    (country) => String(country).toUpperCase() === "JP",
  );

  return hasAnimationGenre(details?.genres || []) && (isJapaneseLanguage || isFromJapan);
};

const buildSearchQueries = ({
  mediaType,
  title,
  originalTitle,
  season,
}: {
  mediaType: VixsrcMediaType;
  title: string;
  originalTitle: string;
  season: number;
}) => {
  if (mediaType === "movie") {
    return uniqueNonEmptyValues([title, originalTitle]).slice(0, 5);
  }

  const seasonQueries =
    season > 1
      ? [
          `${title} Season ${season}`,
          `${title} ${season}`,
          `${originalTitle} Season ${season}`,
          `${originalTitle} ${season}`,
        ]
      : [];

  return uniqueNonEmptyValues([...seasonQueries, title, originalTitle]).slice(0, 5);
};

const parseAnimekaiSearchResults = (html: string): AnimekaiSearchCandidate[] => {
  const results: AnimekaiSearchCandidate[] = [];
  const pattern =
    /<div class="aitem">[\s\S]*?<a href="(\/watch\/[^"]+)" class="poster">[\s\S]*?<a class="title"[^>]*title="([^"]+)"[\s\S]*?<\/div>\s*<\/div>/g;
  let match: RegExpExecArray | null = pattern.exec(html);

  while (match) {
    const snippet = match[0];
    const labels = [...snippet.matchAll(/<span><b>([^<]+)<\/b><\/span>/g)].map(
      (resultItem) => String(resultItem[1] || "").trim(),
    );
    const mediaType =
      labels.find((label) => /^(TV|MOVIE|OVA|ONA|SPECIAL)$/i.test(label)) || "";

    results.push({
      path: String(match[1] || ""),
      title: String(match[2] || ""),
      mediaType,
    });

    if (results.length >= 60) break;
    match = pattern.exec(html);
  }

  return results;
};

const scoreSearchCandidate = ({
  candidate,
  targetTitle,
  season,
  mediaType,
}: {
  candidate: AnimekaiSearchCandidate;
  targetTitle: string;
  season: number;
  mediaType: VixsrcMediaType;
}) => {
  const normalizedCandidateTitle = normalizeTitle(candidate.title);
  let score = scoreTitleSimilarity(targetTitle, candidate.title);

  if (mediaType === "tv") {
    if (season > 1 && normalizedCandidateTitle.includes(`season ${season}`)) {
      score += 0.35;
    }
    if (season === 1 && normalizedCandidateTitle.includes("season 1")) {
      score += 0.1;
    }
    if (/^tv$/i.test(candidate.mediaType)) {
      score += 0.1;
    }
    if (/^(movie|ova|ona|special)$/i.test(candidate.mediaType)) {
      score -= 0.25;
    }
  } else {
    if (/^movie$/i.test(candidate.mediaType)) {
      score += 0.2;
    }
    if (/^tv$/i.test(candidate.mediaType)) {
      score -= 0.15;
    }
  }

  return score;
};

const findBestAnimekaiWatchPath = async ({
  mediaType,
  title,
  originalTitle,
  season,
}: {
  mediaType: VixsrcMediaType;
  title: string;
  originalTitle: string;
  season: number;
}) => {
  const searchQueries = buildSearchQueries({
    mediaType,
    title,
    originalTitle,
    season,
  });

  let bestPath: string | null = null;
  let bestScore = 0;

  for (const query of searchQueries) {
    const url = `${ANIMEKAI_BASE_URL}/browser?keyword=${encodeURIComponent(query)}`;
    const body = await requestTextViaProxy(url, `${ANIMEKAI_BASE_URL}/`);
    const candidates = parseAnimekaiSearchResults(body);

    candidates.forEach((candidate) => {
      const score = scoreSearchCandidate({
        candidate,
        targetTitle: title,
        season,
        mediaType,
      });

      if (score > bestScore) {
        bestScore = score;
        bestPath = candidate.path;
      }
    });

    if (bestScore >= 1.1) {
      break;
    }
  }

  if (!bestPath || bestScore < 0.45) {
    return null;
  }

  return bestPath;
};

const decodeEscapedHtml = (html?: string) =>
  String(html || "")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\u([\dA-Fa-f]{4})/g, (_match, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    );

const extractAnimekaiId = (watchHtml: string) =>
  watchHtml.match(/<div class="rate-box"[^>]*data-id="([^"]+)"/)?.[1] || null;

const getEncKaiToken = async (text: string) => {
  const response = await requestJson(
    `${ENC_DEC_BASE_URL}/enc-kai?text=${encodeURIComponent(text)}`,
  );
  const token = String(response?.result || "");
  if (!token) {
    throw new Error("Animekai token response was empty");
  }
  return token;
};

const getAnimekaiAjaxResult = async (url: string) => {
  const response = await requestJsonViaProxy(url, `${ANIMEKAI_BASE_URL}/`);
  const status = String(response?.status || "").toLowerCase();
  if (status !== "ok" && Number(response?.status) !== 200) {
    throw new Error(`Animekai ajax status was ${String(response?.status || "")}`);
  }
  return String(response?.result || "");
};

const extractEpisodeToken = (episodesHtml: string, episode: number) => {
  const pattern = /<a[^>]*\bnum="(\d+)"[^>]*\btoken="([^"]+)"[^>]*>/g;
  let match: RegExpExecArray | null = pattern.exec(episodesHtml);

  while (match) {
    if (Number(match[1]) === episode) {
      return String(match[2] || "");
    }
    match = pattern.exec(episodesHtml);
  }

  return null;
};

const extractServerIdFromGroup = (
  linksHtml: string,
  groupId: "sub" | "softsub" | "dub",
) => {
  const groupPattern = new RegExp(
    `<div class="server-items lang-group" data-id="${groupId}"[^>]*>([\\s\\S]*?)<\\/div>`,
    "i",
  );
  const groupBody = linksHtml.match(groupPattern)?.[1] || "";
  if (!groupBody) return null;

  const serverOne = groupBody.match(
    /<span class="server"[^>]*data-lid="([^"]+)"[^>]*>\s*Server 1\s*<\/span>/i,
  )?.[1];
  if (serverOne) return String(serverOne);

  const fallback = groupBody.match(
    /<span class="server"[^>]*data-lid="([^"]+)"/i,
  )?.[1];
  return fallback ? String(fallback) : null;
};

const extractServerIds = (linksHtml: string) => {
  const cleanedHtml = decodeEscapedHtml(linksHtml);
  return {
    sub:
      extractServerIdFromGroup(cleanedHtml, "sub") ||
      extractServerIdFromGroup(cleanedHtml, "softsub"),
    dub: extractServerIdFromGroup(cleanedHtml, "dub"),
  };
};

const inferSubtitleLanguage = (label?: string) => {
  const normalized = String(label || "").toLowerCase();

  if (normalized.includes("english") || normalized.includes("eng")) return "eng";
  if (normalized.includes("arabic") || normalized.includes("ara")) return "ara";
  if (normalized.includes("spanish") || normalized.includes("spa")) return "spa";
  if (normalized.includes("french") || normalized.includes("fra") || normalized.includes("fre")) return "fra";
  if (normalized.includes("german") || normalized.includes("ger") || normalized.includes("deu")) return "deu";
  if (normalized.includes("italian") || normalized.includes("ita")) return "ita";
  if (normalized.includes("portuguese") || normalized.includes("por")) return "por";
  if (normalized.includes("russian") || normalized.includes("rus")) return "rus";
  if (normalized.includes("turkish") || normalized.includes("tur")) return "tur";
  if (normalized.includes("hindi") || normalized.includes("hin")) return "hin";
  if (normalized.includes("indonesian") || normalized.includes("ind")) return "ind";

  return "und";
};

const parseSubtitleTracks = (tracks: unknown, refererUrl: string): VixsrcTrack[] => {
  if (!Array.isArray(tracks)) return [];

  return tracks.reduce<VixsrcTrack[]>((acc, track, index) => {
    const normalizedTrack = track as Record<string, unknown>;
    const kind = String(normalizedTrack?.kind || "").toLowerCase();
    const url = String(normalizedTrack?.file || "").trim();
    if (!url) return acc;
    if (kind !== "captions" && kind !== "subtitles") return acc;

    const label = String(normalizedTrack?.label || "").trim();
    acc.push({
      kind: "subtitles" as const,
      groupId: "animekai-subtitles",
      name: label || `Subtitle ${index + 1}`,
      language: inferSubtitleLanguage(label),
      isDefault: index === 0,
      autoSelect: index === 0,
      forced: false,
      url: buildProxyUrl(url, refererUrl),
    });

    return acc;
  }, []);
};

const resolveServerToStream = async (serverId: string) => {
  const serverToken = await getEncKaiToken(serverId);
  const viewUrl =
    `${ANIMEKAI_BASE_URL}/ajax/links/view?id=${encodeURIComponent(serverId)}` +
    `&_=${encodeURIComponent(serverToken)}`;
  const encryptedStream = await getAnimekaiAjaxResult(viewUrl);

  const decryptedKaiResponse = await requestJson(`${ENC_DEC_BASE_URL}/dec-kai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: encryptedStream }),
  });

  const streamUrl = String(
    (decryptedKaiResponse?.result as Record<string, unknown>)?.url || "",
  );
  if (!streamUrl) {
    return null;
  }

  const mediaUrl = streamUrl.replace("/e/", "/media/");
  const mediaResponse = await requestJsonViaProxy(mediaUrl, streamUrl);
  const encryptedMegaPayload = String(mediaResponse?.result || "");
  if (!encryptedMegaPayload) {
    return null;
  }

  const decryptedMegaResponse = await requestJson(`${ENC_DEC_BASE_URL}/dec-mega`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: encryptedMegaPayload,
      agent: ANIMEKAI_USER_AGENT,
    }),
  });

  const resultPayload = decryptedMegaResponse?.result as
    | Record<string, unknown>
    | undefined;
  const sources = (resultPayload?.sources as Array<Record<string, unknown>>) || [];
  const playlistUrl = String(sources?.[0]?.file || "");

  if (!playlistUrl) {
    return null;
  }

  return {
    refererUrl: streamUrl,
    masterPlaylistUrl: buildProxyUrl(playlistUrl, streamUrl),
    subtitleTracks: parseSubtitleTracks(resultPayload?.tracks, streamUrl),
  };
};

export const resolveAnimekaiStreamInBrowser = async ({
  mediaType,
  tmdbId,
  season,
  episode,
  mode,
}: {
  mediaType: VixsrcMediaType;
  tmdbId: string;
  season?: number;
  episode?: number;
  mode?: AnimeMode;
}): Promise<VixsrcStreamResponse | null> => {
  const details = await fetchTmdbDetails(mediaType, tmdbId);
  if (!isLikelyAnimeFromTmdb(mediaType, details)) {
    return null;
  }

  const title =
    mediaType === "tv"
      ? String((details as TmdbTvDetails)?.name || "")
      : String((details as TmdbMovieDetails)?.title || "");
  const originalTitle =
    mediaType === "tv"
      ? String((details as TmdbTvDetails)?.original_name || title)
      : String((details as TmdbMovieDetails)?.original_title || title);

  const seasonNumber = mediaType === "movie" ? 1 : Number(season || 0);
  const episodeNumber = mediaType === "movie" ? 1 : Number(episode || 0);
  if (!Number.isInteger(seasonNumber) || !Number.isInteger(episodeNumber)) {
    return null;
  }

  const watchPath = await findBestAnimekaiWatchPath({
    mediaType,
    title,
    originalTitle,
    season: seasonNumber,
  });
  if (!watchPath) {
    return null;
  }

  const watchPage = await requestTextViaProxy(
    `${ANIMEKAI_BASE_URL}${watchPath}`,
    `${ANIMEKAI_BASE_URL}/`,
  );
  const animeId = extractAnimekaiId(watchPage);
  if (!animeId) {
    return null;
  }

  const animeIdToken = await getEncKaiToken(animeId);
  const episodesUrl =
    `${ANIMEKAI_BASE_URL}/ajax/episodes/list?ani_id=${encodeURIComponent(animeId)}` +
    `&_=${encodeURIComponent(animeIdToken)}`;
  const episodesHtml = await getAnimekaiAjaxResult(episodesUrl);
  const episodeToken = extractEpisodeToken(episodesHtml, episodeNumber);
  if (!episodeToken) {
    return null;
  }

  const episodeTokenSignature = await getEncKaiToken(episodeToken);
  const linksUrl =
    `${ANIMEKAI_BASE_URL}/ajax/links/list?token=${encodeURIComponent(episodeToken)}` +
    `&_=${encodeURIComponent(episodeTokenSignature)}`;
  const linksHtml = await getAnimekaiAjaxResult(linksUrl);
  const serverIds = extractServerIds(linksHtml);

  const modeOptions = (["sub", "dub"] as AnimeMode[]).filter((candidateMode) =>
    Boolean(serverIds[candidateMode]),
  );
  if (!modeOptions.length) {
    return null;
  }

  const selectedMode: AnimeMode =
    mode && modeOptions.includes(mode)
      ? mode
      : modeOptions.includes("dub")
        ? "dub"
        : "sub";
  const selectedServerId = serverIds[selectedMode];
  if (!selectedServerId) {
    return null;
  }

  const resolvedStream = await resolveServerToStream(selectedServerId);
  if (!resolvedStream?.masterPlaylistUrl) {
    return null;
  }

  const stream: VixsrcPlaybackStream = {
    mediaType,
    tmdbId,
    season,
    episode,
    embedUrl: resolvedStream.refererUrl,
    masterPlaylistUrl: resolvedStream.masterPlaylistUrl,
    audioTracks: [],
    subtitleTracks: resolvedStream.subtitleTracks,
    sources: [
      {
        name: selectedMode.toUpperCase(),
        active: true,
        url: resolvedStream.masterPlaylistUrl,
      },
    ],
  };

  return {
    available: true,
    provider: "animekai",
    isAnimeCandidate: true,
    modeOptions,
    selectedMode,
    stream,
  };
};
