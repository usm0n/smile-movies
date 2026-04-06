export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const hostname = window.location.hostname;
  const isLocalDevHost =
    import.meta.env.DEV ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  if (isLocalDevHost) {
    void window.addEventListener("load", () => {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        void Promise.all(registrations.map((registration) => registration.unregister()));
      });

      void caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("smile-movies-"))
            .map((key) => caches.delete(key)),
        ),
      );
    });
    return;
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Failed to register service worker", error);
    });
  });
}
