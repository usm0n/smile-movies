import { Box, Chip, Divider, Link, Stack, Typography } from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";

const footerLinks = [
  { label: "Download", to: "/download" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "DMCA", to: "/dmca" },
  { label: "Cookies", to: "/cookies" },
];

function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        px: { xs: 2, md: 4 },
        pb: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          backdropFilter: "blur(18px)",
          p: { xs: 2.5, md: 3.5 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                Smile Movies
              </Typography>
              <Chip size="sm" variant="soft" color="warning">
                Web-first beta
              </Chip>
            </Stack>
            <Typography level="body-sm" textColor="neutral.300">
              The web app stays the source of truth while PWA and direct-download builds roll out.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ flexWrap: "wrap", rowGap: 1, columnGap: 2 }}
          >
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{ color: "neutral.100", fontSize: 14 }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.08)" }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", color: "neutral.400" }}
        >
          <Typography level="body-xs">
            SmileAI, watch tracking, and direct downloads are evolving in phases. Use the PWA for the best iPhone experience today.
          </Typography>
          <Typography level="body-xs">TMDB metadata powers discovery across the app.</Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default AppFooter;
