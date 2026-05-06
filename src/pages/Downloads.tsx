import {
  Box,
  Button,
  Card,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/joy";
import { Delete, PlayArrow, Download as DownloadIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../utilities/Container";
import toast from "react-hot-toast";

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
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <DownloadIcon sx={{ fontSize: 32, color: "rgb(255,220,92)" }} />
          <Typography level="h2">Downloads</Typography>
        </Box>

        {loading ? (
          <Typography sx={{ color: "text.tertiary" }}>
            Loading downloads...
          </Typography>
        ) : items.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <DownloadIcon sx={{ fontSize: 64, color: "text.tertiary", mb: 1 }} />
            <Typography level="h3" sx={{ color: "text.tertiary" }}>
              No downloads yet
            </Typography>
            <Typography
              level="body-md"
              sx={{ color: "text.tertiary", maxWidth: 400 }}
            >
              Use the Download button on any movie or episode page to save
              content for offline viewing. MP4 sources only.
            </Typography>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Browse titles
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {items.map((entry) => (
              <Card key={entry.cacheKey} variant="outlined">
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
                  <Tooltip title="Delete download">
                    <IconButton
                      size="sm"
                      color="danger"
                      variant="plain"
                      onClick={() => remove(entry)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  startDecorator={<PlayArrow />}
                  size="sm"
                  sx={{ mt: 1 }}
                  onClick={() => playOffline(entry)}
                >
                  Play
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
