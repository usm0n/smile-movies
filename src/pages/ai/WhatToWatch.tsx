import { Box, Button, Card, Chip, Typography } from "@mui/joy";
import { AutoAwesome, Replay, PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../utilities/Container";
import { aiService } from "../../service/api/ai/ai.api.service";

type Step = "mood" | "genre" | "duration" | "result";

interface AIPick {
  title: string;
  year: number;
  type: "movie" | "tv";
  tmdbId: number;
  reason: string;
}

const MOODS = [
  { label: "Fun & Light", emoji: "😄" },
  { label: "Thrilling", emoji: "😮" },
  { label: "Emotional", emoji: "😢" },
  { label: "Mind-bending", emoji: "🤔" },
  { label: "Romantic", emoji: "🥰" },
  { label: "Laugh-out-loud", emoji: "😂" },
];
const GENRES = [
  "Action",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Documentary",
  "Animation",
  "Crime",
  "Fantasy",
];
const DURATIONS = [
  "Under 90 mins",
  "1.5 – 2.5 hrs",
  "Epic (2.5h+)",
  "Short TV series",
  "Long-running series",
];

function WhatToWatch() {
  const [step, setStep] = useState<Step>("mood");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState<AIPick[]>([]);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const getPicks = async (selectedDuration: string) => {
    setLoading(true);
    setError(false);
    setStep("result");

    const prompt = `You are a movie recommendation engine for Smile Movies, a streaming app.

The user wants to watch something with these preferences:
- Mood: ${mood}
- Genre: ${genre || "Any"}
- Duration/format: ${selectedDuration}

Recommend exactly 3 specific movies or TV shows. For each one return a JSON object:
{
  "title": string,
  "year": number,
  "type": "movie" or "tv",
  "tmdbId": number (the real TMDB ID — this is critical),
  "reason": string (one sentence, max 15 words, explain why it matches their mood)
}

Return ONLY a valid JSON array of 3 objects. No markdown, no explanation, no code block.`;

    try {
      const r = await aiService.chat([{ role: "user", content: prompt }]);
      const raw: string = r.reply || "[]";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed: AIPick[] = JSON.parse(cleaned);
      setPicks(Array.isArray(parsed) ? parsed.slice(0, 3) : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("mood");
    setMood("");
    setGenre("");
    setDuration("");
    setPicks([]);
    setError(false);
  };

  const stepIndex = { mood: 0, genre: 1, duration: 2, result: 3 }[step];

  return (
    <Container>
      <Box
        sx={{
          maxWidth: 640,
          mx: "auto",
          py: 6,
          px: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: "70vh",
          marginTop: 5,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,220,92,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesome sx={{ color: "rgb(255,220,92)" }} />
          </Box>
          <Box>
            <Typography level="h3">What should I watch?</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Answer 3 quick questions, get 3 perfect picks.
            </Typography>
          </Box>
        </Box>

        {/* Mood step */}
        {step === "mood" && (
          <Box>
            <Typography level="title-lg" sx={{ mb: 3 }}>
              What's your mood right now?
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {MOODS.map((m) => (
                <Chip
                  key={m.label}
                  size="lg"
                  variant={mood === m.label ? "solid" : "outlined"}
                  color={mood === m.label ? "warning" : "neutral"}
                  startDecorator={m.emoji}
                  onClick={() => {
                    setMood(m.label);
                    setStep("genre");
                  }}
                  sx={{
                    cursor: "pointer",
                    fontSize: "1rem",
                    py: 1.5,
                    px: 2.5,
                    "&:hover": { opacity: 0.85 },
                  }}
                >
                  {m.label}
                </Chip>
              ))}
            </Box>
          </Box>
        )}

        {/* Genre step */}
        {step === "genre" && (
          <Box>
            <Typography level="title-lg" sx={{ mb: 0.5 }}>
              Any genre preference?
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 3 }}>
              Mood: <strong>{mood}</strong>
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {GENRES.map((g) => (
                <Chip
                  key={g}
                  size="lg"
                  variant={genre === g ? "solid" : "outlined"}
                  color={genre === g ? "warning" : "neutral"}
                  onClick={() => {
                    setGenre(g);
                    setStep("duration");
                  }}
                  sx={{ cursor: "pointer", "&:hover": { opacity: 0.85 } }}
                >
                  {g}
                </Chip>
              ))}
              <Chip
                size="lg"
                variant="outlined"
                onClick={() => {
                  setGenre("Any");
                  setStep("duration");
                }}
                sx={{ cursor: "pointer", "&:hover": { opacity: 0.85 } }}
              >
                🎲 Surprise me
              </Chip>
            </Box>
          </Box>
        )}

        {/* Duration step */}
        {step === "duration" && (
          <Box>
            <Typography level="title-lg" sx={{ mb: 0.5 }}>
              How long do you have?
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 3 }}>
              {mood} · {genre}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {DURATIONS.map((d) => (
                <Card
                  key={d}
                  variant="outlined"
                  onClick={() => {
                    setDuration(d);
                    getPicks(d);
                  }}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: "rgb(255,220,92)",
                      background: "rgba(255,220,92,0.05)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Typography level="title-md">{d}</Typography>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Results step */}
        {step === "result" && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {loading && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <AutoAwesome
                  sx={{
                    fontSize: 56,
                    color: "rgb(255,220,92)",
                    animation: "spin 2s linear infinite",
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                />
                <Typography level="body-lg">
                  Finding the perfect match for your mood...
                </Typography>
              </Box>
            )}

            {!loading && error && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography level="body-lg" sx={{ mb: 2 }}>
                  Couldn't find picks right now. Try again?
                </Typography>
                <Button
                  startDecorator={<Replay />}
                  variant="outlined"
                  onClick={reset}
                >
                  Start over
                </Button>
              </Box>
            )}

            {!loading && !error && picks.length > 0 && (
              <Box>
                <Typography
                  level="body-sm"
                  sx={{ color: "text.tertiary", mb: 3 }}
                >
                  {mood} · {genre} · {duration}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {picks.map((pick, i) => (
                    <Card
                      key={i}
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.15s",
                        "&:hover": {
                          borderColor: "rgb(255,220,92)",
                          background: "rgba(255,220,92,0.05)",
                        },
                      }}
                      onClick={() => navigate(`/${pick.type}/${pick.tmdbId}`)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography level="title-lg">
                              {pick.title}
                            </Typography>
                            <Chip size="sm" variant="soft" color="neutral">
                              {pick.type === "movie" ? "Movie" : "Series"}
                            </Chip>
                          </Box>
                          <Typography
                            level="body-xs"
                            sx={{ color: "text.tertiary", mb: 1 }}
                          >
                            {pick.year}
                          </Typography>
                          <Typography level="body-md">{pick.reason}</Typography>
                        </Box>
                        <Button
                          size="sm"
                          startDecorator={<PlayArrow />}
                          color="warning"
                          variant="soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${pick.type}/${pick.tmdbId}`);
                          }}
                        >
                          Watch
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
                <Button
                  startDecorator={<Replay />}
                  variant="outlined"
                  color="neutral"
                  onClick={reset}
                  sx={{ mt: 3, width: "100%" }}
                >
                  Try different preferences
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Progress dots */}
        {step !== "result" && (
          <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 6 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: i === stepIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  background:
                    i === stepIndex
                      ? "rgb(255,220,92)"
                      : "rgba(255,255,255,0.2)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default WhatToWatch;
