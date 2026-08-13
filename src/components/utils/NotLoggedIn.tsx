import { Box } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import EmptyState from "../ui/EmptyState";
import { Lock } from "../ui/icons";

function NotLoggedIn({
  type,
  modalOpen,
  setModalOpen,
}: {
  type: "page" | "modal";
  modalOpen?: boolean;
  setModalOpen?: (value: boolean) => void;
}) {
  const navigate = useNavigate();

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
            icon={Lock}
            title="Sign in to continue"
            description="This page is tied to your account. Sign in, or create one in a few seconds."
            action={
              <>
                <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => navigate("/auth/register")}
                >
                  Create account
                </Button>
              </>
            }
          />
        </Box>
      </Box>
    );
  }

  return (
    <Dialog
      open={modalOpen || false}
      onClose={() => setModalOpen?.(false)}
      title="Sign in to continue"
      description="You need an account to use this feature."
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
          <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
        </>
      }
    />
  );
}

export default NotLoggedIn;
