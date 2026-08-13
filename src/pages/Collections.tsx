import { Box, Input, Typography } from "@mui/joy";
import { Add, Delete, Layers } from "../components/ui/icons";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Dialog from "../components/ui/Dialog";
import Field from "../components/ui/Field";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Shimmer } from "../components/ui/Skeleton";
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
    if (!isAuthenticated) { setLoading(false); return; }
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
          title="My lists"
          description="Group titles however you like — a marathon, a watch party, a maybe pile."
          actions={
            <Button startDecorator={<Add sx={{ fontSize: 16 }} />} onClick={() => setCreating(true)}>
              New list
            </Button>
          }
        />

        <Dialog
          open={creating}
          onClose={() => setCreating(false)}
          title="Create a new list"
          width={400}
          actions={
            <>
              <Button variant="outlined" color="neutral" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button onClick={create} loading={saving} disabled={!newName.trim()}>
                Create list
              </Button>
            </>
          }
        >
          <Field label="List name">
            <Input
              autoFocus
              placeholder="e.g. Weekend marathon"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
          </Field>
        </Dialog>

        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} height={190} radius={12} />
            ))}
          </Box>
        ) : collections.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No lists yet"
            description="Lists are a tidy way to organise the movies and shows you want to watch."
            action={
              <Button startDecorator={<Add sx={{ fontSize: 16 }} />} onClick={() => setCreating(true)}>
                Create your first list
              </Button>
            }
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {collections.map((col) => (
              <Box
                key={col.id}
                onClick={() => navigate(`/collections/${col.id}`)}
                sx={{
                  cursor: "pointer",
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "lg",
                  backgroundColor: "background.surface",
                  transition: "border-color 150ms ease, background-color 150ms ease",
                  "&:hover": { borderColor: "#333", backgroundColor: "background.level1" },
                }}
              >
                {/* Poster grid preview */}
                {col.items.length > 0 ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      mb: 1.5,
                      height: 132,
                      border: "1px solid",
                      borderColor: "neutral.outlinedBorder",
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
                      height: 132,
                      borderRadius: "8px",
                      backgroundColor: "background.level1",
                      border: "1px dashed",
                      borderColor: "neutral.outlinedBorder",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography level="body-xs">Empty list</Typography>
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
                    <Typography level="body-xs">
                      {col.items.length} title{col.items.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    label={`Delete ${col.name}`}
                    size="sm"
                    color="danger"
                    onClick={(e) => remove(col.id, e)}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Collections;
