import {
  Avatar,
  Box,
  Card,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PublicPageShell from "../../components/public/PublicPageShell";
import EventMC from "../../components/cards/EventMC";
import { profilesAPI } from "../../service/api/smb/profiles.api.service";
import { PublicProfileResponse } from "../../types/profiles";
import { ReviewRecord } from "../../types/reviews";
import { RatingItem, RecentlyWatchedItem, Watchlist } from "../../user";

const tabConfig = [
  { key: "overview", label: "Overview", suffix: "" },
  { key: "watchlist", label: "Watchlist", suffix: "/watchlist" },
  { key: "recently-watched", label: "Recently Watched", suffix: "/recently-watched" },
  { key: "ratings", label: "Ratings", suffix: "/ratings" },
  { key: "reviews", label: "Reviews", suffix: "/reviews" },
] as const;

const tabKeyBySuffix = tabConfig.reduce<Record<string, string>>((acc, tab) => {
  acc[tab.suffix] = tab.key;
  return acc;
}, {});

function MediaGrid({
  items,
  emptyMessage,
}: {
  items: Watchlist[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <Typography level="body-sm" textColor="neutral.400">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" gap="10px">
      {items.map((item) => (
        <EventMC
          key={`profile-${item.type}-${item.id}`}
          eventId={item.id}
          eventPoster={item.poster || ""}
          eventTitle={item.title}
          eventType={item.type}
        />
      ))}
    </Box>
  );
}

function RatingsGrid({
  items,
  emptyMessage,
}: {
  items: RatingItem[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <Typography level="body-sm" textColor="neutral.400">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" gap="18px">
      {items.map((item) => (
        <Box
          key={`profile-rating-${item.type}-${item.id}`}
          sx={{ width: "250px", display: "flex", flexDirection: "column", gap: 1 }}
        >
          <EventMC
            eventId={item.id}
            eventPoster={item.poster || ""}
            eventTitle={item.title}
            eventType={item.type}
          />
          <Typography level="body-sm" textAlign="center">
            Rated {item.rating}/10
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function RecentlyWatchedGrid({
  items,
  emptyMessage,
}: {
  items: RecentlyWatchedItem[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <Typography level="body-sm" textColor="neutral.400">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" gap="18px">
      {items.map((item) => (
        <EventMC
          key={`profile-recent-${item.type}-${item.id}`}
          eventId={item.id}
          eventPoster={item.poster || ""}
          eventTitle={item.title}
          eventType={item.type}
          eventDuration={item.duration}
          eventCurrentTime={item.currentTime}
          eventSeason={item.currentSeason}
          eventEpisode={item.currentEpisode}
          eventNextSeason={item.nextSeason}
          eventNextEpisode={item.nextEpisode}
        />
      ))}
    </Box>
  );
}

function PublicProfilePage() {
  const { handle = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const currentSuffix = location.pathname.replace(`/u/${handle}`, "") || "";
  const requestedTabKey = tabKeyBySuffix[currentSuffix] || "overview";

  const visibleTabs = useMemo(() => {
    if (!profile) {
      return tabConfig.filter((tab) => tab.key === "overview" || tab.key === "reviews");
    }

    return tabConfig.filter((tab) => {
      if (tab.key === "overview" || tab.key === "reviews") return true;
      if (tab.key === "watchlist") return profile.visibility.watchlist;
      if (tab.key === "recently-watched") return profile.visibility.recentlyWatched;
      if (tab.key === "ratings") return profile.visibility.ratings;
      return false;
    });
  }, [profile]);

  const activeTabKey = visibleTabs.some((tab) => tab.key === requestedTabKey)
    ? requestedTabKey
    : "overview";

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await profilesAPI.getProfile(handle);
        setProfile(response.data);
      } catch (error) {
        console.error(error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [handle]);

  useEffect(() => {
    if (!profile) return;
    if (activeTabKey === requestedTabKey) return;
    navigate(`/u/${handle}`, { replace: true });
  }, [activeTabKey, handle, navigate, profile, requestedTabKey]);

  useEffect(() => {
    const loadSection = async () => {
      if (!profile) return;
      setSectionLoading(true);
      try {
        if (activeTabKey === "watchlist" && profile.visibility.watchlist) {
          const response = await profilesAPI.getWatchlist(handle);
          setWatchlist(response.data);
        }
        if (activeTabKey === "recently-watched" && profile.visibility.recentlyWatched) {
          const response = await profilesAPI.getRecentlyWatched(handle);
          setRecentlyWatched(response.data);
        }
        if (activeTabKey === "ratings" && profile.visibility.ratings) {
          const response = await profilesAPI.getRatings(handle);
          setRatings(response.data);
        }
        if (activeTabKey === "reviews") {
          const response = await profilesAPI.getReviews(handle);
          setReviews(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSectionLoading(false);
      }
    };

    void loadSection();
  }, [activeTabKey, handle, profile]);

  const title = useMemo(() => {
    if (!profile) return "Public profile";
    return `${profile.displayName} · @${profile.handle}`;
  }, [profile]);

  return (
    <PublicPageShell
      eyebrow="Public Profile"
      title={title}
      description="Public profiles can now share watchlist, recently watched activity, ratings, and reviews when the user chooses to make them visible."
    >
      {loading ? (
        <CircularProgress />
      ) : !profile ? (
        <Card sx={{ p: 3, borderRadius: 24 }}>
          <Typography>Profile not found.</Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ p: 3, borderRadius: 28 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ alignItems: { md: "center" } }}>
              <Avatar src={profile.avatar} sx={{ width: 92, height: 92 }}>
                {profile.displayName.slice(0, 1)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography level="h2">{profile.displayName}</Typography>
                <Typography level="body-sm" textColor="neutral.400">
                  @{profile.handle} · Joined {profile.joinedAt}
                </Typography>
                <Typography level="body-md" textColor="neutral.200" sx={{ mt: 1.25 }}>
                  {profile.bio || "No bio yet."}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Tabs
            value={activeTabKey}
            onChange={(_, value) => {
              const nextTab = tabConfig.find((tab) => tab.key === value);
              navigate(`/u/${handle}${nextTab?.suffix || ""}`);
            }}
            sx={{ background: "transparent" }}
          >
            <TabList>
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} value={tab.key}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            <TabPanel value="overview" sx={{ px: 0 }}>
              <Stack spacing={2}>
                <Card sx={{ p: 3, borderRadius: 24 }}>
                  <Typography level="body-md" textColor="neutral.300">
                    This profile shares only the sections the user has chosen to make public.
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    <Card variant="soft">
                      <Typography level="body-xs" textColor="neutral.400">
                        Watchlist
                      </Typography>
                      <Typography level="h3">{profile.counts.watchlist}</Typography>
                    </Card>
                    <Card variant="soft">
                      <Typography level="body-xs" textColor="neutral.400">
                        Recently watched
                      </Typography>
                      <Typography level="h3">{profile.counts.recentlyWatched}</Typography>
                    </Card>
                    <Card variant="soft">
                      <Typography level="body-xs" textColor="neutral.400">
                        Ratings
                      </Typography>
                      <Typography level="h3">{profile.counts.ratings}</Typography>
                    </Card>
                  </Box>
                </Card>

                {profile.visibility.watchlist ? (
                  <Card sx={{ p: 3, borderRadius: 24 }}>
                    <Typography level="title-lg" sx={{ mb: 2 }}>
                      Watchlist Preview
                    </Typography>
                    <MediaGrid
                      items={profile.watchlist || []}
                      emptyMessage="No public watchlist items yet."
                    />
                  </Card>
                ) : null}

                {profile.visibility.recentlyWatched ? (
                  <Card sx={{ p: 3, borderRadius: 24 }}>
                    <Typography level="title-lg" sx={{ mb: 2 }}>
                      Recently Watched Preview
                    </Typography>
                    <RecentlyWatchedGrid
                      items={profile.recentlyWatched || []}
                      emptyMessage="No public recently watched titles yet."
                    />
                  </Card>
                ) : null}

                {profile.visibility.ratings ? (
                  <Card sx={{ p: 3, borderRadius: 24 }}>
                    <Typography level="title-lg" sx={{ mb: 2 }}>
                      Ratings Preview
                    </Typography>
                    <RatingsGrid
                      items={profile.ratings || []}
                      emptyMessage="No public ratings yet."
                    />
                  </Card>
                ) : null}
              </Stack>
            </TabPanel>

            <TabPanel value="watchlist" sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : profile.visibility.watchlist ? (
                  <MediaGrid
                    items={watchlist.length ? watchlist : profile.watchlist || []}
                    emptyMessage="No public watchlist items to show."
                  />
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    Watchlist is private for this profile.
                  </Typography>
                )}
              </Card>
            </TabPanel>

            <TabPanel value="recently-watched" sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : profile.visibility.recentlyWatched ? (
                  <RecentlyWatchedGrid
                    items={
                      recentlyWatched.length
                        ? recentlyWatched
                        : profile.recentlyWatched || []
                    }
                    emptyMessage="No public recently watched titles to show."
                  />
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    Recently watched is private for this profile.
                  </Typography>
                )}
              </Card>
            </TabPanel>

            <TabPanel value="ratings" sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : profile.visibility.ratings ? (
                  <RatingsGrid
                    items={ratings.length ? ratings : profile.ratings || []}
                    emptyMessage="No public ratings to show."
                  />
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    Ratings are private for this profile.
                  </Typography>
                )}
              </Card>
            </TabPanel>

            <TabPanel value="reviews" sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : reviews.length ? (
                  <Stack spacing={2}>
                    {reviews.map((review) => (
                      <Card key={review.id} variant="soft" sx={{ p: 2 }}>
                        <Typography level="title-md">{review.title}</Typography>
                        <Typography level="body-sm" textColor="neutral.400">
                          {review.mediaType}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ mt: 1 }}>{review.body}</Typography>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    No public reviews yet.
                  </Typography>
                )}
              </Card>
            </TabPanel>
          </Tabs>
        </Stack>
      )}
    </PublicPageShell>
  );
}

export default PublicProfilePage;
