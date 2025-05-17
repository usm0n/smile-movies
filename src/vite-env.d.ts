/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_TMDB_API_URL: string;
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_OC_API_KEY: string;
  readonly VITE_OC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
