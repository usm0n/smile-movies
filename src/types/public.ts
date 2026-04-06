export type ReleasePlatform = "web" | "android" | "android-tv" | "desktop";

export interface AppConfigResponse {
  appName: string;
  tagline: string;
  supportEmail: string;
  supportTelegram: string;
  supportGithub: string;
  version: string;
  releaseChannel: string;
  install: {
    pwaSupported: boolean;
    iosPwaPrimary: boolean;
    androidDirectDownloadsPlanned: boolean;
    desktopDirectDownloadsPlanned: boolean;
  };
}

export interface ReleaseAssetResponse {
  label: string;
  url: string | null;
  sizeLabel: string | null;
  checksumSha256: string | null;
}

export interface ReleaseResponse {
  platform: ReleasePlatform;
  name: string;
  status: "available" | "planned";
  version: string;
  updatedAt: string;
  summary: string;
  installSteps: string[];
  notes: string[];
  assets: ReleaseAssetResponse[];
}

export interface LegalDocumentResponse {
  slug: "privacy" | "terms" | "dmca" | "cookies";
  title: string;
  updatedAt: string;
  sections: {
    heading: string;
    body: string[];
  }[];
}
