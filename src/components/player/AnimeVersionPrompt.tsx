import { Box, Typography } from "@mui/joy";
import { AnimeMode } from "../../types/providers";

/**
 * The one-time "subbed or dubbed?" question.
 *
 * Rendered inside `<media-player>` rather than portalled to the body, for the
 * same reason the sources sheet is: anything outside the player element is
 * invisible the moment the viewer goes fullscreen.
 */
function AnimeVersionPrompt({
  title,
  onChoose,
}: {
  title: string;
  onChoose: (version: AnimeMode) => void;
}) {
  const options: { value: AnimeMode; label: string; hint: string }[] = [
    {
      value: "sub",
      label: "Subbed",
      hint: "Japanese audio with subtitles",
    },
    {
      value: "dub",
      label: "Dubbed",
      hint: "English audio",
    },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Box
        role="dialog"
        aria-label="Choose audio version"
        sx={{
          width: "min(420px, 100%)",
          px: { xs: 2.5, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          borderRadius: "12px",
          border: "1px solid #1f1f1f",
          backgroundColor: "rgba(10,10,10,0.96)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          textAlign: "center",
        }}
      >
        <Typography level="h4" sx={{ color: "#ffffff" }}>
          How do you want to watch?
        </Typography>
        {title ? (
          <Typography level="body-sm" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mt: 2.5,
          }}
        >
          {options.map((option) => (
            <Box
              key={option.value}
              component="button"
              type="button"
              onClick={() => onChoose(option.value)}
              sx={{
                flex: 1,
                px: 1.5,
                py: 1.5,
                borderRadius: "8px",
                border: "1px solid #1f1f1f",
                backgroundColor: "transparent",
                color: "#ededed",
                cursor: "pointer",
                fontFamily: "body",
                textAlign: "center",
                transition: "background-color 150ms ease, border-color 150ms ease",
                "&:hover": { backgroundColor: "#111111", borderColor: "#333333" },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.8), 0 0 0 4px #0070f3",
                },
              }}
            >
              <Box sx={{ fontSize: "0.9375rem", fontWeight: 600 }}>{option.label}</Box>
              <Box sx={{ mt: 0.25, fontSize: "0.75rem", color: "#a1a1a1" }}>
                {option.hint}
              </Box>
            </Box>
          ))}
        </Box>

        <Typography level="body-xs" sx={{ mt: 2 }}>
          We'll remember this. You can switch any time under Sources.
        </Typography>
      </Box>
    </Box>
  );
}

export default AnimeVersionPrompt;
