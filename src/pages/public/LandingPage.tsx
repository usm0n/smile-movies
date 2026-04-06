import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  DownloadRounded,
  PublicRounded,
  SecurityRounded,
  SmartDisplayRounded,
  TvRounded,
} from "@mui/icons-material";
import { Box, Button, Card, Chip, Divider, Grid, Stack, Typography } from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";
import PublicPageShell from "../../components/public/PublicPageShell";
import InstallAppButton from "../../components/public/InstallAppButton";

const featureCards = [
  {
    icon: <TvRounded />,
    title: "Web-first everywhere",
    body: "The browser stays the source of truth so the PWA, Android, TV, and desktop builds all inherit the same product logic.",
  },
  {
    icon: <AutoAwesomeRounded />,
    title: "SmileAI guidance",
    body: "Describe a vibe, a scene, or a mood and get sharper recommendations backed by your evolving taste profile.",
  },
  {
    icon: <SecurityRounded />,
    title: "Reliable progress sync",
    body: "Resume instantly from local state, then sync safely to the backend as you pause, switch episodes, or leave the player.",
  },
  {
    icon: <PublicRounded />,
    title: "Release-ready foundation",
    body: "Legal pages, download guidance, release metadata, and notification preferences are now part of the actual product surface.",
  },
];

const faqItems = [
  {
    question: "Why is the web app the primary experience?",
    answer: "It lets Smile Movies move faster without fragmenting the product. The same routes, sessions, and APIs power PWA and future packaged builds.",
  },
  {
    question: "What should iPhone users use right now?",
    answer: "Use the mobile web app and Add to Home Screen. That is the preferred iPhone path until a stronger packaging story is ready.",
  },
  {
    question: "Are Android and desktop downloads live?",
    answer: "The download center is ready, but the direct APK and desktop installers are still planned. The page shows status, rollout order, and future checksum slots.",
  },
];

function ScreenshotMock({
  title,
  accent,
  lines,
}: {
  title: string;
  accent: string;
  lines: string[];
}) {
  return (
    <Card
      sx={{
        minHeight: 220,
        borderRadius: 24,
        p: 2.25,
        background:
          "linear-gradient(180deg, rgba(9,12,24,0.94), rgba(7,10,18,0.86))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 2 }}>
        <Typography level="title-md">{title}</Typography>
        <Chip
          size="sm"
          sx={{
            backgroundColor: accent,
            color: "#061018",
            fontWeight: 700,
          }}
        >
          Preview
        </Chip>
      </Stack>
      <Stack spacing={1.2}>
        {lines.map((line) => (
          <Box
            key={line}
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography level="body-sm">{line}</Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

function LandingPage() {
  return (
    <PublicPageShell
      eyebrow="Release 1"
      title="Smile Movies is becoming a web-first platform, not just a movie page."
      description="This release turns the home route into a proper landing page, adds install and legal foundations, and sets up the PWA-first path before Android, TV, and desktop packaging."
    >
      <Grid container spacing={3} sx={{ alignItems: "center", mb: 8 }}>
        <Grid xs={12} md={6}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip color="warning" variant="soft">PWA first</Chip>
              <Chip color="primary" variant="soft">Web source of truth</Chip>
              <Chip color="success" variant="soft">SmileAI ready</Chip>
            </Stack>
            <Typography level="body-lg" textColor="neutral.300">
              Discover what to watch, train your taste profile, keep progress in sync, and prepare for direct-download apps without splitting the product into separate experiences.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/browse"
                size="lg"
                endDecorator={<ArrowForwardRounded />}
                sx={{ background: "rgb(255,216,77)", color: "#120c00", fontWeight: 700 }}
              >
                Enter the app
              </Button>
              <Button
                component={RouterLink}
                to="/download"
                size="lg"
                variant="outlined"
                startDecorator={<DownloadRounded />}
              >
                View downloads
              </Button>
              <InstallAppButton />
            </Stack>
          </Stack>
        </Grid>
        <Grid xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "radial-gradient(circle at top right, rgba(255,216,77,0.18), transparent 30%), linear-gradient(180deg, rgba(8,11,21,0.95), rgba(3,6,14,0.9))",
              boxShadow: "0 40px 90px rgba(0,0,0,0.32)",
            }}
          >
            <Stack spacing={1.5}>
              <Typography level="title-sm" sx={{ letterSpacing: "0.16em", textTransform: "uppercase", color: "neutral.400" }}>
                Product direction
              </Typography>
              {[
                "Landing page for public trust and installs",
                "Admin before comments and community",
                "Public profiles before social graph",
                "Internal player with external fallback safety net",
              ].map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 1.25,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <Typography level="body-sm">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 8 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          Built around the next release order
        </Typography>
        <Grid container spacing={2}>
          {featureCards.map((feature) => (
            <Grid xs={12} sm={6} key={feature.title}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 24,
                  p: 2.5,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    mb: 1.5,
                    background: "rgba(255,216,77,0.12)",
                    color: "rgb(255,216,77)",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography level="title-lg" sx={{ mb: 1 }}>{feature.title}</Typography>
                <Typography level="body-sm" textColor="neutral.300">
                  {feature.body}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "end" }, mb: 2 }}
        >
          <Box>
            <Typography level="h2">Screenshots and product states</Typography>
            <Typography level="body-md" textColor="neutral.300">
              These mock panels preview the surfaces shipping before packaged apps and social layers.
            </Typography>
          </Box>
        </Stack>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <ScreenshotMock
              title="Landing + Downloads"
              accent="rgb(255,216,77)"
              lines={[
                "Hero messaging, CTA buttons, and release direction",
                "Download center with versioning, notes, and install guidance",
                "Legal and trust pages linked from every route",
              ]}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <ScreenshotMock
              title="SmileAI + Taste"
              accent="rgb(93, 227, 181)"
              lines={[
                "Describe a vibe, scene, or actor to narrow recommendations",
                "Taste profile keeps training from your reactions and saves",
                "Recommendations and notifications stay web-first",
              ]}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <ScreenshotMock
              title="Player + Progress"
              accent="rgb(114, 176, 255)"
              lines={[
                "Local-first watch progress for instant resume",
                "Internal player architecture with external fallback path",
                "Telemetry-ready structure before packaged rollouts",
              ]}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 8 }}>
        <Grid xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              p: 3,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
            }}
          >
            <Typography level="h2" sx={{ mb: 1.5 }}>
              Meet SmileAI
            </Typography>
            <Typography level="body-md" textColor="neutral.300" sx={{ mb: 2 }}>
              SmileAI already helps users discover movies by description. This release repositions it as a visible pillar of the product instead of a hidden extra page.
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ p: 1.5, borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
                <Typography level="title-sm">Natural language search</Typography>
                <Typography level="body-sm" textColor="neutral.300">
                  Ask for slow-burn thrillers, family-safe picks, or shows like a favorite title.
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
                <Typography level="title-sm">Taste-aware suggestions</Typography>
                <Typography level="body-sm" textColor="neutral.300">
                  Reactions, watchlist signals, and favorites can eventually feed notifications and profile summaries.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              p: 3,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(10,16,34,0.9), rgba(5,9,18,0.88))",
            }}
          >
            <Typography level="h2" sx={{ mb: 1.5 }}>
              FAQ
            </Typography>
            <Stack spacing={2}>
              {faqItems.map((item, index) => (
                <Box key={item.question}>
                  {index > 0 && <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />}
                  <Typography level="title-md">{item.question}</Typography>
                  <Typography level="body-sm" textColor="neutral.300" sx={{ mt: 0.75 }}>
                    {item.answer}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "radial-gradient(circle at 15% 20%, rgba(114,176,255,0.18), transparent 28%), radial-gradient(circle at 85% 10%, rgba(255,216,77,0.14), transparent 26%), linear-gradient(180deg, rgba(6,9,18,0.95), rgba(3,5,12,0.95))",
          mb: 4,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
          <Box>
            <Typography level="h2">Ready to try the web-first release?</Typography>
            <Typography level="body-md" textColor="neutral.300">
              Install the PWA, explore the download center, or jump straight into discovery.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={RouterLink} to="/auth/register" size="lg" variant="solid">
              Create account
            </Button>
            <Button component={RouterLink} to="/ai" size="lg" variant="outlined" startDecorator={<SmartDisplayRounded />}>
              Try SmileAI
            </Button>
          </Stack>
        </Stack>
      </Card>
    </PublicPageShell>
  );
}

export default LandingPage;
