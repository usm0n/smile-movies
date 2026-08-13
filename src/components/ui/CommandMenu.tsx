import { Box, Modal, Typography } from "@mui/joy";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { searchMulti } from "../../tmdb-res";
import {
  AdminPanelSettingsRounded,
  AutoAwesome,
  Bookmark,
  Compass,
  Download,
  History,
  Home,
  Layers,
  Movie,
  Person,
  Search,
  Settings,
  Tv,
  type IconProps,
} from "./icons";
import { Shimmer } from "./Skeleton";

const RECENTS_KEY = "smile_command_recents";
const MAX_RECENTS = 6;

type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<IconProps>;
  run: () => void;
  group: string;
  image?: string | null;
};

const readRecents = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const writeRecent = (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const next = [trimmed, ...readRecents().filter((r) => r !== trimmed)].slice(
      0,
      MAX_RECENTS,
    );
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a nicety, not a requirement */
  }
};

/**
 * ⌘K palette. Search TMDB and jump anywhere in the app without leaving the
 * keyboard — the navbar search box is now just a trigger for this.
 */
function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { searchMultiAC, searchMultiACData } = useTMDB();
  const { myselfData, isAuthenticated } = useUsers();
  const user = myselfData?.data as User | undefined;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      close();
    },
    [navigate, close],
  );

  // Global shortcuts: ⌘K / Ctrl+K anywhere, "/" when not already typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Let anything in the app open the palette: window.dispatchEvent(new Event("smile:command"))
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("smile:command", onOpen);
    return () => window.removeEventListener("smile:command", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setRecents(readRecents());
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(focusTimer);
  }, [open]);

  // Debounced TMDB lookup
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) return;
    debounceRef.current = setTimeout(() => {
      void searchMultiAC(trimmed, 1);
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, searchMultiAC]);

  const navCommands = useMemo<Command[]>(() => {
    const items: Command[] = [
      { id: "nav-home", label: "Home", icon: Home, group: "Go to", run: () => go("/") },
      {
        id: "nav-discover",
        label: "Discover",
        icon: Compass,
        group: "Go to",
        run: () => go("/discover"),
      },
      {
        id: "nav-ai",
        label: "SmileAI",
        hint: "Ask what to watch",
        icon: AutoAwesome,
        group: "Go to",
        run: () => go("/ai"),
      },
    ];
    if (isAuthenticated) {
      items.push(
        {
          id: "nav-watchlist",
          label: "Watchlist",
          icon: Bookmark,
          group: "Go to",
          run: () => go("/watchlist"),
        },
        {
          id: "nav-collections",
          label: "My Lists",
          icon: Layers,
          group: "Go to",
          run: () => go("/collections"),
        },
        {
          id: "nav-downloads",
          label: "Downloads",
          icon: Download,
          group: "Go to",
          run: () => go("/downloads"),
        },
        {
          id: "nav-settings",
          label: "Settings",
          icon: Settings,
          group: "Go to",
          run: () => go("/user/settings"),
        },
      );
      if (user?.isAdmin) {
        items.push({
          id: "nav-admin",
          label: "Admin dashboard",
          icon: AdminPanelSettingsRounded,
          group: "Go to",
          run: () => go("/admin"),
        });
      }
    } else {
      items.push({
        id: "nav-login",
        label: "Sign in",
        icon: Person,
        group: "Go to",
        run: () => go("/auth/login"),
      });
    }
    return items;
  }, [go, isAuthenticated, user?.isAdmin]);

  const results = (searchMultiACData?.data as searchMulti | undefined)?.results;
  const trimmedQuery = query.trim();

  const searchCommands = useMemo<Command[]>(() => {
    if (!trimmedQuery || !results) return [];
    const seen = new Set<string>();
    return results
      .filter((result) => {
        const name = (result.title || result.name || "").toLowerCase();
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return ["movie", "tv", "person"].includes(result.media_type);
      })
      .slice(0, 7)
      .map((result) => {
        const label = result.title || result.name;
        const year = (result.release_date || result.first_air_date || "").slice(0, 4);
        const path =
          result.media_type === "person"
            ? `/person/${result.id}`
            : `/${result.media_type}/${result.id}`;
        return {
          id: `tmdb-${result.media_type}-${result.id}`,
          label,
          hint:
            result.media_type === "person"
              ? "Person"
              : `${result.media_type === "tv" ? "TV" : "Movie"}${year ? ` · ${year}` : ""}`,
          icon:
            result.media_type === "person" ? Person : result.media_type === "tv" ? Tv : Movie,
          image: result.poster_path || result.profile_path || null,
          group: "Results",
          run: () => {
            writeRecent(trimmedQuery);
            go(path);
          },
        };
      });
  }, [results, trimmedQuery, go]);

  const recentCommands = useMemo<Command[]>(() => {
    if (trimmedQuery) return [];
    return recents.map((recent) => ({
      id: `recent-${recent}`,
      label: recent,
      icon: History,
      group: "Recent searches",
      run: () => go(`/search/${encodeURIComponent(recent)}`),
    }));
  }, [recents, trimmedQuery, go]);

  const commands = useMemo<Command[]>(() => {
    const filteredNav = trimmedQuery
      ? navCommands.filter((command) =>
          command.label.toLowerCase().includes(trimmedQuery.toLowerCase()),
        )
      : navCommands;

    const seeAll: Command[] = trimmedQuery
      ? [
          {
            id: "see-all",
            label: `Search for "${trimmedQuery}"`,
            icon: Search,
            group: "Results",
            run: () => {
              writeRecent(trimmedQuery);
              go(`/search/${encodeURIComponent(trimmedQuery)}`);
            },
          },
        ]
      : [];

    return [...seeAll, ...searchCommands, ...filteredNav, ...recentCommands];
  }, [navCommands, searchCommands, recentCommands, trimmedQuery, go]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery, commands.length]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(commands.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + commands.length) % Math.max(commands.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      commands[activeIndex]?.run();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  // Keep the highlighted row in view during keyboard navigation
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const isLoading = Boolean(trimmedQuery) && Boolean(searchMultiACData?.isLoading);
  let lastGroup = "";

  return (
    <Modal open={open} onClose={close} sx={{ backdropFilter: "none" }}>
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, sm: "12vh" },
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 560,
          backgroundColor: "background.surface",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          borderRadius: "12px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
          overflow: "hidden",
          outline: "none",
        }}
        onKeyDown={onKeyDown}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 2,
            height: 52,
            borderBottom: "1px solid",
            borderColor: "neutral.outlinedBorder",
          }}
        >
          <Search sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Box
            component="input"
            ref={inputRef}
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder="Search movies, shows, people…"
            aria-label="Search movies, shows, people"
            sx={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "text.primary",
              fontFamily: "body",
              fontSize: "0.9375rem",
              "&::placeholder": { color: "text.tertiary" },
              // The dialog itself is the focus affordance here.
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          />
          <Box
            component="kbd"
            sx={{
              fontFamily: "code",
              fontSize: "0.6875rem",
              color: "text.tertiary",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              borderRadius: "4px",
              px: 0.75,
              py: 0.25,
            }}
          >
            ESC
          </Box>
        </Box>

        <Box ref={listRef} sx={{ maxHeight: "56vh", overflowY: "auto", p: 1 }}>
          {isLoading && commands.length <= 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Shimmer key={index} height={36} radius={6} />
              ))}
            </Box>
          )}

          {!isLoading && commands.length === 0 && (
            <Typography level="body-sm" sx={{ p: 3, textAlign: "center" }}>
              No results found.
            </Typography>
          )}

          {commands.map((command, index) => {
            const showGroup = command.group !== lastGroup;
            lastGroup = command.group;
            const Icon = command.icon;
            const active = index === activeIndex;
            return (
              <Box key={command.id}>
                {showGroup && (
                  <Typography
                    level="body-xs"
                    sx={{
                      px: 1.5,
                      pt: index === 0 ? 0.5 : 1.5,
                      pb: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.6875rem",
                    }}
                  >
                    {command.group}
                  </Typography>
                )}
                <Box
                  data-index={index}
                  role="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={command.run}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: active ? "background.level1" : "transparent",
                    color: active ? "text.primary" : "text.secondary",
                  }}
                >
                  {command.image ? (
                    <Box
                      component="img"
                      src={`https://image.tmdb.org/t/p/w92${command.image}`}
                      alt=""
                      sx={{
                        width: 28,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid",
                        borderColor: "neutral.outlinedBorder",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Icon sx={{ fontSize: 16, color: "text.tertiary" }} />
                  )}
                  <Typography
                    level="body-sm"
                    sx={{
                      color: "inherit",
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {command.label}
                  </Typography>
                  {command.hint && (
                    <Typography level="body-xs" sx={{ flexShrink: 0 }}>
                      {command.hint}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.level1",
          }}
        >
          {[
            { keys: "↑↓", label: "Navigate" },
            { keys: "↵", label: "Open" },
            { keys: "esc", label: "Close" },
          ].map((hint) => (
            <Box key={hint.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                component="kbd"
                sx={{
                  fontFamily: "code",
                  fontSize: "0.625rem",
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "4px",
                  px: 0.5,
                }}
              >
                {hint.keys}
              </Box>
              <Typography level="body-xs">{hint.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
}

export default CommandMenu;
