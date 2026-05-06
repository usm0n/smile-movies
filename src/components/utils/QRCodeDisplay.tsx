import { Box } from "@mui/joy";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  size?: number;
}

// Uses qrcodejs loaded via dynamic script — no package install needed
declare global {
  interface Window {
    QRCode: any;
  }
}

function QRCodeDisplay({ value, size = 180 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const loadAndRender = () => {
      if (!ref.current) return;
      if (instanceRef.current) {
        instanceRef.current.clear();
        instanceRef.current.makeCode(value);
        return;
      }
      instanceRef.current = new window.QRCode(ref.current, {
        text: value,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };

    if (window.QRCode) {
      loadAndRender();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = loadAndRender;
    document.head.appendChild(script);
  }, [value, size]);

  return (
    <Box
      sx={{
        p: 1.5,
        background: "white",
        borderRadius: "md",
        display: "inline-block",
        lineHeight: 0,
      }}
    >
      <div ref={ref} />
    </Box>
  );
}

export default QRCodeDisplay;
