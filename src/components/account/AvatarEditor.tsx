import { Box, Slider, Typography } from "@mui/joy";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import IconButton from "../ui/IconButton";
import { Replay } from "../ui/icons";
import { toast } from "../ui/toast";
import {
  CropTransform,
  cropAndCompress,
  formatBytes,
  loadImage,
} from "../../utilities/imageCompression";

/**
 * Crop-and-zoom avatar editor.
 *
 * The image is laid out to cover a square viewport; the user drags to pan and
 * uses the slider (or wheel) to zoom. Panning is clamped so the image can never
 * be dragged away from under the crop circle, which is what makes the result
 * predictable without needing an explicit "fit" mode. The crop is rendered and
 * compressed on the client, so what leaves the browser is already a small
 * square image.
 */

const VIEWPORT = 288;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function AvatarEditor({
  open,
  file,
  onCancel,
  onSave,
}: {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onSave: (base64: string, mimeType: string) => Promise<void> | void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);

  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open || !file) return;

    let cancelled = false;
    setLoading(true);
    setEstimate(null);
    reset();

    loadImage(file)
      .then((loaded) => {
        if (!cancelled) setImage(loaded);
      })
      .catch((error: Error) => {
        if (!cancelled) toast.error(error.message);
        onCancel();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file, onCancel, open, reset]);

  /**
   * At scale 1 the image exactly covers the viewport, so there is no slack in
   * at least one axis; beyond that the overhang in each axis is what the user
   * may pan across.
   */
  const bounds = useMemo(() => {
    if (!image) return { x: 0, y: 0 };
    const cover = Math.max(
      VIEWPORT / image.naturalWidth,
      VIEWPORT / image.naturalHeight,
    );
    const width = image.naturalWidth * cover * scale;
    const height = image.naturalHeight * cover * scale;
    return {
      x: Math.max(0, (width - VIEWPORT) / 2),
      y: Math.max(0, (height - VIEWPORT) / 2),
    };
  }, [image, scale]);

  const clamp = useCallback(
    (next: { x: number; y: number }) => ({
      x: Math.min(bounds.x, Math.max(-bounds.x, next.x)),
      y: Math.min(bounds.y, Math.max(-bounds.y, next.y)),
    }),
    [bounds],
  );

  useEffect(() => {
    setOffset((current) => clamp(current));
  }, [clamp]);

  const transform: CropTransform = {
    scale,
    offsetX: offset.x,
    offsetY: offset.y,
    viewport: VIEWPORT,
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset(
      clamp({
        x: drag.ox + (event.clientX - drag.x),
        y: drag.oy + (event.clientY - drag.y),
      }),
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!image) return;
    const next = scale - event.deltaY * 0.002;
    setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)));
  };

  const handleSave = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const result = await cropAndCompress(image, transform);
      setEstimate(result.bytes);
      await onSave(result.base64, result.mimeType);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not process that image",
      );
    } finally {
      setSaving(false);
    }
  };

  const backgroundStyle = image
    ? {
        backgroundImage: `url(${image.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${
          Math.max(
            VIEWPORT / image.naturalWidth,
            VIEWPORT / image.naturalHeight,
          ) *
          scale *
          image.naturalWidth
        }px auto`,
        backgroundPosition: `calc(50% + ${offset.x}px) calc(50% + ${offset.y}px)`,
      }
    : {};

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Adjust your avatar"
      description="Drag to reposition, scroll or use the slider to zoom. We crop and compress it before uploading."
      width={420}
      actions={
        <>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!image} onClick={handleSave}>
            Save avatar
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={handleWheel}
          sx={{
            position: "relative",
            width: VIEWPORT,
            height: VIEWPORT,
            mx: "auto",
            maxWidth: "100%",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            backgroundColor: "background.level1",
            cursor: image ? "grab" : "default",
            touchAction: "none",
            overflow: "hidden",
            "&:active": { cursor: image ? "grabbing" : "default" },
            ...backgroundStyle,
          }}
        >
          {/* Circular mask: everything outside the crop circle is dimmed. */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          />
          {loading && (
            <Typography
              level="body-sm"
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
              }}
            >
              Loading image…
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography level="body-xs" sx={{ color: "text.tertiary", width: 34 }}>
            Zoom
          </Typography>
          <Slider
            value={scale}
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.01}
            onChange={(_, value) => setScale(value as number)}
            disabled={!image}
            sx={{ flex: 1 }}
          />
          <IconButton label="Reset crop" size="sm" onClick={reset} disabled={!image}>
            <Replay sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
          {estimate
            ? `Compressed to ${formatBytes(estimate)}.`
            : "Saved at 512×512 and compressed to roughly 100–200 KB."}
        </Typography>
      </Box>
    </Dialog>
  );
}

export default AvatarEditor;
