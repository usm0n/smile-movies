import { Box } from "@mui/joy";
import { ReactNode } from "react";
import PageHeader from "../ui/PageHeader";

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
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: "calc(var(--sm-nav-height) + 48px)",
        pb: 6,
      }}
    >
      <Box sx={{ maxWidth: "var(--sm-page-max)", mx: "auto" }}>
        <PageHeader overline={eyebrow} title={title} description={description} />
        {children}
      </Box>
    </Box>
  );
}

export default PublicPageShell;
