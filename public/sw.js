const CACHE_NAME = "smile-movies-shell-v1";
const OFFLINE_URL = "/offline.html";
const APP_SHELL_URLS = ["/", "/manifest.webmanifest", OFFLINE_URL, "/icons/logo-192.png", "/icons/logo-512.png", "/icons/logo-maskable.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_URL);
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const clone = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
  }
});


// ── Web push ─────────────────────────────────────────────────────────────────
//
// The API sends FCM **data-only** messages, deliberately. A message carrying a
// `notification` block is rendered by the browser's FCM layer before this code
// ever runs, which means no control over the click target, the tag, or the
// actions. Data-only means the payload lands here and we render it ourselves.
//
// Payload shape (every value is a string — FCM requires that for data messages):
//   { title, body, url, image, tag }

const NOTIFICATION_ICON = "/icons/logo-192.png";
const NOTIFICATION_BADGE = "/icons/logo-192.png";

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    const parsed = event.data.json();
    // FCM nests data-only payloads under `data`; a direct Web Push send would
    // not. Accept both so this keeps working if the transport ever changes.
    payload = parsed.data || parsed || {};
  } catch {
    payload = { title: "Smile Movies", body: event.data.text() };
  }

  const title = payload.title || "Smile Movies";
  const options = {
    body: payload.body || "",
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    // Same tag replaces rather than stacks, so a re-run of the delivery job
    // cannot leave three copies of one episode alert on a lock screen.
    tag: payload.tag || "smile-movies",
    renotify: Boolean(payload.tag),
    data: { url: payload.url || "/" },
  };

  if (payload.image) {
    options.image = payload.image;
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an already-open tab and route it, rather than opening a second
        // copy of the app every time a notification is tapped.
        for (const client of clientList) {
          if (new URL(client.url).origin === self.location.origin && "focus" in client) {
            client.postMessage({ type: "notification-click", url: target });
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      })
  );
});
