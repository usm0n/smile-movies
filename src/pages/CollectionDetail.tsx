import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/joy";
import {
  ArrowBackIos,
  AutoAwesome,
  Check,
  Close,
  PlaylistAdd,
} from "../components/ui/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collectionsAPI,
  Collection,
  CollectionItem,
} from "../service/api/smb/collections.api.service";
import Container from "../utilities/Container";
import EventMC from "../components/cards/EventMC";
import AISuggestions from "../components/ai/AISuggestions";
import { aiService } from "../service/api/ai/ai.api.service";
import {
  ResolvedMedia,
  resolveSuggestedMediaList,
} from "../utilities/resolveSuggestedMedia";

function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ResolvedMedia[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [addingKey, setAddingKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!collectionId) return;
    collectionsAPI
      .getById(collectionId)
      .then((d) => setCollection(d.collection))
      .catch(() =>
        collectionsAPI.getAll().then((d) => {
          const found = d.collections.find((c) => c.id === collectionId);
          setCollection(found || null);
        }).catch(() => {})
      )
      .finally(() => setLoading(false));
  }, [collectionId]);

  /**
   * The list's name is the brief. "Rainy Sunday" or "Films Dad would actually
   * sit through" carry intent no genre filter captures, so the name and the
   * current contents are all the assistant gets — and what is already in the
   * list is sent so it does not suggest the same things back.
   */
  const suggestTitles = useCallback(async () => {
    if (!collection) return;

    setSuggestOpen(true);
    setSuggestLoading(true);
    setSuggestError("");
    setSuggestions([]);

    try {
      const result = await aiService.collectionFill({
        listName: collection.name,
        existingTitles: collection.items
          .map((item) => item.title || "")
          .filter(Boolean),
      });

      const resolved = await resolveSuggestedMediaList(result.titles);
      const alreadyHere = new Set(
        collection.items.map((item) => `${item.type}:${item.id}`),
      );

      // The model works from titles and can land on something already in the
      // list under a different name, so filter again once ids are known.
      setSuggestions(
        resolved.filter((media) => !alreadyHere.has(`${media.mediaType}:${media.id}`)),
      );
    } catch {
      setSuggestError("Couldn't come up with anything for this list right now.");
    } finally {
      setSuggestLoading(false);
    }
  }, [collection]);

  const addSuggestion = async (media: ResolvedMedia) => {
    if (!collectionId) return;
    const key = `${media.mediaType}:${media.id}`;
    setAddingKey(key);

    try {
      await collectionsAPI.addItem(collectionId, {
        id: String(media.id),
        type: media.mediaType,
        title: media.title,
        poster: media.posterPath,
      });

      setAddedKeys((prev) => new Set([...prev, key]));
      setCollection((prev) =>
        prev
          ? {
              ...prev,
              items: [
                ...prev.items,
                {
                  id: String(media.id),
                  type: media.mediaType,
                  title: media.title,
                  poster: media.posterPath,
                },
              ],
            }
          : prev,
      );
    } catch {
      setSuggestError(`Couldn't add ${media.title} to the list.`);
    } finally {
      setAddingKey("");
    }
  };

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
        <Box sx={{ pt: "calc(var(--sm-nav-height) + 48px)", pb: 8, display: "flex", flexDirection: "column", gap: 3, minHeight: "100vh" }}>
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
      <Box sx={{ pt: "calc(var(--sm-nav-height) + 48px)", pb: 8, display: "flex", flexDirection: "column", gap: 3, minHeight: "100vh" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton aria-label="Back to lists"
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

          <Button
            variant="outlined"
            color="neutral"
            size="sm"
            sx={{ ml: "auto" }}
            loading={suggestLoading}
            startDecorator={
              suggestOpen && !suggestLoading ? (
                <Close sx={{ fontSize: 15 }} />
              ) : (
                <AutoAwesome sx={{ fontSize: 15 }} />
              )
            }
            onClick={() =>
              suggestOpen && !suggestLoading ? setSuggestOpen(false) : void suggestTitles()
            }
          >
            {suggestOpen && !suggestLoading ? "Hide suggestions" : "Suggest titles"}
          </Button>
        </Box>

        {suggestOpen && (
          <AISuggestions
            heading={`Titles that would fit "${collection.name}"`}
            items={suggestions}
            loading={suggestLoading}
            error={suggestError}
            onRetry={() => void suggestTitles()}
            emptyMessage="Nothing new to add — this list already covers the ground."
            renderItemAction={(media) => {
              const key = `${media.mediaType}:${media.id}`;
              const added = addedKeys.has(key);

              return (
                <Button
                  size="sm"
                  variant={added ? "soft" : "outlined"}
                  color={added ? "success" : "neutral"}
                  fullWidth
                  disabled={added}
                  loading={addingKey === key}
                  startDecorator={
                    added ? (
                      <Check sx={{ fontSize: 14 }} />
                    ) : (
                      <PlaylistAdd sx={{ fontSize: 14 }} />
                    )
                  }
                  onClick={() => void addSuggestion(media)}
                >
                  {added ? "Added" : "Add to list"}
                </Button>
              );
            }}
          />
        )}

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
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              <Button
                variant="outlined"
                startDecorator={<AutoAwesome sx={{ fontSize: 15 }} />}
                loading={suggestLoading}
                onClick={() => void suggestTitles()}
              >
                Suggest titles
              </Button>
              <Button variant="plain" color="neutral" onClick={() => navigate("/")}>
                Browse titles
              </Button>
            </Box>
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
