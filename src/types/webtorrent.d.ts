declare module "webtorrent/dist/webtorrent.min.js" {
  import type { EventEmitter } from "events";

  type AppendToCallback = (error?: Error) => void;

  export type WebTorrentFile = {
    name: string;
    appendTo: (
      rootElement: HTMLElement,
      options?: {
        autoplay?: boolean;
        controls?: boolean;
      },
      callback?: AppendToCallback,
    ) => void;
  };

  export type WebTorrentTorrent = EventEmitter & {
    files: WebTorrentFile[];
    progress: number;
    downloadSpeed: number;
  };

  export default class WebTorrent extends EventEmitter {
    on: (eventName: string, listener: (...args: unknown[]) => void) => this;
    add: (torrentId: string, callback?: (torrent: WebTorrentTorrent) => void) => WebTorrentTorrent;
    destroy: (callback?: (error?: Error) => void) => void;
  }
}
