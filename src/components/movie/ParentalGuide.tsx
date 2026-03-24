import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useState } from "react";
import { aiService, ParentalGuideResult } from "../../service/api/ai/ai.api.service";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

interface ParentalGuideProps {
  movieTitle: string;
  movieYear?: string;
  overview?: string;
  certification?: string;
  genres?: string[];
}

const ratingColor = (r: string) => {
  if (r === "None") return "success";
  if (r === "Mild") return "warning";
  if (r === "Moderate") return "warning";
  if (r === "Severe") return "danger";
  return "neutral";
};

const categories = [
  { key: "sex_nudity", label: "Sex & Nudity" },
  { key: "violence_gore", label: "Violence & Gore" },
  { key: "profanity", label: "Profanity" },
  { key: "alcohol_drugs", label: "Alcohol & Drugs" },
  { key: "frightening", label: "Frightening / Intense" },
] as const;

function ParentalGuide({ movieTitle, movieYear, overview, certification, genres }: ParentalGuideProps) {
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState<ParentalGuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchGuide = async () => {
    if (guide) { setOpen(true); return; }
    setLoading(true);
    setError(false);
    setOpen(true);
    try {
      const result = await aiService.parentalGuide({ movieTitle, movieYear, overview, certification, genres });
      setGuide(result);
    } catch (_) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={fetchGuide}
        variant="outlined"
        color="neutral"
        startDecorator={<FamilyRestroomIcon />}
        size="sm"
        sx={{ borderRadius: 20 }}
      >
        Parental Guide
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog sx={{ maxWidth: 500, width: "95vw", overflow: "auto" }}>
          <ModalClose />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FamilyRestroomIcon />
            <Typography level="title-lg">Parental Guide</Typography>
          </Box>
          <Typography level="body-sm" textColor="neutral.400">
            {movieTitle} {movieYear ? `(${movieYear})` : ""}
          </Typography>
          {certification && (
            <Chip size="sm" variant="outlined">
              Rated: {certification}
            </Chip>
          )}
          <Divider />

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography textColor="danger.400" level="body-sm">
              Could not load parental guide. Please try again.
            </Typography>
          )}

          {guide && !loading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card variant="soft" sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                {guide.family_friendly ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <WarningIcon color="warning" />
                )}
                <Box>
                  <Typography level="title-sm">
                    {guide.family_friendly ? "Family Friendly" : "Not recommended for young audiences"}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.400">
                    Minimum recommended age: {guide.minimum_age}+
                  </Typography>
                </Box>
              </Card>

              {categories.map(({ key, label }) => {
                const item = guide[key];
                return (
                  <Box key={key}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography level="title-sm">{label}</Typography>
                      <Chip size="sm" color={ratingColor(item.rating)} variant="soft">
                        {item.rating}
                      </Chip>
                    </Box>
                    <Typography level="body-sm" textColor="neutral.400">
                      {item.description}
                    </Typography>
                  </Box>
                );
              })}

              <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
                ⚠️ AI-generated guide based on training data. May not be 100% accurate for all content.
              </Typography>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </>
  );
}

export default ParentalGuide;
