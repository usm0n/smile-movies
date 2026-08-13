import { Box, Typography } from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";
import Badge from "../ui/Badge";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Browse", to: "/browse" },
      { label: "Discover", to: "/discover" },
      { label: "SmileAI", to: "/ai" },
      { label: "Download", to: "/download" },
    ],
  },
  {
    title: "Library",
    links: [
      { label: "Watchlist", to: "/watchlist" },
      { label: "My Lists", to: "/collections" },
      { label: "Downloads", to: "/downloads" },
      { label: "Settings", to: "/user/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "DMCA", to: "/dmca" },
      { label: "Cookies", to: "/cookies" },
    ],
  },
];

function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        borderTop: "1px solid",
        borderColor: "neutral.outlinedBorder",
        backgroundColor: "background.body",
      }}
    >
      <Box
        sx={{
          maxWidth: "var(--sm-page-max)",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 5, md: 6 },
          display: "grid",
          gap: { xs: 4, md: 6 },
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "1.4fr repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
          <Typography level="title-md" sx={{ fontWeight: 600, mb: 1 }}>
            Smile Movies
          </Typography>
          <Typography level="body-sm" sx={{ maxWidth: 280, mb: 2 }}>
            Track what you watch, find what's next, and take it offline.
          </Typography>
          <Badge tone="neutral">Web-first beta</Badge>
        </Box>

        {columns.map((column) => (
          <Box key={column.title}>
            <Typography
              level="body-xs"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              {column.title}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {column.links.map((link) => (
                <Box
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.tertiary",
                    textDecoration: "none",
                    width: "fit-content",
                    transition: "color 150ms ease",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }}
      >
        <Box
          sx={{
            maxWidth: "var(--sm-page-max)",
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 2.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="body-xs">
            © {new Date().getFullYear()} Smile Movies. All rights reserved.
          </Typography>
          <Typography level="body-xs">Metadata by TMDB.</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AppFooter;
