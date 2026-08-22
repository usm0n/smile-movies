import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { notificationsAPI } from "../service/api/smb/notifications.api.service";
import { NotificationHistoryItem } from "../types/notifications";
import { useUsers } from "./Users";

/**
 * Shared state for the notification bell and the /notifications page.
 *
 * Both render the same inbox, so they read from one store rather than fetching
 * separately — otherwise opening the page right after the bell would fire two
 * identical requests and the badge could disagree with the list underneath it.
 *
 * Polling is deliberately slow. The delivery job runs every 15 minutes, so
 * anything faster is asking a question whose answer cannot have changed. A
 * refetch on tab focus covers the case where someone leaves the app open
 * overnight.
 */

const POLL_INTERVAL_MS = 5 * 60 * 1000;

interface NotificationsContextValue {
  items: NotificationHistoryItem[];
  unreadCount: number;
  loading: boolean;
  /** True only for the very first load, so the UI can show a skeleton once. */
  initialLoading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  items: [],
  unreadCount: 0,
  loading: false,
  initialLoading: true,
  refresh: async () => {},
  markAllRead: async () => {},
  markRead: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUsers();
  const [items, setItems] = useState<NotificationHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);

    try {
      const response = await notificationsAPI.getInbox();
      setItems(response.data?.items || []);
      setUnreadCount(Number(response.data?.unreadCount || 0));
    } catch {
      // The bell is ambient: a failed poll should leave whatever is already on
      // screen alone rather than blanking it or shouting at the user.
    } finally {
      inFlight.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      setInitialLoading(false);
      return;
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);

    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [isAuthenticated, refresh]);

  // A push notification arriving means the inbox has a new row waiting.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "notification-click") void refresh();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    // Optimistic: the badge clearing the instant the panel opens is the whole
    // point, and a failure here costs nothing — the next poll restores truth.
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    try {
      await notificationsAPI.markRead();
    } catch {
      void refresh();
    }
  }, [unreadCount, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id);
      if (!target || target.read) return;

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationsAPI.markRead([id]);
      } catch {
        void refresh();
      }
    },
    [items, refresh],
  );

  const value = useMemo(
    () => ({ items, unreadCount, loading, initialLoading, refresh, markAllRead, markRead }),
    [items, unreadCount, loading, initialLoading, refresh, markAllRead, markRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
