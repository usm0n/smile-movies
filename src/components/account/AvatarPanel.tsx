import { Avatar, Box, Typography } from "@mui/joy";
import { useRef, useState } from "react";
import Button from "../ui/Button";
import Panel from "../ui/Panel";
import Dialog from "../ui/Dialog";
import { toast } from "../ui/toast";
import AvatarEditor from "./AvatarEditor";
import { connectorsAPI } from "../../service/api/smb/connectors.api.service";
import type { User } from "../../user";

/**
 * Avatar section of Settings.
 *
 * Picking a file opens the crop/zoom editor rather than uploading immediately,
 * and removing goes through the dedicated delete endpoint so the object is
 * actually removed from Firebase Storage instead of merely unlinked.
 */

const MAX_INPUT_BYTES = 12 * 1024 * 1024;

function AvatarPanel({
  user,
  onChange,
}: {
  user: User;
  onChange: (profilePic: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset immediately so re-picking the same file still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("That image is over 12MB. Pick a smaller one.");
      return;
    }
    setPending(file);
  };

  const handleSave = async (base64: string, mimeType: string) => {
    setUploading(true);
    try {
      const result = await connectorsAPI.uploadAvatar(base64, mimeType);
      onChange(result.url);
      setPending(null);
    } catch {
      // The API interceptor has already surfaced the message.
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await connectorsAPI.deleteAvatar();
      onChange("");
      setConfirmRemove(false);
    } catch {
      // Already surfaced.
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <Panel
        title="Avatar"
        description="Shown on your profile, reviews and watch party. We crop it square and compress it before uploading."
        footerHint="JPG, PNG, WebP or GIF. Up to 12MB before compression."
        footer={
          <>
            {user?.profilePic && (
              <Button
                variant="outlined"
                color="danger"
                loading={removing}
                onClick={() => setConfirmRemove(true)}
              >
                Remove
              </Button>
            )}
            <Button
              variant="outlined"
              color="neutral"
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {user?.profilePic ? "Change" : "Upload"}
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            src={user?.profilePic || undefined}
            sx={{
              width: 72,
              height: 72,
              borderRadius: "999px",
              fontSize: "1.4rem",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
            }}
          >
            {user?.firstname?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography level="body-sm">
              {user?.profilePic
                ? "Your avatar is set. Upload a new image to re-crop it."
                : "No avatar yet — we show your initial instead."}
            </Typography>
            <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
              Stored at 512×512.
            </Typography>
          </Box>
        </Box>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePick}
        />
      </Panel>

      <AvatarEditor
        open={Boolean(pending)}
        file={pending}
        onCancel={() => setPending(null)}
        onSave={handleSave}
      />

      <Dialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove avatar?"
        description="The image is deleted from storage and cannot be recovered."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </Button>
            <Button color="danger" loading={removing} onClick={handleRemove}>
              Remove avatar
            </Button>
          </>
        }
      />
    </>
  );
}

export default AvatarPanel;
