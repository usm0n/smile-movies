import { StreamServer } from "../stream-res";
import { PlaybackFallbackReason, ResolvedPlayback } from "./types";

const DOWNLOAD_HOST_PATTERN =
  /(pixeldrain|4khdhub|hub\.raj\.lat|workers\.dev|archiveorg)/i;
const DOWNLOAD_TITLE_PATTERN =
  /\.(mkv|mp4|avi|mov|wmv|flv|webm)(\s|$)|\b\d+(\.\d+)?\s?(gb|mb)\b/i;
const STREAMING_SOURCE_PATTERN =
  /(vixsrc|vidsrc|playlist|m3u8)/i;

const serverScore = (server: StreamServer) => {
  let score = Number(server.availability || 0);
  if (!isWebReadyInternalServer(server)) score -= 1000;
  if (server.name.toLowerCase().includes("vixsrc")) score += 100;
  return score;
};

export const isLikelyDownloadSource = (server: StreamServer) =>
  DOWNLOAD_HOST_PATTERN.test(server.url || "") ||
  DOWNLOAD_TITLE_PATTERN.test(server.title || "") ||
  /\[(fsl|pix)\]|4khdhub/i.test(server.name || "");

export const isWebReadyInternalServer = (server: StreamServer) => {
  const sourceSignature = `${server.name || ""} ${server.url || ""}`;

  if (STREAMING_SOURCE_PATTERN.test(sourceSignature)) {
    return true;
  }

  if (server.behaviorHints?.notWebReady) {
    return false;
  }

  return !isLikelyDownloadSource(server);
};

export const selectRecommendedInternalServer = (
  streams?: StreamServer[] | null,
): StreamServer | null => {
  if (!streams?.length) return null;
  const webReady = streams.filter((server) => isWebReadyInternalServer(server));
  if (!webReady.length) return null;
  return [...webReady].sort((a, b) => serverScore(b) - serverScore(a))[0] || null;
};

export const resolvePlaybackMode = ({
  preferredMode,
  recommendedServer,
  streams,
}: {
  preferredMode: "internal" | "external";
  recommendedServer: StreamServer | null;
  streams?: StreamServer[] | null;
}): ResolvedPlayback => {
  if (preferredMode === "internal" && recommendedServer) {
    return {
      mode: "internal",
      server: recommendedServer,
      fallbackReason: "",
    };
  }

  const fallbackReason: PlaybackFallbackReason =
    preferredMode === "internal"
      ? streams?.length
        ? "no_web_ready_stream"
        : "internal_unavailable"
      : "user_selected_external";

  return {
    mode: preferredMode === "internal" && recommendedServer ? "internal" : "external",
    server: preferredMode === "internal" ? recommendedServer : null,
    fallbackReason,
  };
};
