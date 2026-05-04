import {
  Box,
  Button,
  Card,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Skeleton,
  Typography,
} from "@mui/joy";
import { Add, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collectionsAPI, Collection } from "../service/api/smb/collections.api.service";
import Container from "../utilities/Container";
import { useUsers } from "../context/Users";

function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUsers();

  useEffect(() => {
    if (!isAuthenticated) return;
    collectionsAPI
      .getAll()
      .then((d) => setCollections(d.collections))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const create = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const d = await collectionsAPI.create(newName.trim());
      setCollections((prev) => [...prev, d.collection]);
      setNewName("");
      setCreating(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await collectionsAPI.delete(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography level="h2">My Lists</Typography>
          <Button
            startDecorator={<Add />}
            onClick={() => setCreating(true)}
          >
            New List
          </Button>
        </Box>

        {/* Create list dialog */}
        <Modal open={creating} onClose={() => setCreating(false)}>
          <ModalDialog sx={{ maxWidth: 400 }}>
            <Typography level="h4" sx={{ mb: 2 }}>
              Create a new list
            </Typography>
            <Input
              autoFocus
              placeholder="List name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth onClick={create} loading={saving}>
                Create
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="neutral"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: "md" }} />
            ))}
          </Box>
        ) : collections.length === 0 ? (
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
              No lists yet
            </Typography>
            <Typography level="body-md" sx={{ color: "text.tertiary", mb: 1 }}>
              Create lists to organise movies and shows you want to watch.
            </Typography>
            <Button startDecorator={<Add />} onClick={() => setCreating(true)}>
              Create your first list
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {collections.map((col) => (
              <Card
                key={col.id}
                onClick={() => navigate(`/collections/${col.id}`)}
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "md",
                  },
                }}
              >
                {/* Poster grid preview */}
                {col.items.length > 0 ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2px",
                      borderRadius: "sm",
                      overflow: "hidden",
                      mb: 1.5,
                      height: 120,
                    }}
                  >
                    {col.items.slice(0, 4).map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          overflow: "hidden",
                        }}
                      >
                        {item.poster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${item.poster}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              background: "rgba(255,255,255,0.08)",
                            }}
                          />
                        )}
                      </Box>
                    ))}
                    {/* Fill empty slots */}
                    {col.items.length < 4 &&
                      Array.from({ length: 4 - Math.min(col.items.length, 4) }).map((_, i) => (
                        <Box
                          key={`empty-${i}`}
                          sx={{ background: "rgba(255,255,255,0.05)" }}
                        />
                      ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 120,
                      borderRadius: "sm",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      Empty
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography level="title-md" noWrap sx={{ maxWidth: 160 }}>
                      {col.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {col.items.length} title{col.items.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={(e) => remove(col.id, e)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Collections;
