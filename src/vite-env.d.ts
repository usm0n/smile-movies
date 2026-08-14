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
  readonly VITE_NUVIO_API_URL: string;
  readonly VITE_COOKIE_SECRET: string;
  readonly VITE_OMDB_API_KEY: string;
  // Firebase (identity broker for Google/Apple sign-in). The unprefixed names
  // mirror the Firebase console; the VITE_FIREBASE_* aliases are legacy.
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
  readonly VITE_MEASUREMENT_ID: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
