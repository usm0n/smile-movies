import {
  AspectRatio,
  Box,
  Chip,
  CircularProgress,
  Input,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Panel from "../ui/Panel";
import EmptyState from "../ui/EmptyState";
import { Shimmer } from "../ui/Skeleton";
import { Close, Movie as MovieIcon, Person as PersonIcon, Search, Tv } from "../ui/icons";
import { tmdb } from "../../service/api/tmdb/tmdb.api.service";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";
import { toast } from "../ui/toast";
import { NotificationInterests, User } from "../../user";
import { defaultNotificationInterests } from "../../utilities/notificationPreferences";

/**
 * Follow management.
 *
 * This replaced five comma-separated text boxes. Those boxes asked the user to
 * type names that had to match TMDB's spelling exactly to ever fire, showed raw
 * numeric ids for anything followed by button, and let one careless edit
 * unfollow everything at once. Here a follow is a button, an unfollow is a
 * button, and what you are following is a list you can see.
 *
 * Follows save immediately rather than waiting for the page's Save button —
 * pressing Follow and having nothing happen until you scroll down and press
 * Save is not what the control looks like it does.
 */

type FollowKind = "tv" | "movie" | "person";

interface SearchResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
}

interface ResolvedItem {
  id: string;
  kind: FollowKind;
  name: string;
  imagePath: string;
  subtitle: string;
}

interface Genre {
  id: number;
  name: string;
}

const KIND_FIELD: Record<FollowKind, keyof NotificationInterests> = {
  tv: "followedShows",
  movie: "followedMovies",
  person: "followedPeople",
};

const KIND_LABEL: Record<FollowKind, string> = {
  tv: "Shows",
  movie: "Movies",
  person: "People",
};

const KIND_ICON = {
  tv: Tv,
  movie: MovieIcon,
  person: PersonIcon,
};

const isTmdbId = (value: string) => /^\d+$/.test(String(value).trim());

const imageUrl = (path: string, kind: FollowKind) =>
  path
    ? `https://image.tmdb.org/t/p/w154${path}`
    : kind === "person"
      ? ""
      : "";

const yearOf = (date?: string) => (date ? date.slice(0, 4) : "");

function FollowManager({
  userValue,
  setUserValue,
}: {
  userValue: User;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
}) {
  const navigate = useNavigate();

  const interests = useMemo(
    () => ({
      ...defaultNotificationInterests,
      ...(userValue?.notificationInterests || {}),
    }),
    [userValue?.notificationInterests],
  );

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState<Record<string, ResolvedItem>>({});
  const [resolving, setResolving] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [savingKey, setSavingKey] = useState("");

  // Every followed id across the three lists, as `kind:id` keys.
  const followedKeys = useMemo(() => {
    const keys: Array<{ kind: FollowKind; id: string }> = [];
    (["tv", "movie", "person"] as const).forEach((kind) => {
      for (const value of interests[KIND_FIELD[kind]] || []) {
        if (isTmdbId(value)) keys.push({ kind, id: String(value) });
      }
    });
    return keys;
  }, [interests]);

  const isFollowing = useCallback(
    (kind: FollowKind, id: string) =>
      (interests[KIND_FIELD[kind]] || []).includes(String(id)),
    [interests],
  );

  // ── persistence ────────────────────────────────────────────────────────────
  const saveInterests = useCallback(
    async (next: NotificationInterests) => {
      const previous = userValue?.notificationInterests;
      // Optimistic, because a follow button that waits on a round trip before
      // changing state feels broken on a slow connection.
      setUserValue((prev) => ({ ...prev, notificationInterests: next }));

      try {
        await notificationsAPI.updateInterests(next);
      } catch {
        setUserValue((prev) => ({ ...prev, notificationInterests: previous }));
        toast.error("Could not save that. Please try again.");
      }
    },
    [setUserValue, userValue?.notificationInterests],
  );

  const toggleFollow = useCallback(
    async (kind: FollowKind, id: string) => {
      const field = KIND_FIELD[kind];
      const current = interests[field] || [];
      const following = current.includes(String(id));
      const key = `${kind}:${id}`;

      setSavingKey(key);
      try {
        await saveInterests({
          ...interests,
          [field]: following
            ? current.filter((item) => item !== String(id))
            : [...current, String(id)],
        });
      } finally {
        setSavingKey("");
      }
    },
    [interests, saveInterests],
  );

  const toggleGenre = useCallback(
    async (name: string) => {
      const current = interests.followedGenres || [];
      const on = current.some((item) => item.toLowerCase() === name.toLowerCase());
      await saveInterests({
        ...interests,
        followedGenres: on
          ? current.filter((item) => item.toLowerCase() !== name.toLowerCase())
          : [...current, name],
      });
    },
    [interests, saveInterests],
  );

  /**
   * Removes a leftover free-text entry from one of the old comma-separated
   * fields. They are still matched by the API, so they are shown rather than
   * dropped — but the only thing you can do with one now is delete it.
   */
  const removeLegacy = useCallback(
    async (field: keyof NotificationInterests, value: string) => {
      await saveInterests({
        ...interests,
        [field]: (interests[field] || []).filter((item) => item !== value),
      });
    },
    [interests, saveInterests],
  );

  // ── genre list ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    void Promise.all([tmdb.movieGenres(), tmdb.tvGenres()]).then(([movie, tv]) => {
      if (cancelled) return;
      const merged = new Map<string, Genre>();
      for (const genre of [...(movie?.genres || []), ...(tv?.genres || [])]) {
        if (genre?.name) merged.set(genre.name.toLowerCase(), genre);
      }
      setGenres([...merged.values()].sort((a, b) => a.name.localeCompare(b.name)));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── resolve followed ids to names and posters ──────────────────────────────
  //
  // Attempts are tracked separately from results: a lookup that fails (a title
  // deleted upstream, a network blip) never lands in `resolved`, so keying the
  // effect off `resolved` alone would see it as still-missing and refetch it on
  // every render, forever.
  const attempted = useRef<Set<string>>(new Set());

  useEffect(() => {
    const missing = followedKeys.filter(
      ({ kind, id }) => !attempted.current.has(`${kind}:${id}`),
    );
    if (missing.length === 0) return;

    for (const { kind, id } of missing) attempted.current.add(`${kind}:${id}`);

    let cancelled = false;
    setResolving(true);

    void Promise.all(
      missing.map(async ({ kind, id }) => {
        try {
          if (kind === "tv") {
            const data = await tmdb.tv(id);
            if (!data?.id) return null;
            return {
              id,
              kind,
              name: data.name || data.original_name || `Show ${id}`,
              imagePath: data.poster_path || "",
              subtitle: [yearOf(data.first_air_date), "TV series"].filter(Boolean).join(" · "),
            } as ResolvedItem;
          }
          if (kind === "movie") {
            const data = await tmdb.movie(id);
            if (!data?.id) return null;
            return {
              id,
              kind,
              name: data.title || data.original_title || `Movie ${id}`,
              imagePath: data.poster_path || "",
              subtitle: [yearOf(data.release_date), "Movie"].filter(Boolean).join(" · "),
            } as ResolvedItem;
          }
          const data = await tmdb.peopleDetails(id);
          if (!data?.id) return null;
          return {
            id,
            kind,
            name: data.name || `Person ${id}`,
            imagePath: data.profile_path || "",
            subtitle: data.known_for_department || "Person",
          } as ResolvedItem;
        } catch {
          return null;
        }
      }),
    ).then((items) => {
      if (cancelled) return;
      setResolved((prev) => {
        const next = { ...prev };
        for (const item of items) {
          if (item) next[`${item.kind}:${item.id}`] = item;
        }
        return next;
      });
      setResolving(false);
    });

    return () => {
      cancelled = true;
    };
  }, [followedKeys]);

  // ── search ─────────────────────────────────────────────────────────────────
  const searchSeq = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const seq = ++searchSeq.current;
    // Debounced: TMDB is queried per keystroke otherwise, and the answers come
    // back out of order on a slow line.
    const timer = window.setTimeout(async () => {
      try {
        const data = await tmdb.searchMulti(trimmed, 1);
        if (seq !== searchSeq.current) return;
        setResults(
          (data?.results || [])
            .filter((item: SearchResult) =>
              ["movie", "tv", "person"].includes(String(item.media_type)),
            )
            .slice(0, 8),
        );
      } catch {
        if (seq === searchSeq.current) setResults([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  // ── derived lists ──────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: Record<FollowKind, ResolvedItem[]> = { tv: [], movie: [], person: [] };
    for (const { kind, id } of followedKeys) {
      const item = resolved[`${kind}:${id}`];
      groups[kind].push(
        item || { id, kind, name: "", imagePath: "", subtitle: "" },
      );
    }
    return groups;
  }, [followedKeys, resolved]);

  const totalFollowed = followedKeys.length;

  const legacyEntries = useMemo(() => {
    const fields: Array<[keyof NotificationInterests, string]> = [
      ["followedShows", "Show"],
      ["followedMovies", "Movie"],
      ["followedActors", "Actor"],
      ["followedDirectors", "Director"],
      ["tasteKeywords", "Keyword"],
    ];

    return fields.flatMap(([field, label]) =>
      (interests[field] || [])
        .filter((value) => !isTmdbId(value))
        .map((value) => ({ field, label, value })),
    );
  }, [interests]);

  const renderFollowRow = (item: ResolvedItem) => {
    const Icon = KIND_ICON[item.kind];
    const image = imageUrl(item.imagePath, item.kind);
    const path =
      item.kind === "person"
        ? `/person/${item.id}`
        : `/${item.kind}/${item.id}`;

    return (
      <Box
        key={`${item.kind}:${item.id}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1,
          px: 1,
          borderRadius: "8px",
          "&:hover": { backgroundColor: "background.level1" },
        }}
      >
        <AspectRatio
          ratio={item.kind === "person" ? "1" : "2/3"}
          sx={{
            width: 40,
            flexShrink: 0,
            borderRadius: item.kind === "person" ? "999px" : "4px",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => navigate(path)}
        >
          {image ? (
            <Box component="img" src={image} alt="" loading="lazy" />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.level2",
              }}
            >
              <Icon sx={{ fontSize: 16, opacity: 0.5 }} />
            </Box>
          )}
        </AspectRatio>

        <Box
          sx={{ minWidth: 0, flex: 1, cursor: "pointer" }}
          onClick={() => navigate(path)}
        >
          {item.name ? (
            <>
              <Typography level="title-sm" noWrap>
                {item.name}
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }} noWrap>
                {item.subtitle}
              </Typography>
            </>
          ) : resolving ? (
            <Shimmer height={28} radius={6} />
          ) : (
            // The lookup failed or the title is gone from TMDB. Say so plainly
            // rather than shimmering forever — the row still unfollows.
            <>
              <Typography level="title-sm" noWrap sx={{ color: "text.tertiary" }}>
                Unavailable
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }} noWrap>
                TMDB #{item.id}
              </Typography>
            </>
          )}
        </Box>

        <IconButton
          label={`Unfollow ${item.name || item.id}`}
          size="sm"
          loading={savingKey === `${item.kind}:${item.id}`}
          onClick={() => void toggleFollow(item.kind, item.id)}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel
        title="Follow shows, films and people"
        description="Search for anything and follow it. We'll tell you about new releases, episodes and seasons — and for people, anything new they're in."
        footerHint={
          totalFollowed === 0
            ? "You're not following anything yet."
            : `Following ${totalFollowed} thing${totalFollowed === 1 ? "" : "s"}. Saved as you go.`
        }
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a show, film or person…"
          startDecorator={<Search sx={{ fontSize: 18 }} />}
          endDecorator={
            searching ? (
              <CircularProgress size="sm" />
            ) : query ? (
              <IconButton label="Clear search" size="sm" onClick={() => setQuery("")}>
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            ) : null
          }
        />

        {results.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {results.map((result) => {
              const kind = result.media_type as FollowKind;
              const id = String(result.id);
              const name = result.title || result.name || "Untitled";
              const image = imageUrl(
                (kind === "person" ? result.profile_path : result.poster_path) || "",
                kind,
              );
              const following = isFollowing(kind, id);
              const meta =
                kind === "person"
                  ? result.known_for_department || "Person"
                  : [
                      kind === "tv" ? "TV series" : "Movie",
                      yearOf(result.release_date || result.first_air_date),
                    ]
                      .filter(Boolean)
                      .join(" · ");

              return (
                <Box
                  key={`${kind}:${id}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1,
                    borderTop: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    "&:first-of-type": { borderTop: "none" },
                  }}
                >
                  <AspectRatio
                    ratio={kind === "person" ? "1" : "2/3"}
                    sx={{
                      width: 36,
                      flexShrink: 0,
                      borderRadius: kind === "person" ? "999px" : "4px",
                      overflow: "hidden",
                    }}
                  >
                    {image ? (
                      <Box component="img" src={image} alt="" loading="lazy" />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "background.level2",
                        }}
                      />
                    )}
                  </AspectRatio>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography level="title-sm" noWrap>
                      {name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }} noWrap>
                      {meta}
                    </Typography>
                  </Box>

                  <Button
                    size="sm"
                    variant={following ? "soft" : "solid"}
                    color={following ? "neutral" : "primary"}
                    loading={savingKey === `${kind}:${id}`}
                    onClick={() => void toggleFollow(kind, id)}
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}

        {query.trim().length >= 2 && !searching && results.length === 0 && (
          <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 1.5 }}>
            Nothing found for "{query.trim()}".
          </Typography>
        )}
      </Panel>

      <Panel
        title="You're following"
        description="Everything here sends you a notification when there's something new."
      >
        {totalFollowed === 0 ? (
          <EmptyState
            bare
            icon={PersonIcon}
            title="Not following anything yet"
            description="Use the search above, or the Follow button on any show, film or person page."
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {(["tv", "movie", "person"] as const).map((kind) =>
              grouped[kind].length === 0 ? null : (
                <Box key={kind}>
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.tertiary",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      mb: 0.5,
                    }}
                  >
                    {KIND_LABEL[kind]} ({grouped[kind].length})
                  </Typography>
                  {grouped[kind].map(renderFollowRow)}
                </Box>
              ),
            )}
            {resolving && (
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                Loading details…
              </Typography>
            )}
          </Box>
        )}
      </Panel>

      <Panel
        title="Genres you care about"
        description="Optional. Turn these on to also hear about new releases in a genre, even when you don't follow the title itself."
        footerHint="Only used when 'Recommendations' is enabled above."
      >
        {genres.length === 0 ? (
          <Shimmer height={80} radius={8} />
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {genres.map((genre) => {
              const on = (interests.followedGenres || []).some(
                (item) => item.toLowerCase() === genre.name.toLowerCase(),
              );
              return (
                <Chip
                  key={genre.name}
                  variant={on ? "solid" : "outlined"}
                  color={on ? "primary" : "neutral"}
                  onClick={() => void toggleGenre(genre.name)}
                  sx={{ cursor: "pointer" }}
                >
                  {genre.name}
                </Chip>
              );
            })}
          </Box>
        )}
      </Panel>

      {legacyEntries.length > 0 && (
        <Panel
          title="Typed interests"
          description="Names and keywords you entered before follow buttons existed. They still count as matches — remove any you no longer want."
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {legacyEntries.map(({ field, label, value }) => (
              <Chip
                key={`${field}:${value}`}
                variant="soft"
                endDecorator={
                  <IconButton
                    label={`Remove ${value}`}
                    size="sm"
                    onClick={() => void removeLegacy(field, value)}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                }
              >
                {label}: {value}
              </Chip>
            ))}
          </Box>
        </Panel>
      )}
    </Box>
  );
}

export default FollowManager;
