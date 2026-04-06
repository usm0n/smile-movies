import { CheckCircleRounded, DownloadRounded, LaunchRounded, UpdateRounded } from "@mui/icons-material";
import { Box, Button, Card, Chip, CircularProgress, Divider, Grid, Link, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import InstallAppButton from "../../components/public/InstallAppButton";
import PublicPageShell from "../../components/public/PublicPageShell";
import { publicContentAPI } from "../../service/api/smb/public.api.service";
import { AppConfigResponse, ReleaseResponse } from "../../types/public";

function DownloadPage() {
  const [config, setConfig] = useState<AppConfigResponse | null>(null);
  const [releases, setReleases] = useState<ReleaseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [configResponse, releasesResponse] = await Promise.all([
          publicContentAPI.getAppConfig(),
          publicContentAPI.getReleases(),
        ]);
        setConfig(configResponse.data);
        setReleases(releasesResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <PublicPageShell
      eyebrow="Downloads"
      title="Install Smile Movies on the web today and track upcoming direct-download builds."
      description="The PWA is the live install path right now. Android, Android TV, and desktop packaging are planned and will appear here with signed asset details and checksums when published."
    >
      <Card
        sx={{
          p: 3,
          borderRadius: 28,
          mb: 4,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        }}
      >
        {loading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size="sm" />
            <Typography>Loading release metadata...</Typography>
          </Stack>
        ) : (
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid xs={12} md={8}>
              <Typography level="title-lg">
                {config?.appName || "Smile Movies"} {config?.releaseChannel ? `· ${config.releaseChannel}` : ""}
              </Typography>
              <Typography level="body-sm" textColor="neutral.300">
                Current web version: {config?.version || "unknown"}.
                iPhone is intentionally PWA-first for now, while direct APK and desktop builds remain staged behind the same web product.
              </Typography>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: { md: "end" } }}>
                <InstallAppButton fullWidth />
                <Button
                  component="a"
                  href={releases.find((release) => release.platform === "web")?.assets?.[0]?.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  startDecorator={<LaunchRounded />}
                  variant="outlined"
                  fullWidth
                >
                  Open web app
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {releases.map((release) => (
          <Grid xs={12} md={6} key={release.platform}>
            <Card
              sx={{
                height: "100%",
                p: 2.5,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography level="title-lg">{release.name}</Typography>
                <Chip color={release.status === "available" ? "success" : "neutral"} variant="soft">
                  {release.status === "available" ? "Available" : "Planned"}
                </Chip>
              </Stack>

              <Typography level="body-sm" textColor="neutral.300" sx={{ mb: 2 }}>
                {release.summary}
              </Typography>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography level="body-xs" textColor="neutral.500">
                  Version: {release.version}
                </Typography>
                <Typography level="body-xs" textColor="neutral.500">
                  Updated: {release.updatedAt}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography level="title-sm" sx={{ mb: 1 }}>Assets</Typography>
              <Stack spacing={1.25}>
                {release.assets.map((asset) => (
                  <Box
                    key={asset.label}
                    sx={{
                      p: 1.25,
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Typography level="title-sm">{asset.label}</Typography>
                      {asset.url ? (
                        <Button
                          size="sm"
                          component="a"
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          startDecorator={<DownloadRounded />}
                        >
                          Download
                        </Button>
                      ) : (
                        <Chip size="sm" variant="outlined">Coming soon</Chip>
                      )}
                    </Stack>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                      Size: {asset.sizeLabel || "TBD"} · SHA-256: {asset.checksumSha256 || "Will be published with the asset"}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography level="title-sm" sx={{ mb: 1 }}>Install steps</Typography>
              <Stack spacing={1}>
                {release.installSteps.map((step) => (
                  <Stack key={step} direction="row" spacing={1} sx={{ alignItems: "start" }}>
                    <CheckCircleRounded sx={{ fontSize: 18, color: "rgb(93, 227, 181)", mt: "2px" }} />
                    <Typography level="body-sm" textColor="neutral.300">{step}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography level="title-sm" sx={{ mb: 1 }}>Notes</Typography>
              <Stack spacing={1}>
                {release.notes.map((note) => (
                  <Stack key={note} direction="row" spacing={1} sx={{ alignItems: "start" }}>
                    <UpdateRounded sx={{ fontSize: 18, color: "rgb(114, 176, 255)", mt: "2px" }} />
                    <Typography level="body-sm" textColor="neutral.300">{note}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          p: 3,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.025)",
        }}
      >
        <Typography level="title-lg" sx={{ mb: 1 }}>Need help installing?</Typography>
        <Typography level="body-sm" textColor="neutral.300">
          If you hit install or verification issues, contact support via{" "}
          <Link href={config?.supportTelegram} target="_blank" rel="noreferrer">
            Telegram
          </Link>{" "}
          or open an issue on{" "}
          <Link href={config?.supportGithub} target="_blank" rel="noreferrer">
            GitHub
          </Link>
          .
        </Typography>
      </Card>
    </PublicPageShell>
  );
}

export default DownloadPage;
