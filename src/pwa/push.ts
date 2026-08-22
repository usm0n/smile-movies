import { getFirebaseApp, isFirebaseConfigured } from "../service/firebase";
import { notificationsAPI } from "../service/api/smb/notifications.api.service";

/**
 * Web push registration.
 *
 * The flow is: browser permission → FCM token for this install → hand the token
 * to our API, which stores it against the account and flips the push preference
 * on. Nothing here decides *what* gets sent; it only establishes that this
 * particular browser can receive.
 *
 * Support is genuinely patchy and worth being explicit about:
 *   - Chrome, Edge, Firefox on desktop and Android: works from a normal tab.
 *   - Safari on macOS: works, but only after the user adds the site to the Dock
 *     or grants permission from a user gesture.
 *   - iOS/iPadOS: only from a PWA installed to the home screen (16.4+). In a
 *     normal Safari tab `Notification` does not exist at all, which is why
 *     `getPushSupport` reports that case separately — telling an iPhone user to
 *     "allow notifications" when there is no prompt to allow is a dead end.
 */

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

const SW_READY_TIMEOUT_MS = 10_000;
const TOKEN_TIMEOUT_MS = 15_000;

const withTimeout = <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timer: number;
  return Promise.race([
    promise.finally(() => window.clearTimeout(timer)),
    new Promise<T>((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
};

/**
 * The service worker registration to mint the push token against.
 *
 * `navigator.serviceWorker.ready` is a trap here: when no worker is registered
 * it neither resolves nor rejects — it waits forever. Development is exactly
 * that state, because `registerServiceWorker` deliberately unregisters the app
 * shell on localhost to avoid serving stale cached assets. Awaiting `.ready`
 * there left the Enable button spinning with no error and no way out.
 *
 * So: use an existing active worker, register `/sw.js` if there is none, and
 * put a ceiling on the wait either way.
 */
const getPushRegistration = async (): Promise<ServiceWorkerRegistration> => {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;

  if (!existing) {
    await navigator.serviceWorker.register("/sw.js");
  }

  return withTimeout(
    navigator.serviceWorker.ready,
    SW_READY_TIMEOUT_MS,
    "The service worker did not start in time. Reload the page and try again.",
  );
};

export type PushSupport =
  | { supported: true }
  | { supported: false; reason: string; needsInstall?: boolean };

const isStandalone = (): boolean =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  // iOS reports installed PWAs through this non-standard flag only.
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const isIos = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPadOS 13+ reports itself as a Mac; the touch points give it away.
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const getPushSupport = (): PushSupport => {
  if (!isFirebaseConfigured) {
    return { supported: false, reason: "Push is not configured for this deployment." };
  }
  if (!VAPID_KEY) {
    return { supported: false, reason: "Push is not configured for this deployment." };
  }
  if (!("serviceWorker" in navigator)) {
    return { supported: false, reason: "This browser does not support service workers." };
  }
  if (!("Notification" in window) || !("PushManager" in window)) {
    if (isIos() && !isStandalone()) {
      return {
        supported: false,
        needsInstall: true,
        reason:
          "On iPhone and iPad, add Smile Movies to your home screen first — Safari only allows notifications from an installed app.",
      };
    }
    return { supported: false, reason: "This browser does not support push notifications." };
  }
  return { supported: true };
};

export const getPermissionState = (): NotificationPermission | "unsupported" => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

/**
 * Asks for permission, mints a token, and registers it.
 *
 * Must be called from a user gesture: browsers ignore (Chrome) or reject
 * (Safari) a permission prompt raised on page load, and Chrome permanently
 * blocks the origin if the user dismisses a prompt they did not ask for.
 */
export const enablePushOnThisDevice = async (): Promise<
  { ok: true; devices: number } | { ok: false; reason: string }
> => {
  const support = getPushSupport();
  if (!support.supported) {
    return { ok: false, reason: support.reason };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      reason:
        permission === "denied"
          ? "Notifications are blocked for this site. Allow them in your browser settings, then try again."
          : "Notification permission was dismissed.",
    };
  }

  try {
    // Imported lazily so the messaging bundle is not shipped to users who never
    // open notification settings.
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");

    if (!(await isSupported())) {
      return { ok: false, reason: "This browser does not support push notifications." };
    }

    // Reuse the app-shell worker rather than registering a second one — FCM
    // defaults to looking for `/firebase-messaging-sw.js`, which does not exist
    // here on purpose; the push handlers live in `/sw.js`.
    const registration = await getPushRegistration();

    const token = await withTimeout(
      getToken(getMessaging(getFirebaseApp()), {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      }),
      TOKEN_TIMEOUT_MS,
      "Timed out asking the browser for a push token. Check that the VAPID key matches this Firebase project.",
    );

    if (!token) {
      return { ok: false, reason: "Could not obtain a push token from the browser." };
    }

    const response = await notificationsAPI.registerPushToken({ token });
    return { ok: true, devices: Number(response.data?.devices || 1) };
  } catch (error) {
    console.error("Failed to enable push notifications", error);
    return {
      ok: false,
      reason:
        error instanceof Error ? error.message : "Failed to enable push notifications.",
    };
  }
};

export const disablePushOnThisDevice = async (): Promise<boolean> => {
  try {
    const { getMessaging, getToken, deleteToken, isSupported } = await import(
      "firebase/messaging"
    );

    let token = "";
    if (VAPID_KEY && isFirebaseConfigured && (await isSupported())) {
      const messaging = getMessaging(getFirebaseApp());
      const registration = await getPushRegistration().catch(() => null);
      token = registration
        ? await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          }).catch(() => "")
        : "";
      if (token) await deleteToken(messaging).catch(() => undefined);
    }

    // An empty token tells the API "turn push off on every device", which is
    // what the settings toggle means — not just this browser.
    await notificationsAPI.removePushToken(token ? { token } : {});
    return true;
  } catch (error) {
    console.error("Failed to disable push notifications", error);
    return false;
  }
};

/**
 * Refreshes the stored token on app start.
 *
 * FCM rotates tokens on its own schedule; without this a device silently stops
 * receiving after a rotation and neither side notices. Deliberately silent —
 * it never prompts, and does nothing unless permission was already granted.
 */
export const refreshPushTokenIfEnabled = async (): Promise<void> => {
  if (getPermissionState() !== "granted") return;
  const support = getPushSupport();
  if (!support.supported) return;

  try {
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) return;

    const registration = await getPushRegistration();
    const token = await withTimeout(
      getToken(getMessaging(getFirebaseApp()), {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      }),
      TOKEN_TIMEOUT_MS,
      "token refresh timed out",
    );
    if (token) await notificationsAPI.registerPushToken({ token });
  } catch {
    // Never surface this: it runs in the background and a failure just means
    // the next start tries again.
  }
};
