import { Box, Typography } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { WarningRounded } from "../ui/icons";

/**
 * Camera QR scanner built on the native `BarcodeDetector`.
 *
 * No decoding library: Chrome, Edge and Android WebView ship the detector, and
 * those cover the devices people actually sign in on this way. Safari and
 * Firefox have no implementation, so `isQRScanSupported` is false there and
 * every caller keeps its paste field as the way through.
 */

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): BarcodeDetectorLike;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

export const isQRScanSupported = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.BarcodeDetector === "function" &&
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia;

const SCAN_INTERVAL_MS = 250;

function QRScanner({
  onScan,
  onClose,
  height = 260,
}: {
  onScan: (value: string) => void;
  onClose?: () => void;
  height?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  // The scan loop fires every 250ms; without this a code sitting in frame
  // would be reported over and over while the caller is still handling it.
  const handledRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const stop = () => {
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    (async () => {
      if (!isQRScanSupported()) {
        setError("This browser can't use the camera to scan. Paste the link instead.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // Rear camera where there is one; harmless on laptops.
          video: { facingMode: "environment" },
        });
        if (cancelled) { stop(); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          const video = videoRef.current;
          if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;
          if (handledRef.current) return;
          try {
            const codes = await detector.detect(video);
            const value = codes[0]?.rawValue;
            if (value) {
              handledRef.current = true;
              stop();
              onScan(value);
            }
          } catch {
            // A single failed frame is not worth reporting; the next one runs
            // 250ms later.
          }
        }, SCAN_INTERVAL_MS);
      } catch (cameraError) {
        const name = (cameraError as DOMException)?.name;
        setError(
          name === "NotAllowedError"
            ? "Camera access was blocked. Allow it in your browser, or paste the link instead."
            : "No camera available. Paste the link instead.",
        );
      }
    })();

    return () => { cancelled = true; stop(); };
  }, [onScan]);

  if (error) {
    return (
      <Box
        sx={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 1, textAlign: "center",
          height, px: 2, borderRadius: "md",
          border: "1px solid", borderColor: "neutral.outlinedBorder",
          backgroundColor: "background.level1",
        }}
      >
        <WarningRounded sx={{ fontSize: 20, color: "warning.plainColor" }} />
        <Typography level="body-sm">{error}</Typography>
        {onClose && (
          <Button size="sm" variant="outlined" color="neutral" onClick={onClose}>
            Close
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          position: "relative", height, borderRadius: "md", overflow: "hidden",
          backgroundColor: "common.black",
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Framing guide — the detector reads the whole frame, this just tells
            the user where to hold the code. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute", inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            width: "60%", aspectRatio: "1 / 1",
            border: "2px solid rgba(255,255,255,0.9)", borderRadius: "md",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
          Point the camera at the QR code.
        </Typography>
        {onClose && (
          <Button size="sm" variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default QRScanner;
