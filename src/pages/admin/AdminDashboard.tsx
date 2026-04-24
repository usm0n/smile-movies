import {
  AdminPanelSettingsRounded,
  ArrowForwardRounded,
  ContentCopyRounded,
  KeyRounded,
  MarkEmailReadRounded,
  ShieldRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicPageShell from "../../components/public/PublicPageShell";
import { useUsers } from "../../context/Users";
import { adminAPI } from "../../service/api/smb/admin.api.service";
import { notificationsAPI } from "../../service/api/smb/notifications.api.service";
import { AdminAuditLog, AdminBootstrapStatus, AdminModerationItem, AdminNotificationOverview, AdminRole, AdminUserSummary } from "../../types/admin";
import { ReleaseResponse } from "../../types/public";
import { User } from "../../user";

const adminTabs = ["/admin", "/admin/users", "/admin/moderation", "/admin/notifications", "/admin/releases"];

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = Math.max(0, adminTabs.indexOf(location.pathname));
  const { myselfData, getMyself, isAuthenticated, authResolved } = useUsers();
  const currentUser = myselfData?.data as User | undefined;
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationOverview | null>(null);
  const [releases, setReleases] = useState<ReleaseResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [moderationItems, setModerationItems] = useState<AdminModerationItem[]>([]);
  const [bootstrapStatus, setBootstrapStatus] = useState<AdminBootstrapStatus | null>(null);
  const [search, setSearch] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        usersResponse,
        moderationResponse,
        notificationsResponse,
        releasesResponse,
        auditResponse,
      ] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getModerationQueue(),
        adminAPI.getNotifications(),
        adminAPI.getReleases(),
        adminAPI.getAuditLogs(),
      ]);
      setUsers(usersResponse.data);
      setModerationItems(moderationResponse.data);
      setNotifications(notificationsResponse.data);
      setReleases(releasesResponse.data);
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    if (currentUser?.isAdmin) {
      void loadAdminData();
      return;
    }

    setLoading(false);
  }, [authResolved, currentUser?.isAdmin]);

  useEffect(() => {
    const loadBootstrapStatus = async () => {
      if (!authResolved || myselfData?.isLoading || !currentUser || currentUser.isAdmin) return;
      try {
        const response = await adminAPI.getBootstrapStatus();
        setBootstrapStatus(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadBootstrapStatus();
  }, [currentUser, myselfData?.isLoading]);

  useEffect(() => {
    if (!authResolved || myselfData?.isLoading) return;
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authResolved, isAuthenticated, myselfData?.isLoading, navigate]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.firstname, user.lastname, user.email, user.roles.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, users]);

  const overview = useMemo(() => {
    const adminCount = users.filter((user) => user.isAdmin).length;
    const bannedCount = users.filter((user) => user.isBanned).length;
    const verifiedCount = users.filter((user) => user.isVerified).length;
    return { adminCount, bannedCount, verifiedCount };
  }, [users]);

  if (!authResolved || myselfData?.isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (!currentUser.isAdmin) {
    return (
      <PublicPageShell
        eyebrow="Admin"
        title="Admin access required."
        description="This area is reserved for Smile Movies administrators while admin-first tooling is rolling out."
      >
        <Card sx={{ p: 3, borderRadius: 24 }}>
          <Typography level="title-lg" sx={{ mb: 1 }}>
            You do not have admin access yet.
          </Typography>
          <Typography level="body-sm" textColor="neutral.400" sx={{ mb: 2 }}>
            {bootstrapStatus?.reason || "Admin access has not been granted for this account."}
          </Typography>
          {bootstrapStatus?.canBootstrap ? (
            <Button
              startDecorator={<KeyRounded />}
              loading={busyKey === "bootstrap"}
              onClick={async () => {
                setBusyKey("bootstrap");
                try {
                  await adminAPI.bootstrap();
                  await getMyself();
                  setBootstrapStatus(null);
                  window.location.reload();
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to claim admin access.");
                } finally {
                  setBusyKey("");
                }
              }}
            >
              Claim initial admin access
            </Button>
          ) : (
            <Button component="a" href="/contact" endDecorator={<ArrowForwardRounded />}>
              Contact support
            </Button>
          )}
        </Card>
      </PublicPageShell>
    );
  }

  const updateUserState = (nextUser: AdminUserSummary) => {
    setUsers((prev) => prev.map((user) => (user.id === nextUser.id ? nextUser : user)));
  };

  const handleUserPatch = async (userId: string, payload: { isBanned?: boolean; isVerified?: boolean }) => {
    const key = `${userId}:patch`;
    setBusyKey(key);
    try {
      const response = await adminAPI.updateUser(userId, payload);
      updateUserState(response.data);
      await loadAdminData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update the user.");
    } finally {
      setBusyKey("");
    }
  };

  const handleRoleToggle = async (user: AdminUserSummary, role: AdminRole) => {
    const key = `${user.id}:role:${role}`;
    setBusyKey(key);
    try {
      const roles = user.roles.includes(role)
        ? user.roles.filter((item) => item !== role)
        : [...user.roles, role];
      const nextRoles = roles.includes("user") ? roles : ["user", ...roles];
      const response = await adminAPI.updateRoles(user.id, nextRoles as AdminRole[]);
      updateUserState(response.data);
      await loadAdminData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update roles.");
    } finally {
      setBusyKey("");
    }
  };

  return (
    <PublicPageShell
      eyebrow="Admin"
      title="Admin-first control surface for Smile Movies."
      description="This dashboard is the first operational slice from the roadmap: user management, notification-health visibility, release metadata oversight, and an audit trail."
    >
      <Tabs
        value={currentTab === -1 ? 0 : currentTab}
        onChange={(_, value) => navigate(adminTabs[(value as number) || 0])}
        sx={{ background: "transparent" }}
      >
        <TabList sx={{ mb: 3 }}>
          <Tab>Overview</Tab>
          <Tab>Users</Tab>
          <Tab>Moderation</Tab>
          <Tab>Notifications</Tab>
          <Tab>Releases</Tab>
        </TabList>

        <TabPanel value={0} sx={{ px: 0 }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {[
                  {
                    icon: <AdminPanelSettingsRounded />,
                    label: "Total users",
                    value: users.length,
                  },
                  {
                    icon: <ShieldRounded />,
                    label: "Admins",
                    value: overview.adminCount,
                  },
                  {
                    icon: <VerifiedRounded />,
                    label: "Verified users",
                    value: overview.verifiedCount,
                  },
                  {
                    icon: <MarkEmailReadRounded />,
                    label: "Email enabled",
                    value: notifications?.emailEnabled || 0,
                  },
                ].map((item) => (
                  <Card
                    key={item.label}
                    sx={{
                      flex: 1,
                      p: 2.25,
                      borderRadius: 24,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.025)",
                    }}
                  >
                    <Box sx={{ color: "rgb(255,216,77)", mb: 1 }}>{item.icon}</Box>
                    <Typography level="body-sm" textColor="neutral.400">{item.label}</Typography>
                    <Typography level="h2">{item.value}</Typography>
                  </Card>
                ))}
              </Stack>

              <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                <Card sx={{ flex: 1, p: 2.5, borderRadius: 24 }}>
                  <Typography level="title-lg" sx={{ mb: 1.5 }}>
                    Notification foundation
                  </Typography>
                  <Typography level="body-sm" textColor="neutral.300">
                    Queue status: {notifications?.queue.status || "unknown"}
                  </Typography>
                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    <Typography level="body-sm">Instant digests: {notifications?.digestCounts.instant || 0}</Typography>
                    <Typography level="body-sm">Daily digests: {notifications?.digestCounts.daily || 0}</Typography>
                    <Typography level="body-sm">Weekly digests: {notifications?.digestCounts.weekly || 0}</Typography>
                    <Typography level="body-sm">Release watchers: {(notifications?.newMovieReleases || 0) + (notifications?.newEpisodeReleases || 0)}</Typography>
                  </Stack>
                </Card>

                <Card sx={{ flex: 1, p: 2.5, borderRadius: 24 }}>
                  <Typography level="title-lg" sx={{ mb: 1.5 }}>
                    Recent admin activity
                  </Typography>
                  <Stack spacing={1.25}>
                    {auditLogs.slice(0, 6).map((log) => (
                      <Box key={log.id}>
                        <Typography level="body-sm">{log.action}</Typography>
                        <Typography level="body-xs" textColor="neutral.400">
                          {log.createdAt} · target {log.targetUid}
                        </Typography>
                      </Box>
                    ))}
                    {!auditLogs.length && (
                      <Typography level="body-sm" textColor="neutral.400">
                        No admin actions have been logged yet.
                      </Typography>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={1} sx={{ px: 0 }}>
          <Card sx={{ p: 2.5, borderRadius: 24 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography level="title-lg">Users</Typography>
                <Typography level="body-sm" textColor="neutral.400">
                  Search, verify, ban, and adjust admin role assignments.
                </Typography>
              </Box>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or role"
                sx={{ minWidth: { md: 280 } }}
              />
            </Stack>

            <Stack spacing={1.5}>
              {filteredUsers.map((user) => (
                <Card key={user.id} sx={{ p: 2, borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
                  <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography level="title-md">
                        {user.firstname} {user.lastname}
                      </Typography>
                      <Typography level="body-sm" textColor="neutral.400">
                        {user.email}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                        <Chip size="sm" color={user.isVerified ? "success" : "neutral"}>{user.isVerified ? "Verified" : "Unverified"}</Chip>
                        <Chip size="sm" color={user.isBanned ? "danger" : "neutral"}>{user.isBanned ? "Banned" : "Active"}</Chip>
                        {user.roles.map((role) => (
                          <Chip key={role} size="sm" variant="soft">
                            {role}
                          </Chip>
                        ))}
                      </Stack>
                      <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                        Devices {user.deviceCount} · Watchlist {user.watchlistCount}
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          size="sm"
                          loading={busyKey === `${user.id}:patch`}
                          onClick={() => handleUserPatch(user.id, { isVerified: !user.isVerified })}
                        >
                          {user.isVerified ? "Mark unverified" : "Verify user"}
                        </Button>
                        <Button
                          size="sm"
                          color={user.isBanned ? "success" : "danger"}
                          variant={user.isBanned ? "soft" : "solid"}
                          loading={busyKey === `${user.id}:patch`}
                          onClick={() => handleUserPatch(user.id, { isBanned: !user.isBanned })}
                        >
                          {user.isBanned ? "Unban user" : "Ban user"}
                        </Button>
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        {(["admin", "moderator", "support", "content_manager"] as AdminRole[]).map((role) => (
                          <Button
                            key={role}
                            size="sm"
                            variant={user.roles.includes(role) ? "solid" : "outlined"}
                            loading={busyKey === `${user.id}:role:${role}`}
                            onClick={() => handleRoleToggle(user, role)}
                          >
                            {user.roles.includes(role) ? `Remove ${role}` : `Grant ${role}`}
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>
        </TabPanel>

        <TabPanel value={2} sx={{ px: 0 }}>
          <Card sx={{ p: 2.5, borderRadius: 24 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Review Moderation
            </Typography>
            <Stack spacing={1.5}>
              {moderationItems.length ? moderationItems.map((item) => (
                <Card key={item.id} sx={{ p: 2, borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Box>
                      <Typography level="title-sm">{item.title}</Typography>
                      <Typography level="body-xs" textColor="neutral.500">
                        @{item.authorHandle} · reports {item.reportCount} · {item.moderationStatus}
                      </Typography>
                      <Typography level="body-sm" textColor="neutral.300" sx={{ mt: 1 }}>
                        {item.body}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {(["visible", "pending", "hidden", "removed"] as const).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={item.moderationStatus === status ? "solid" : "outlined"}
                          onClick={async () => {
                            setBusyKey(`moderate:${item.id}:${status}`);
                            try {
                              await adminAPI.moderateReview(item.id, status);
                              await loadAdminData();
                            } catch (error) {
                              console.error(error);
                              toast.error("Failed to moderate review.");
                            } finally {
                              setBusyKey("");
                            }
                          }}
                          loading={busyKey === `moderate:${item.id}:${status}`}
                        >
                          {status}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )) : (
                <Typography level="body-sm" textColor="neutral.400">
                  No reviews currently need moderation.
                </Typography>
              )}
            </Stack>
          </Card>
        </TabPanel>

        <TabPanel value={3} sx={{ px: 0 }}>
          <Card sx={{ p: 2.5, borderRadius: 24 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Notification Monitoring
            </Typography>
            {!notifications ? (
              <CircularProgress size="sm" />
            ) : (
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {[
                    ["Product announcements", notifications.productAnnouncements],
                    ["Movie release alerts", notifications.newMovieReleases],
                    ["Episode alerts", notifications.newEpisodeReleases],
                    ["Returning shows", notifications.returningShows],
                  ].map(([label, value]) => (
                    <Card key={label} sx={{ flex: 1, p: 2 }}>
                      <Typography level="body-xs" textColor="neutral.400">{label}</Typography>
                      <Typography level="h3">{value}</Typography>
                    </Card>
                  ))}
                </Stack>
                <Card sx={{ p: 2 }}>
                  <Typography level="title-sm">Queue health</Typography>
                  <Typography level="body-sm" textColor="neutral.300" sx={{ mt: 1 }}>
                    Status: {notifications.queue.status} · Candidates {notifications.queue.queuedCandidates} · Pending digests {notifications.queue.pendingDigests} · Delivery failures {notifications.queue.deliveryFailures} · Sent {notifications.queue.sentDeliveries} · Release events {notifications.queue.releaseEvents}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.75 }}>
                    Last job run: {notifications.queue.lastRunAt || "No recorded runs yet"}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.5 }}>
                    Delivery mode: {notifications.queue.deliveryMode === "log" ? "log only (development)" : "smtp"}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                    This is the operational surface for release notifications: sync events, queue matches, send instant mail, and process due digests.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1.25 }}>
                    <Chip size="sm" color={notifications.queue.readiness.tmdbConfigured ? "success" : "warning"}>
                      TMDB {notifications.queue.readiness.tmdbConfigured ? "ready" : "missing"}
                    </Chip>
                    <Chip size="sm" color={notifications.queue.readiness.mailConfigured ? "success" : "warning"}>
                      Mail {notifications.queue.readiness.mailConfigured ? "ready" : "missing"}
                    </Chip>
                    <Chip size="sm" color={notifications.queue.readiness.schedulerConfigured ? "success" : "warning"}>
                      Scheduler {notifications.queue.readiness.schedulerConfigured ? "ready" : "missing"}
                    </Chip>
                    <Chip size="sm" color={notifications.queue.readiness.clientUrlConfigured ? "success" : "warning"}>
                      Client URL {notifications.queue.readiness.clientUrlConfigured ? "ready" : "missing"}
                    </Chip>
                  </Stack>
                  <Stack spacing={0.4} sx={{ mt: 1.25 }}>
                    <Typography level="body-xs" textColor="neutral.500">
                      TMDB sync schedule: {notifications.queue.schedules.tmdbSync}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Instant delivery schedule: {notifications.queue.schedules.instantDelivery}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Digest delivery schedule: {notifications.queue.schedules.digestDelivery}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Full cycle schedule: {notifications.queue.schedules.scheduledCycle}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Scheduler endpoint: {notifications.queue.schedules.systemEndpoint}
                    </Typography>
                  </Stack>
                  <Card sx={{ mt: 2, p: 1.75, borderRadius: 18, background: "rgba(255,255,255,0.02)" }}>
                    <Typography level="title-sm" sx={{ mb: 0.75 }}>
                      How to use it
                    </Typography>
                    <Stack spacing={0.75}>
                      <Typography level="body-xs" textColor="neutral.400">
                        1. Users enable release alerts and set interests in Settings → Notifications.
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.400">
                        2. Use “Sync TMDB release events” to pull upcoming movies, episodes, seasons, and returning shows.
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.400">
                        3. Use “Run scheduled cycle” to sync, queue matches, send instant emails, and process due digests in one pass.
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.400">
                        4. For automation, call {notifications.queue.schedules.systemEndpoint} with both `X-API-Key` and either `Authorization: Bearer &lt;SCHEDULER_SECRET&gt;` or `X-Scheduler-Secret`.
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.400">
                        5. If delivery mode is `log`, notifications are written to the backend logs instead of being sent by email.
                      </Typography>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
                      <Button
                        size="sm"
                        variant="soft"
                        startDecorator={<ContentCopyRounded />}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(notifications.queue.schedules.systemEndpoint);
                            toast.success("Scheduler endpoint path copied.");
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to copy scheduler endpoint.");
                          }
                        }}
                      >
                        Copy scheduler path
                      </Button>
                    </Stack>
                  </Card>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
                    <Button
                      color="success"
                      loading={busyKey === "run-scheduled"}
                      onClick={async () => {
                        setBusyKey("run-scheduled");
                        try {
                          const response = await notificationsAPI.adminRunScheduled();
                          toast.success(
                            `Scheduled cycle complete: ${response.data.sync?.releaseEvents || 0} events synced, ${response.data.sync?.queued || 0} queued.`,
                          );
                          await loadAdminData();
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to run scheduled notification cycle.");
                        } finally {
                          setBusyKey("");
                        }
                      }}
                    >
                      Run scheduled cycle
                    </Button>
                    <Button
                      variant="soft"
                      loading={busyKey === "sync-tmdb"}
                      onClick={async () => {
                        setBusyKey("sync-tmdb");
                        try {
                          const response = await notificationsAPI.adminSyncTmdb();
                          toast.success(
                            `TMDB sync complete: ${response.data.movieReleases} movies, ${response.data.episodeReleases} episodes, ${response.data.seasonReleases} seasons, ${response.data.returningShows} returning shows.`,
                          );
                          await loadAdminData();
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to sync TMDB release events.");
                        } finally {
                          setBusyKey("");
                        }
                      }}
                    >
                      Sync TMDB release events
                    </Button>
                    <Button
                      loading={busyKey === "seed-release-event"}
                      onClick={async () => {
                        setBusyKey("seed-release-event");
                        try {
                          const preferredTitle = currentUser.watchlist?.[0];
                          await notificationsAPI.adminCreateReleaseEvent({
                            mediaId: preferredTitle?.id || "550",
                            mediaType: preferredTitle?.type || "movie",
                            title: preferredTitle?.title || "Fight Club",
                            eventType: preferredTitle?.type === "tv" ? "episode_release" : "movie_release",
                            seasonNumber: 1,
                            episodeNumber: 1,
                            summary: preferredTitle?.title
                              ? `A sample release event for ${preferredTitle.title} from the admin dashboard.`
                              : "A sample release event from the admin dashboard.",
                          });
                          await loadAdminData();
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to create a sample release event.");
                        } finally {
                          setBusyKey("");
                        }
                      }}
                    >
                      Create sample release event
                    </Button>
                    <Button
                      variant="outlined"
                      loading={busyKey === "process-notifications"}
                      onClick={async () => {
                        setBusyKey("process-notifications");
                        try {
                          await notificationsAPI.adminProcessPending();
                          await loadAdminData();
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to process pending notifications.");
                        } finally {
                          setBusyKey("");
                        }
                      }}
                    >
                      Process pending emails
                    </Button>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography level="title-sm" sx={{ mb: 1 }}>
                    Recent job runs
                  </Typography>
                  <Stack spacing={1}>
                    {notifications.jobRuns.length ? notifications.jobRuns.map((job) => (
                      <Card key={`${job.jobType}-${job.startedAt}`} sx={{ p: 1.5, borderRadius: 18, background: "rgba(255,255,255,0.02)" }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography level="title-sm">{job.jobType}</Typography>
                          <Chip
                            size="sm"
                            color={
                              job.status === "completed"
                                ? "success"
                                : job.status === "failed"
                                  ? "danger"
                                  : "neutral"
                            }
                          >
                            {job.status}
                          </Chip>
                        </Stack>
                        <Typography level="body-xs" textColor="neutral.400">
                          {job.trigger} · started {job.startedAt}{job.finishedAt ? ` · finished ${job.finishedAt}` : ""}
                        </Typography>
                        {job.error ? (
                          <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                            {job.error}
                          </Typography>
                        ) : null}
                      </Card>
                    )) : (
                      <Typography level="body-sm" textColor="neutral.500">
                        No notification jobs have run yet.
                      </Typography>
                    )}
                  </Stack>
                </Card>
              </Stack>
            )}
          </Card>
        </TabPanel>

        <TabPanel value={4} sx={{ px: 0 }}>
          <Card sx={{ p: 2.5, borderRadius: 24 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Release Management
            </Typography>
            <Stack spacing={1.5}>
              {releases.map((release) => (
                <Card key={release.platform} sx={{ p: 2, borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Box>
                      <Typography level="title-md">{release.name}</Typography>
                      <Typography level="body-sm" textColor="neutral.400">
                        {release.summary}
                      </Typography>
                      <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                        Version {release.version} · Updated {release.updatedAt}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "start", flexWrap: "wrap" }}>
                      <Chip color={release.status === "available" ? "success" : "neutral"}>
                        {release.status}
                      </Chip>
                      <Chip variant="soft">{release.platform}</Chip>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>
        </TabPanel>
      </Tabs>
    </PublicPageShell>
  );
}

export default AdminDashboard;
