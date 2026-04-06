export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Failed to register service worker", error);
      });
    });
  }
}
