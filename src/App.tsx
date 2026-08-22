"use client";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { mainRoutes } from "./routes/main.routes";
import Navbar from "./components/navbar";
import AppFooter from "./components/layout/AppFooter";
import CommandMenu from "./components/ui/CommandMenu";
import { Box, useColorScheme } from "@mui/joy";
import NotVerified from "./components/utils/NotVerified";
import { useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import RouteFallback from "./components/utils/RouteFallback";
import ScrollManager from "./components/utils/ScrollManager";

function App() {
  const { setMode } = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isWatchPage = /\/watch(\/|$)/.test(location.pathname);
  // The assistant is a fixed-height chat shell that pins its composer to the
  // bottom of the viewport. A marketing footer underneath would make the page
  // scroll past it, so /ai opts out of the footer the same way /watch does.
  const isChatPage = /^\/ai(\/|$)/.test(location.pathname);

  useEffect(() => {
    setMode("dark");
  }, [setMode]);

  /**
   * Clicking a push notification while the app is already open.
   *
   * The service worker focuses the existing tab rather than opening a second
   * one, but focusing alone leaves the user on whatever page they were on —
   * so it posts the target here and we route to it client-side, without the
   * full reload `location.href` would cause.
   */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "notification-click") return;
      const url = String(event.data.url || "");
      if (!url) return;

      try {
        const target = new URL(url, window.location.origin);
        // Same-origin only: the path comes from a message, and navigating
        // somewhere else on the strength of that is not worth the risk.
        if (target.origin !== window.location.origin) return;
        navigate(`${target.pathname}${target.search}${target.hash}`);
      } catch {
        // A malformed url is not worth surfacing — the tab is focused either way.
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [navigate]);

  return (
    <Box className="app-shell">
      <ScrollManager />
      <NotVerified type="snackbar" />
      {/* The player owns the whole viewport and puts its own back button, title
          and controls at the very top — a fixed app header would sit on top of
          all three, which on a phone leaves nothing tappable. */}
      {!isWatchPage && <Navbar />}
      <CommandMenu />
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {mainRoutes?.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </Box>
      {!isWatchPage && !isChatPage && <AppFooter />}
    </Box>
  );
}
export default App;
