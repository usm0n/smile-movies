import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";

function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 14, md: 16 } }}>
      <Box sx={{ maxWidth: 1120, mx: "auto" }}>
        <Box sx={{ mb: 5, maxWidth: 760 }}>
          <Typography
            level="body-sm"
            sx={{
              color: "rgb(255, 216, 77)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            {eyebrow}
          </Typography>
          <Typography level="h1" sx={{ fontSize: { xs: "2.4rem", md: "4rem" }, mb: 1.5 }}>
            {title}
          </Typography>
          <Typography level="body-lg" textColor="neutral.300">
            {description}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default PublicPageShell;
