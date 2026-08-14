/**
 * Client-side avatar cropping and compression.
 *
 * Everything happens before upload: the image is cropped to the visible circle,
 * downscaled to `OUTPUT_SIZE`, and re-encoded, stepping the quality down until
 * it fits the byte budget. That keeps a 12MP phone photo from turning into a
 * multi-megabyte object in Storage and a slow avatar on every page.
 */

/** Rendered avatars are never larger than 128px, so 512 covers 4x displays. */
export const OUTPUT_SIZE = 512;
const MAX_OUTPUT_BYTES = 220 * 1024;
const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

export interface CropTransform {
  /** Zoom factor, where 1 fits the shorter edge to the crop circle. */
  scale: number;
  /** Pan offset in *displayed* pixels, relative to centre. */
  offsetX: number;
  offsetY: number;
  /** Size in pixels of the square crop viewport the user was looking at. */
  viewport: number;
}

export interface CompressedImage {
  /** Base64 payload without the `data:` prefix, ready to POST. */
  base64: string;
  mimeType: string;
  bytes: number;
  previewUrl: string;
}

/** Safari below 16.4 cannot encode WebP from a canvas; fall back to JPEG. */
const pickOutputType = (canvas: HTMLCanvasElement): string =>
  canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That file could not be read"));
    reader.readAsDataURL(file);
  });

/**
 * Resolves to a decoded image whose `src` stays valid for the lifetime of the
 * editor — the crop preview paints it as a CSS background, so an object URL
 * that gets revoked after decode would leave the preview blank.
 */
export const loadImage = async (
  source: File | string,
): Promise<HTMLImageElement> => {
  const url = typeof source === "string" ? source : await fileToDataUrl(source);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("That file could not be read as an image"));
    image.src = url;
  });
};

/**
 * Reproduces on the output canvas exactly what the editor showed: the image is
 * laid out to cover the viewport at scale 1, then zoomed and panned by the same
 * factors, so the crop matches the preview pixel for pixel.
 */
export const renderCrop = (
  image: HTMLImageElement,
  transform: CropTransform,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  // Flatten onto white so a transparent PNG does not become a black square
  // once it is encoded as JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const ratio = OUTPUT_SIZE / transform.viewport;
  const cover = Math.max(
    transform.viewport / image.naturalWidth,
    transform.viewport / image.naturalHeight,
  );
  const drawScale = cover * transform.scale * ratio;
  const drawWidth = image.naturalWidth * drawScale;
  const drawHeight = image.naturalHeight * drawScale;
  const drawX = (OUTPUT_SIZE - drawWidth) / 2 + transform.offsetX * ratio;
  const drawY = (OUTPUT_SIZE - drawHeight) / 2 + transform.offsetY * ratio;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  return canvas;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not encode the image"));
    reader.readAsDataURL(blob);
  });

/** Encodes the canvas, lowering quality until it fits the byte budget. */
export const compressCanvas = async (
  canvas: HTMLCanvasElement,
): Promise<CompressedImage> => {
  const mimeType = pickOutputType(canvas);
  let chosen: Blob | null = null;

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, mimeType, quality);
    if (!blob) continue;
    chosen = blob;
    if (blob.size <= MAX_OUTPUT_BYTES) break;
  }

  if (!chosen) throw new Error("Could not compress that image");

  return {
    base64: await blobToBase64(chosen),
    mimeType,
    bytes: chosen.size,
    previewUrl: canvas.toDataURL(mimeType, 0.85),
  };
};

export const cropAndCompress = async (
  image: HTMLImageElement,
  transform: CropTransform,
): Promise<CompressedImage> => compressCanvas(renderCrop(image, transform));

export const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
