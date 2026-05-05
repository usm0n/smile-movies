import {
  Box,
  Button,
  IconButton,
  Input,
  Skeleton,
  Typography,
} from "@mui/joy";
import { ArrowBackIos, Edit, Check, Close } from "@mui/icons-material";
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
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!collectionId) return;
    // Try getById first, fall back to getAll if endpoint doesn't exist yet
    collectionsAPI
      .getById(collectionId)
      .then((d) => setCollection(d.collection))
      .catch(() =>
        collectionsAPI.getAll().then((d) => {
          const found = d.collections.find((c) => c.id === collectionId);
          setCollection(found || null);
        }),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionId]);

  const removeItem = async (item: CollectionItem) => {
    if (!collectionId || !collection) return;
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

  const saveRename = async () => {
    if (!collectionId || !newName.trim()) return;
    setSavingName(true);
    try {
      await collectionsAPI.rename(collectionId, newName.trim());
      setCollection((prev) => prev ? { ...prev, name: newName.trim() } : prev);
      setRenaming(false);
    } catch {
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
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
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton variant="outlined" onClick={() => navigate("/collections")}>
            <ArrowBackIos />
          </IconButton>
          {renaming ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveRename()}
                sx={{ flex: 1, maxWidth: 320 }}
              />
              <IconButton
                size="sm"
                color="success"
                variant="solid"
                onClick={saveRename}
                loading={savingName}
              >
                <Check />
              </IconButton>
              <IconButton size="sm" variant="outlined" onClick={() => setRenaming(false)}>
                <Close />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Box>
                <Typography level="h2">{collection.name}</Typography>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  {collection.items.length} title{collection.items.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <IconButton
                size="sm"
                variant="plain"
                sx={{ ml: 1 }}
                onClick={() => { setNewName(collection.name); setRenaming(true); }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          )}
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
              Add movies and TV shows by clicking the ⋮ menu on any card and choosing "Add to list".
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
