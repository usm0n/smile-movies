import { Card, Grid, Typography } from "@mui/joy";
import PublicPageShell from "../../components/public/PublicPageShell";

function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About"
      title="Smile Movies is shifting from a beta web app into a web-first platform."
      description="The current release is about trust, installability, and a cleaner product direction before bigger systems like admin tooling, notifications at scale, and social features arrive."
    >
      <Grid container spacing={2.5}>
        {[
          {
            title: "Why web first",
            body: "The browser lets Smile Movies move quickly while keeping product logic unified across PWA, Android, TV, and desktop wrappers.",
          },
          {
            title: "What is shipping now",
            body: "Landing, downloads, legal pages, footer navigation, PWA install support, and richer notification settings are the first visible release of that direction.",
          },
          {
            title: "What comes next",
            body: "V3 backend boundaries, release-event jobs, admin tooling, public profiles, lightweight reviews, and a safer internal-player path come next in sequence.",
          },
        ].map((item) => (
          <Grid xs={12} md={4} key={item.title}>
            <Card
              sx={{
                height: "100%",
                p: 2.5,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <Typography level="title-lg" sx={{ mb: 1 }}>{item.title}</Typography>
              <Typography level="body-sm" textColor="neutral.300">{item.body}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PublicPageShell>
  );
}

export default AboutPage;
