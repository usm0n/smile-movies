import { Box, Card, Typography } from "@mui/joy";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Shimmer } from "../components/ui/Skeleton";
import { Delete, PlayArrow, Download as DownloadIcon } from "../components/ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../utilities/Container";
import { toast } from "../components/ui/toast";

const CACHE_NAME = "smile-offline-v1";

interface DownloadEntry {
  cacheKey: string;
  title: string;
  blobUrl: string;
}

function Downloads() {
  const [items, setItems] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const loaded: DownloadEntry[] = await Promise.all(
        keys.map(async (req) => {
          const res = await cache.match(req);
          const blob = await res!.blob();
          return {
            cacheKey: res!.headers.get("X-Cache-Key") || req.url,
            title: res!.headers.get("X-Title") || req.url,
            blobUrl: URL.createObjectURL(blob),
          };
        }),
      );
      setItems(loaded);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
    return () => {
      // Revoke object URLs to avoid memory leaks
      items.forEach((i) => URL.revokeObjectURL(i.blobUrl));
    };
  }, []);

  const remove = async (entry: DownloadEntry) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(entry.cacheKey);
      URL.revokeObjectURL(entry.blobUrl);
      setItems((prev) => prev.filter((i) => i.cacheKey !== entry.cacheKey));
      toast.success("Removed from downloads.");
    } catch {
      toast.error("Could not remove download.");
    }
  };

  const playOffline = (entry: DownloadEntry) => {
    // Parse the cache key to navigate to the right watch page
    // cacheKey format: "movie-123" or "tv-456-s1e2"
    const parts = entry.cacheKey.split("-");
    const type = parts[0];
    const id = parts[1];
    if (type && id) {
      navigate(`/${type}/${id}/watch?offline=1`);
    }
  };

  return (
    <Container>
      <Box
        sx={{
          pt: "calc(var(--sm-nav-height) + 48px)",
          pb: 8,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minHeight: "100vh",
        }}
      >
        <PageHeader
          title="Downloads"
          description="Saved for offline playback on this device. MP4 sources only."
        />

        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} height={112} radius={12} />
            ))}
          </Box>
        ) : items.length === 0 ? (
          <EmptyState
            icon={DownloadIcon}
            title="No downloads yet"
            description="Use the download button on any movie or episode page to save it for offline viewing."
            action={
              <Button variant="outlined" color="neutral" onClick={() => navigate("/browse")}>
                Browse titles
              </Button>
            }
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {items.map((entry) => (
              <Card key={entry.cacheKey} variant="outlined" sx={{ gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      level="title-md"
                      noWrap
                      title={entry.title}
                    >
                      {entry.title}
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.tertiary", mt: 0.5 }}
                    >
                      Available offline
                    </Typography>
                  </Box>
                  <IconButton
                    label="Delete download"
                    tooltip
                    size="sm"
                    color="danger"
                    onClick={() => remove(entry)}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Button
                  startDecorator={<PlayArrow sx={{ fontSize: 15 }} />}
                  size="sm"
                  fullWidth
                  onClick={() => playOffline(entry)}
                >
                  Play offline
                </Button>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Downloads;
