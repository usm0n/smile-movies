import { Box, Card, CircularProgress, Divider, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicPageShell from "../../components/public/PublicPageShell";
import { publicContentAPI } from "../../service/api/smb/public.api.service";
import { LegalDocumentResponse } from "../../types/public";

function LegalDocumentPage({ forcedSlug }: { forcedSlug?: string }) {
  const { slug: routeSlug = "privacy" } = useParams();
  const slug = forcedSlug || routeSlug;
  const [document, setDocument] = useState<LegalDocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicContentAPI.getLegalDocument(slug);
        setDocument(response.data);
      } catch (error) {
        console.error(error);
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  return (
    <PublicPageShell
      eyebrow="Legal"
      title={document?.title || "Legal information"}
      description="These documents anchor the trust and compliance surface for the web-first release."
    >
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        }}
      >
        {loading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size="sm" />
            <Typography>Loading legal document...</Typography>
          </Stack>
        ) : !document ? (
          <Typography>Legal document not found.</Typography>
        ) : (
          <Box>
            <Typography level="body-sm" textColor="neutral.400" sx={{ mb: 2 }}>
              Last updated: {document.updatedAt}
            </Typography>
            {document.sections.map((section, index) => (
              <Box key={section.heading}>
                {index > 0 && <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.08)" }} />}
                <Typography level="h3" sx={{ mb: 1.25 }}>
                  {section.heading}
                </Typography>
                <Stack spacing={1.25}>
                  {section.body.map((paragraph) => (
                    <Typography key={paragraph} level="body-md" textColor="neutral.200">
                      {paragraph}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </PublicPageShell>
  );
}

export default LegalDocumentPage;
