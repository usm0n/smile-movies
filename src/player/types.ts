import { StreamServer } from "../stream-res";

export type PlaybackMode = "internal" | "external";
export type PlaybackFallbackReason =
  | ""
  | "internal_unavailable"
  | "no_web_ready_stream"
  | "user_selected_external"
  | "user_selected_internal";

export interface ResolvedPlayback {
  mode: PlaybackMode;
  server: StreamServer | null;
  fallbackReason: PlaybackFallbackReason;
}
