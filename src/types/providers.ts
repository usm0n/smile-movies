export type VixsrcMediaType = "movie" | "tv";
export type VixsrcAvailabilityMatch = "movie" | "tv" | "episode" | null;
export type ProviderId = "vixsrc" | "showbox";
export type ProviderSourceFormat = "hls" | "mp4" | "unknown";

export interface VixsrcTrack {
  kind: "audio" | "subtitles";
  groupId: string;
  name: string;
  language: string;
  isDefault: boolean;
  autoSelect: boolean;
  forced: boolean;
  url: string;
}

export interface VixsrcSourceOption {
  id: string;
  name: string;
  active: boolean;
  format: ProviderSourceFormat;
  quality?: string;
  url: string;
}

export interface VixsrcPlaybackStream {
  mediaType: VixsrcMediaType;
  tmdbId: string;
  season?: number;
  episode?: number;
  embedUrl?: string;
  masterPlaylistUrl: string;
  thumbnailTrackUrl?: string;
  audioTracks: VixsrcTrack[];
  subtitleTracks: VixsrcTrack[];
  sources: VixsrcSourceOption[];
}

export interface VixsrcAvailabilityItem {
  mediaType: VixsrcMediaType;
  tmdbId: string;
  season?: number;
  episode?: number;
  available: boolean;
  imdbId?: string | null;
  matchedBy: VixsrcAvailabilityMatch;
}

export interface VixsrcStreamResponse {
  available: boolean;
  provider: ProviderId;
  availability?: VixsrcAvailabilityItem;
  stream: VixsrcPlaybackStream;
}

export interface VixsrcAvailabilityBatchResponse {
  items: VixsrcAvailabilityItem[];
}
