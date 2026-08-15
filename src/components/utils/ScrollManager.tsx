import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * The app never touched scroll position on navigation, so following a link from
 * halfway down a page dropped you into the middle of the next one — the new
 * content was rendered, just off-screen above or below, which reads exactly
 * like "the page didn't load until I reloaded it".
 *
 * Forward navigations go to the top. Back and forward return you to where you
 * were, which is the part the browser cannot do for us: a client-side route
 * change is not a document load, so native scroll restoration has nothing to
 * restore.
 */

/** Scroll offsets keyed by history entry, kept for the life of the tab. */
const positions = new Map<string, number>();

/**
 * A restored position is often unreachable at first: the route mounts as a
 * skeleton and only grows to full height once its data arrives. Rather than
 * give up, re-apply the target while the document is still growing.
 */
const RESTORE_WINDOW_MS = 1200;

function ScrollManager() {
  const { key, hash } = useLocation();
  const navigationType = useNavigationType();
  const activeKey = useRef(key);

  // Record continuously against the entry currently on screen, so the offset is
  // already saved by the time a navigation starts.
  useLayoutEffect(() => {
    // Otherwise the browser's own restoration fires against the previous
    // route's height and fights the effect below.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const record = () => positions.set(activeKey.current, window.scrollY);
    window.addEventListener("scroll", record, { passive: true });
    return () => window.removeEventListener("scroll", record);
  }, []);

  useLayoutEffect(() => {
    activeKey.current = key;

    // An in-page anchor manages its own scrolling.
    if (hash) return;

    const target = navigationType === "POP" ? (positions.get(key) ?? 0) : 0;

    if (target === 0) {
      window.scrollTo(0, 0);
      return;
    }

    let frame = 0;
    const deadline = performance.now() + RESTORE_WINDOW_MS;

    const restore = () => {
      const reachable =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(target, Math.max(reachable, 0)));

      // Stop as soon as the page is tall enough to honour the offset exactly.
      if (reachable >= target || performance.now() > deadline) return;
      frame = requestAnimationFrame(restore);
    };

    restore();
    return () => cancelAnimationFrame(frame);
  }, [key, hash, navigationType]);

  return null;
}

export default ScrollManager;
