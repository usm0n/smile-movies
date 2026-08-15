import { Box } from "@mui/joy";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { WifiOff } from "../ui/icons";
import Container from "../../utilities/Container";

/**
 * A title page that failed to load is not a title that does not exist.
 * Rendering NotFound for a dropped connection or a rate-limited response tells
 * the reader the wrong thing, and rendering the page anyway leaves an empty
 * hero — so failures land here, with the retry that used to require a reload.
 */
function LoadFailed({
  title = "Couldn't load this page",
  description = "The request didn't come back. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <Box sx={{ pt: "calc(var(--sm-nav-height) + 48px)", pb: 8 }}>
      <Container>
        <EmptyState
          icon={WifiOff}
          title={title}
          description={description}
          action={<Button onClick={onRetry}>Try again</Button>}
        />
      </Container>
    </Box>
  );
}

export default LoadFailed;
