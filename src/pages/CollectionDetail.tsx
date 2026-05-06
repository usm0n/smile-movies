import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/joy";
import { ArrowBackIos } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collectionsAPI,
  Collection,
  CollectionItem,
} from "../service/api/smb/collections.api.service";
import Container from "../utilities/Container";
import EventMC from "../components/cards/EventMC";

function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!collectionId) return;
    collectionsAPI
      .getAll()
      .then((d) => {
        const found = d.collections.find((c) => c.id === collectionId);
        setCollection(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionId]);

  const removeItem = async (item: CollectionItem) => {
    if (!collectionId) return;
    await collectionsAPI.removeItem(collectionId, item.id, item.type);
    setCollection((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter(
              (i) => !(i.id === item.id && i.type === item.type),
            ),
          }
        : prev,
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ padding: "100px 0px", display: "flex", flexDirection: "column", gap: "28px", minHeight: "100vh" }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={200}
                height={300}
                sx={{ borderRadius: "md" }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  if (!collection) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography level="h3">List not found</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/collections")}>
            Back to Lists
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ padding: "100px 0px", display: "flex", flexDirection: "column", gap: "28px", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton
            variant="outlined"
            onClick={() => navigate("/collections")}
          >
            <ArrowBackIos />
          </IconButton>
          <Box>
            <Typography level="h2">{collection.name}</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {collection.items.length} title
              {collection.items.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        {collection.items.length === 0 ? (
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
            <Typography level="h3" sx={{ color: "text.tertiary" }}>
              This list is empty
            </Typography>
            <Typography level="body-md" sx={{ color: "text.tertiary" }}>
              Add movies and TV shows by right-clicking (or long-pressing) any
              title and choosing "Add to list".
            </Typography>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Browse titles
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {collection.items.map((item) => (
              <Box key={`${item.type}-${item.id}`} sx={{ position: "relative" }}>
                <EventMC
                  eventId={item.id}
                  eventType={item.type}
                  eventPoster={item.poster || ""}
                  eventTitle={item.title}
                  eventDelete={() => removeItem(item)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default CollectionDetail;
