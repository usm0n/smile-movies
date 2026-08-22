import { FirebaseApp, initializeApp } from "firebase/app";
import {
  Auth,
  OAuthProvider,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";

/**
 * Firebase Auth is used purely as an identity broker for Google and Apple: the
 * popup returns an ID token, we hand that token to our own API, and the API
 * issues the session cookie the rest of the app already runs on. No Firebase
 * session is kept around afterwards.
 */

// Both naming schemes are accepted: the unprefixed keys match the Firebase
// console's own field names (and what our deployments already set), the
// VITE_FIREBASE_* ones are kept so older environments keep working.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_AUTH_DOMAIN ||
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:
    import.meta.env.VITE_PROJECT_ID ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_STORAGE_BUCKET ||
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_MESSAGING_SENDER_ID ||
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * Initialised lazily so a deployment without Firebase env vars still boots —
 * the Google/Apple buttons simply report that sign-in is unavailable.
 *
 * Shared with the push registration in `src/pwa/push.ts`: FCM must run on the
 * same app instance, and initialising Firebase twice throws.
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }
  if (!app) app = initializeApp(firebaseConfig);
  return app;
};

const getFirebaseAuth = (): Auth => {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
};

export type FederatedProvider = "google.com" | "apple.com";

export interface FederatedResult {
  idToken: string;
  firstname: string;
  lastname: string;
  email: string;
  photoURL: string;
}

const buildProvider = (provider: FederatedProvider) => {
  if (provider === "google.com") {
    const google = new GoogleAuthProvider();
    google.addScope("email");
    google.addScope("profile");
    // Always show the chooser so switching accounts does not silently reuse
    // whichever Google session the browser happens to hold.
    google.setCustomParameters({ prompt: "select_account" });
    return google;
  }

  const apple = new OAuthProvider("apple.com");
  apple.addScope("email");
  apple.addScope("name");
  return apple;
};

/**
 * Apple returns the user's name only on the very first authorization, and only
 * in the credential — never in later ID tokens. Capture it here so the caller
 * can forward it to the API before it is lost for good.
 */
const extractNames = (
  displayName: string | null,
): { firstname: string; lastname: string } => {
  const parts = String(displayName || "").trim().split(/\s+/).filter(Boolean);
  return { firstname: parts[0] || "", lastname: parts.slice(1).join(" ") };
};

export const signInWithProvider = async (
  provider: FederatedProvider,
): Promise<FederatedResult> => {
  const firebaseAuth = getFirebaseAuth();
  const credential = await signInWithPopup(
    firebaseAuth,
    buildProvider(provider),
    browserPopupRedirectResolver,
  );

  const idToken = await credential.user.getIdToken();
  const names = extractNames(credential.user.displayName);

  // The Firebase session has served its purpose; dropping it keeps a single
  // source of truth for "am I signed in" (our cookie).
  await signOut(firebaseAuth).catch(() => undefined);

  return {
    idToken,
    firstname: names.firstname,
    lastname: names.lastname,
    email: credential.user.email || "",
    photoURL: credential.user.photoURL || "",
  };
};

/** Maps Firebase's popup errors onto copy a user can act on. */
export const describeFirebaseError = (error: unknown): string => {
  const code = String((error as { code?: string })?.code || "");

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email. Sign in with your original method, then connect this one from Settings.";
    case "auth/operation-not-allowed":
      return "That sign-in provider is not enabled for this app yet.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. Add it in the Firebase console.";
    default:
      return "Sign-in failed. Please try again.";
  }
};
