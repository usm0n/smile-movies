import {
  Button,
  Box,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import {
  Check,
  Favorite,
  MoodBad,
  ThumbUp,
} from "@mui/icons-material";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useUsers } from "./Users";
import { SavedMediaPreference, SavedMediaStatus, User } from "../user";

type PromptStatus = Exclude<SavedMediaStatus, "favorite">;

type TastePromptPayload = {
  mediaId: string;
  mediaType: "movie" | "tv";
  poster?: string;
  title: string;
  duration?: number;
  currentTime?: number;
  season?: number;
  episode?: number;
  status: PromptStatus;
};

const TastePromptContext = createContext({
  openTastePrompt: (_payload: TastePromptPayload) => {},
  closeTastePrompt: () => {},
});

export const useTastePrompt = () => useContext(TastePromptContext);

export function TastePromptProvider({ children }: { children: React.ReactNode }) {
  const {
    addToFavorites,
    addToFavoritesData,
    addToWatchlist,
    addToWatchlistData,
    myselfData,
    removeFromFavorites,
    removeFromFavoritesData,
  } = useUsers();
  const [prompt, setPrompt] = useState<TastePromptPayload | null>(null);

  const favoriteItem = useMemo(
    () => (myselfData?.data as User | undefined)?.favorites?.find(
      (item) => prompt && item.id == prompt.mediaId && item.type === prompt.mediaType,
    ),
    [myselfData?.data, prompt],
  );
  const watchlistItem = useMemo(
    () => (myselfData?.data as User | undefined)?.watchlist?.find(
      (item) => prompt && item.id == prompt.mediaId && item.type === prompt.mediaType,
    ),
    [myselfData?.data, prompt],
  );

  const closeTastePrompt = () => setPrompt(null);
  const openTastePrompt = (payload: TastePromptPayload) => setPrompt(payload);

  const isLoading =
    myselfData?.isLoading ||
    addToWatchlistData?.isLoading ||
    addToFavoritesData?.isLoading ||
    removeFromFavoritesData?.isLoading;

  const handlePreference = async (preference: SavedMediaPreference) => {
    if (!prompt) return;

    if (preference === "dislike") {
      await addToWatchlist(
        prompt.mediaType,
        prompt.mediaId,
        prompt.poster || "",
        prompt.title,
        prompt.status,
        watchlistItem?.duration || prompt.duration || 0,
        watchlistItem?.currentTime || prompt.currentTime || 0,
        watchlistItem?.season || prompt.season || 0,
        watchlistItem?.episode || prompt.episode || 0,
        "dislike",
      );
      if (favoriteItem) {
        await removeFromFavorites(prompt.mediaType, prompt.mediaId);
      }
    } else {
      await addToFavorites(
        prompt.mediaType,
        prompt.mediaId,
        prompt.poster || "",
        prompt.title,
        prompt.status,
        watchlistItem?.duration || prompt.duration || 0,
        watchlistItem?.currentTime || prompt.currentTime || 0,
        watchlistItem?.season || prompt.season || 0,
        watchlistItem?.episode || prompt.episode || 0,
        preference,
      );
    }

    closeTastePrompt();
  };

  return (
    <TastePromptContext.Provider value={{ openTastePrompt, closeTastePrompt }}>
      {children}
      <Modal open={!!prompt} onClose={closeTastePrompt}>
        <ModalDialog sx={{ maxWidth: 420 }}>
          <ModalClose />
          <DialogTitle>How did it feel?</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography level="body-sm" textColor="neutral.400">
              {prompt ? (
                <>
                  You saved <strong>{prompt.title}</strong> as{" "}
                  {prompt.status === "watching" ? "watching" : "watched"}.
                  Add a quick reaction so recommendations improve.
                </>
              ) : null}
            </Typography>
            <Box sx={{ display: "grid", gap: 1 }}>
              <Button
                color="danger"
                variant="soft"
                startDecorator={<Favorite />}
                disabled={isLoading}
                onClick={() => handlePreference("love")}
              >
                Loved it
              </Button>
              <Button
                color="primary"
                variant="soft"
                startDecorator={<ThumbUp />}
                disabled={isLoading}
                onClick={() => handlePreference("like")}
              >
                Liked it
              </Button>
              <Button
                color="warning"
                variant="soft"
                startDecorator={<MoodBad />}
                disabled={isLoading}
                onClick={() => handlePreference("dislike")}
              >
                Not for me
              </Button>
              <Button
                variant="plain"
                startDecorator={<Check />}
                disabled={isLoading}
                onClick={closeTastePrompt}
              >
                Skip for now
              </Button>
            </Box>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </TastePromptContext.Provider>
  );
}
