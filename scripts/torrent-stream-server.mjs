#!/usr/bin/env node
import http from "node:http";
import process from "node:process";
import { URL } from "node:url";
import WebTorrent from "webtorrent";

const PORT = Number.parseInt(process.env.TORRENT_STREAM_PORT || "8787", 10);
const HOST = process.env.TORRENT_STREAM_HOST || "127.0.0.1";
const METADATA_TIMEOUT_MS = Number.parseInt(process.env.TORRENT_METADATA_TIMEOUT_MS || "45000", 10);
const DEFAULT_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.bittor.pw:1337/announce",
  "udp://public.popcorn-tracker.org:6969/announce",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.fastcast.nz",
];
const MIME_TYPES = new Map([
  [".mp4", "video/mp4"],
  [".m4v", "video/mp4"],
  [".webm", "video/webm"],
  [".mkv", "video/x-matroska"],
]);

const client = new WebTorrent();
const pendingTorrents = new Map();

const json = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "Range,Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
};

const setCorsHeaders = (response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Range,Content-Type");
  response.setHeader("Access-Control-Expose-Headers", "Content-Length,Content-Range,Accept-Ranges");
};

const normalizeInfoHash = (value) => String(value || "").trim().replace(/^urn:btih:/i, "").replace(/^btih:/i, "");

const isInfoHash = (value) => /^[a-z0-9]{32,40}$/i.test(normalizeInfoHash(value));

const ensureTrackers = (magnetUri, extraTrackers = []) => {
  const url = new URL(magnetUri);
  const trackers = new Set(url.searchParams.getAll("tr").map((tracker) => tracker.trim()).filter(Boolean));
  [...DEFAULT_TRACKERS, ...extraTrackers].forEach((tracker) => trackers.add(tracker));
  url.searchParams.delete("tr");
  trackers.forEach((tracker) => url.searchParams.append("tr", tracker));
  return url.toString();
};

const createMagnetUri = (infoHash, extraTrackers = []) => {
  const params = new URLSearchParams({ xt: `urn:btih:${normalizeInfoHash(infoHash)}` });
  [...DEFAULT_TRACKERS, ...extraTrackers].forEach((tracker) => params.append("tr", tracker));
  return `magnet:?${params.toString()}`;
};

const torrentIdFromRequest = (infoHash, searchParams) => {
  const magnet = String(searchParams.get("magnet") || "").trim();
  const trackers = searchParams.getAll("tr");

  if (magnet.toLowerCase().startsWith("magnet:?")) {
    return ensureTrackers(magnet, trackers);
  }

  return createMagnetUri(infoHash, trackers);
};

const waitForTorrent = (infoHash, torrentId) => {
  const key = normalizeInfoHash(infoHash).toLowerCase();
  const existingTorrent = client.get(key);
  if (existingTorrent?.files?.length) {
    return Promise.resolve(existingTorrent);
  }

  const pendingTorrent = pendingTorrents.get(key);
  if (pendingTorrent) {
    return pendingTorrent;
  }

  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for torrent metadata after ${METADATA_TIMEOUT_MS / 1000}s.`));
    }, METADATA_TIMEOUT_MS);

    const torrent = existingTorrent || client.add(torrentId);

    const cleanup = () => {
      clearTimeout(timeout);
      torrent.off("ready", handleReady);
      torrent.off("metadata", handleReady);
      torrent.off("error", handleError);
      pendingTorrents.delete(key);
    };
    const handleReady = () => {
      cleanup();
      resolve(torrent);
    };
    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    if (torrent.files?.length) {
      handleReady();
      return;
    }

    torrent.once("ready", handleReady);
    torrent.once("metadata", handleReady);
    torrent.once("error", handleError);
  });

  pendingTorrents.set(key, promise);
  return promise;
};

const extensionFor = (filename) => {
  const match = String(filename || "").toLowerCase().match(/\.[^.]+$/);
  return match?.[0] || "";
};

const isBrowserPlayable = (file) => [".mp4", ".m4v", ".webm"].includes(extensionFor(file.name));

const chooseVideoFile = (files, requestedFilename) => {
  const videos = files.filter((file) => MIME_TYPES.has(extensionFor(file.name)));
  const exactMatch = videos.find((file) => requestedFilename && file.name.endsWith(requestedFilename));

  return exactMatch || videos.filter(isBrowserPlayable).sort((a, b) => b.length - a.length)[0] || videos.sort((a, b) => b.length - a.length)[0];
};

const parseRange = (rangeHeader, fileLength) => {
  if (!rangeHeader) {
    return { statusCode: 200, start: 0, end: fileLength - 1 };
  }

  const match = String(rangeHeader).match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return null;
  }

  const [, rawStart, rawEnd] = match;
  let start = rawStart ? Number.parseInt(rawStart, 10) : 0;
  let end = rawEnd ? Number.parseInt(rawEnd, 10) : fileLength - 1;

  if (!rawStart && rawEnd) {
    const suffixLength = Number.parseInt(rawEnd, 10);
    start = Math.max(fileLength - suffixLength, 0);
    end = fileLength - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= fileLength) {
    return null;
  }

  return { statusCode: 206, start, end: Math.min(end, fileLength - 1) };
};

const handleStream = async (request, response, url) => {
  const [, , rawInfoHash] = url.pathname.split("/");
  const infoHash = normalizeInfoHash(decodeURIComponent(rawInfoHash || ""));

  if (!isInfoHash(infoHash)) {
    json(response, 400, { error: "A valid torrent info hash is required." });
    return;
  }

  const torrent = await waitForTorrent(infoHash, torrentIdFromRequest(infoHash, url.searchParams));
  const file = chooseVideoFile(torrent.files, url.searchParams.get("filename"));

  if (!file) {
    json(response, 404, { error: "No playable video file was found in this torrent." });
    return;
  }

  const range = parseRange(request.headers.range, file.length);
  if (!range) {
    setCorsHeaders(response);
    response.writeHead(416, { "Content-Range": `bytes */${file.length}` });
    response.end();
    return;
  }

  const contentLength = range.end - range.start + 1;
  const headers = {
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": MIME_TYPES.get(extensionFor(file.name)) || "application/octet-stream",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  };

  if (range.statusCode === 206) {
    headers["Content-Range"] = `bytes ${range.start}-${range.end}/${file.length}`;
  }

  setCorsHeaders(response);
  response.writeHead(range.statusCode, headers);

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = file.createReadStream({ start: range.start, end: range.end });
  request.on("close", () => stream.destroy());
  stream.on("error", (error) => {
    if (!response.headersSent) {
      json(response, 500, { error: error.message || "Torrent stream failed." });
      return;
    }

    response.destroy(error);
  });
  stream.pipe(response);
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (request.method === "OPTIONS") {
    setCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (url.pathname === "/health") {
    json(response, 200, { ok: true });
    return;
  }

  if ((request.method === "GET" || request.method === "HEAD") && url.pathname.startsWith("/stream/")) {
    handleStream(request, response, url).catch((error) => {
      console.error(error);
      json(response, 500, { error: error.message || "Failed to open torrent stream." });
    });
    return;
  }

  json(response, 404, { error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`Torrent stream server listening at http://${HOST}:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    client.destroy(() => process.exit(0));
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
