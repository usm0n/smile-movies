import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
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
import { Watchlist } from "../../user";

const profileTabs = ["", "/favorites", "/watchlist", "/reviews"];

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
          eventPoster={item.poster}
          eventTitle={item.title}
          eventType={item.type}
          eventStatus={item.status}
          eventDuration={item.duration}
          eventCurrentTime={item.currentTime}
          eventSeason={item.season}
          eventEpisode={item.episode}
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
  const [favorites, setFavorites] = useState<Watchlist[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const currentSuffix = location.pathname.replace(`/u/${handle}`, "") || "";
  const currentTab = Math.max(0, profileTabs.indexOf(currentSuffix));

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
    const loadSection = async () => {
      if (!profile) return;
      setSectionLoading(true);
      try {
        if (currentTab === 1 && profile.visibility.favorites) {
          const response = await profilesAPI.getFavorites(handle);
          setFavorites(response.data);
        }
        if (currentTab === 2 && profile.visibility.watchlist) {
          const response = await profilesAPI.getWatchlist(handle);
          setWatchlist(response.data);
        }
        if (currentTab === 3) {
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
  }, [currentTab, handle, profile]);

  const title = useMemo(() => {
    if (!profile) return "Public profile";
    return `${profile.displayName} · @${profile.handle}`;
  }, [profile]);

  return (
    <PublicPageShell
      eyebrow="Public Profile"
      title={title}
      description="Public identity arrives before social features. Profiles are read-only for now, with privacy-gated library visibility."
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

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 2 }}>
              <Chip variant="soft">Favorites {profile.counts.favorites}</Chip>
              <Chip variant="soft">Watchlist {profile.counts.watchlist}</Chip>
              <Chip variant="soft">Recently watched {profile.counts.recentlyWatched}</Chip>
              <Chip color={profile.visibility.favorites ? "success" : "neutral"}>
                Favorites {profile.visibility.favorites ? "public" : "private"}
              </Chip>
              <Chip color={profile.visibility.watchlist ? "success" : "neutral"}>
                Watchlist {profile.visibility.watchlist ? "public" : "private"}
              </Chip>
              <Chip color={profile.visibility.recentlyWatched ? "success" : "neutral"}>
                Recent activity {profile.visibility.recentlyWatched ? "public" : "private"}
              </Chip>
            </Stack>
          </Card>

          <Card sx={{ p: 3, borderRadius: 28 }}>
            <Typography level="title-lg" sx={{ mb: 1.5 }}>
              Taste Summary
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
              <Chip>Loved {profile.tasteSummary.loved}</Chip>
              <Chip>Liked {profile.tasteSummary.liked}</Chip>
              <Chip>Disliked {profile.tasteSummary.disliked}</Chip>
              <Chip>No reaction {profile.tasteSummary.noReaction}</Chip>
              <Chip>Total signals {profile.tasteSummary.totalSignals}</Chip>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {profile.tasteSummary.topFavorites.map((item) => (
                <Chip key={`${item.type}-${item.id}`} variant="soft">
                  {item.title}
                </Chip>
              ))}
              {!profile.tasteSummary.topFavorites.length && (
                <Typography level="body-sm" textColor="neutral.400">
                  No standout titles yet.
                </Typography>
              )}
            </Stack>
          </Card>

          {profile.visibility.recentlyWatched && !!profile.recentlyWatched?.length && (
            <Card sx={{ p: 3, borderRadius: 28 }}>
              <Typography level="title-lg" sx={{ mb: 2 }}>
                Recently Watched
              </Typography>
              <MediaGrid
                items={profile.recentlyWatched || []}
                emptyMessage="No recent activity to show."
              />
            </Card>
          )}

          <Tabs
            value={currentTab}
            onChange={(_, value) => navigate(`/u/${handle}${profileTabs[(value as number) || 0]}`)}
            sx={{ background: "transparent" }}
          >
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Favorites</Tab>
              <Tab>Watchlist</Tab>
              <Tab>Reviews</Tab>
            </TabList>

            <TabPanel value={0} sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                <Typography level="body-md" textColor="neutral.300">
                  Public profiles are intentionally lightweight at launch. You can see core identity, taste signals, and any library sections this user has chosen to make visible.
                </Typography>
              </Card>
            </TabPanel>

            <TabPanel value={1} sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : profile.visibility.favorites ? (
                  <MediaGrid
                    items={favorites}
                    emptyMessage="No public favorites to show."
                  />
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    Favorites are private for this profile.
                  </Typography>
                )}
              </Card>
            </TabPanel>

            <TabPanel value={2} sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : profile.visibility.watchlist ? (
                  <MediaGrid
                    items={watchlist}
                    emptyMessage="No public watchlist items to show."
                  />
                ) : (
                  <Typography level="body-sm" textColor="neutral.400">
                    Watchlist is private for this profile.
                  </Typography>
                )}
              </Card>
            </TabPanel>

            <TabPanel value={3} sx={{ px: 0 }}>
              <Card sx={{ p: 3, borderRadius: 24 }}>
                {sectionLoading ? (
                  <CircularProgress />
                ) : reviews.length ? (
                  <Stack spacing={1.25}>
                    {reviews.map((review) => (
                      <Card key={review.id} sx={{ p: 2, borderRadius: 18, background: "rgba(255,255,255,0.02)" }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 1 }}>
                          <Typography level="title-sm">{review.title}</Typography>
                          <Chip size="sm">Rating {review.rating}/10</Chip>
                        </Stack>
                        <Typography level="body-sm" textColor="neutral.300">
                          {review.body}
                        </Typography>
                        <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                          {review.updatedAt}
                        </Typography>
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
