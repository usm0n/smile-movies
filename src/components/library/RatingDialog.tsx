import { Star, StarBorder } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";

type RatingDialogProps = {
  open: boolean;
  title: string;
  titleLogoSrc?: string;
  initialRating?: number;
  confirmLabel?: string;
  onClose: () => void;
  onSave: (rating: number) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

function RatingDialog({
  open,
  title,
  titleLogoSrc,
  initialRating = 0,
  confirmLabel = "Save rating",
  onClose,
  onSave,
  onDelete,
}: RatingDialogProps) {
  const [draftRating, setDraftRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const previewRating = hoveredRating ?? draftRating;

  useEffect(() => {
    if (!open) return;
    setDraftRating(initialRating);
    setHoveredRating(null);
  }, [initialRating, open]);

  const handleSave = async () => {
    if (!draftRating || isSaving || isDeleting) return;
    setIsSaving(true);
    try {
      await onSave(draftRating);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !initialRating || isSaving || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setDraftRating((prev) => Math.min(10, Math.max(1, (prev || 0) + 1)));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setDraftRating((prev) => Math.max(1, (prev || 1) - 1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void handleSave();
    }
  };

  return (
    <Modal
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" && (isSaving || isDeleting)) return;
        onClose();
      }}
    >
      <ModalDialog
        sx={{
          maxWidth: 520,
          width: "min(92vw, 520px)",
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 2.5, sm: 3.25 },
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "#1f1f1f",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
        }}
      >
        <ModalClose />
        <DialogTitle sx={{ display: "none" }}>Rate this title</DialogTitle>
        <DialogContent>
          <Box
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseLeave={() => setHoveredRating(null)}
            sx={{
              outline: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              pt: 1,
            }}
          >
            <Box sx={{ position: "relative", width: 112, height: 112, mb: 1.25 }}>
              <Star
                sx={{
                  fontSize: 112,
                  color: previewRating ? "#5799ef" : "rgba(255,255,255,0.18)",
                  filter: previewRating ? "drop-shadow(0 12px 24px rgba(87, 153, 239, 0.22))" : "none",
                  transition: "color 160ms ease, filter 160ms ease",
                }}
              />
              <Typography
                level="h1"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "white",
                  textShadow: "0 2px 8px rgba(0,0,0,0.28)",
                  transform: "translateY(2px)",
                }}
              >
                {previewRating || "?"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                level="body-sm"
                sx={{
                  color: "#f5c518",
                  letterSpacing: "0.14em",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                Rate
              </Typography>
              {titleLogoSrc ? (
                <Box
                  component="img"
                  src={titleLogoSrc}
                  alt={title}
                  sx={{
                    width: "auto",
                    maxWidth: "min(100%, 280px)",
                    maxHeight: 64,
                    objectFit: "contain",
                    objectPosition: "center",
                    filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.28))",
                  }}
                />
              ) : (
                <Typography
                  level="h2"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                    lineHeight: 1.1,
                  }}
                >
                  {title}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                mt: 3.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: { xs: 0.25, sm: 0.45 },
              }}
            >
              {Array.from({ length: 10 }).map((_, index) => {
                const value = index + 1;
                const isActive = value <= previewRating;

                return (
                  <IconButton
                    key={value}
                    variant="plain"
                    color="neutral"
                    onMouseEnter={() => setHoveredRating(value)}
                    onFocus={() => setHoveredRating(value)}
                    onClick={() => setDraftRating(value)}
                    aria-label={`Rate ${value} out of 10`}
                    sx={{
                      width: { xs: 34, sm: 40 },
                      height: { xs: 34, sm: 40 },
                      borderRadius: "999px",
                      color: isActive ? "#5799ef" : "rgba(255,255,255,0.38)",
                      transition: "transform 140ms ease, color 140ms ease",
                      "&:hover": {
                        background: "transparent",
                        color: "#76adf5",
                        transform: "scale(1.08)",
                      },
                      "&:focus-visible": {
                        outline: "2px solid rgba(87,153,239,0.45)",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    {isActive ? (
                      <Star sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    ) : (
                      <StarBorder sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    )}
                  </IconButton>
                );
              })}
            </Box>

            <Typography
              level="body-sm"
              sx={{
                mt: 1.5,
                minHeight: "24px",
                color: "rgba(255,255,255,0.66)",
                fontWeight: 600,
              }}
            >
              {draftRating ? `${draftRating}/10` : "Select a rating"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            flexDirection: "column",
            gap: 1.1,
            pt: 2.5,
          }}
        >
          <Button
            onClick={handleSave}
            disabled={!draftRating || isSaving || isDeleting}
            sx={{
              width: "min(100%, 300px)",
              minHeight: 52,
              borderRadius: "999px",
              background: "#f5c518",
              color: "#121212",
              fontWeight: 800,
              fontSize: "1.1rem",
              boxShadow: "none",
              "&:hover": {
                background: "#ffd54a",
              },
            }}
          >
            {confirmLabel === "Save rating" ? "Rate" : confirmLabel}
          </Button>
          <Button
            variant="plain"
            color="neutral"
            onClick={onClose}
            disabled={isSaving || isDeleting}
            sx={{
              color: "rgba(255,255,255,0.72)",
              "&:hover": {
                background: "transparent",
                color: "white",
              },
            }}
          >
            Later
          </Button>
          {initialRating > 0 && onDelete ? (
            <Button
              variant="plain"
              color="danger"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              sx={{
                mt: -0.5,
                color: "rgba(255,115,115,0.9)",
                "&:hover": {
                  background: "transparent",
                  color: "rgb(255,145,145)",
                },
              }}
            >
              Delete rating
            </Button>
          ) : null}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

export default RatingDialog;
