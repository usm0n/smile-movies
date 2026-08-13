import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Dialog from "../ui/Dialog";
import EmptyState from "../ui/EmptyState";
import { Close, Mail, WarningRounded } from "../ui/icons";

function NotVerified({
  type,
  modalOpen,
  setModalOpen,
}: {
  type: "page" | "snackbar" | "modal";
  modalOpen?: boolean;
  setModalOpen?: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const { myselfData, isVerified, isAuthenticated } = useUsers();
  const [dismissed, setDismissed] = useState(false);
  const currentUser = myselfData?.data as User | undefined;

  useEffect(() => {
    setDismissed(false);
  }, [currentUser?.email, currentUser?.isVerified]);

  if (type === "page") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          py: "var(--sm-nav-height)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          <EmptyState
            icon={Mail}
            title="Verify your email"
            description="This page unlocks once your email address is confirmed."
            action={
              <>
                <Button onClick={() => navigate("/auth/verify-email")}>
                  Verify now
                </Button>
                <Button variant="outlined" color="neutral" onClick={() => navigate("/")}>
                  Go home
                </Button>
              </>
            }
          />
        </Box>
      </Box>
    );
  }

  if (type === "snackbar") {
    if (!isAuthenticated || !myselfData?.data || isVerified || dismissed) return null;

    // Thin bordered banner pinned under the nav, Vercel's notice pattern.
    return (
      <Box
        role="status"
        sx={{
          position: "fixed",
          top: "var(--sm-nav-height)",
          left: 0,
          right: 0,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "rgba(245,166,35,0.28)",
          backgroundColor: "rgba(245,166,35,0.08)",
        }}
      >
        <WarningRounded sx={{ fontSize: 16, color: "warning.plainColor" }} />
        <Typography
          level="body-sm"
          sx={{
            flex: 1,
            minWidth: 0,
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: { xs: "nowrap", md: "normal" },
          }}
        >
          Verify {currentUser?.email} to unlock every feature.
        </Typography>
        <Button size="sm" onClick={() => navigate("/auth/verify-email")}>
          Verify
        </Button>
        <IconButton label="Dismiss" size="sm" onClick={() => setDismissed(true)}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Dialog
      open={modalOpen || false}
      onClose={() => setModalOpen?.(false)}
      title="Verify your email"
      description="This feature unlocks once your email address is confirmed."
      width={420}
      actions={
        <>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => setModalOpen?.(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => navigate("/auth/verify-email")}>Verify now</Button>
        </>
      }
    />
  );
}

export default NotVerified;
